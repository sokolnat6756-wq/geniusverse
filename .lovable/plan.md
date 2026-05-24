## Plan: Fix Critical RLS Privilege Escalation

### Root cause
Subscriptions and access records are currently INSERT/UPDATE-able by users themselves via RLS policies (`own sub insert/update`, `own access insert/update`). The mock "checkout" server function uses the user-scoped Supabase client, so removing those policies would also break checkout. Fix: move every write to a server function that uses the **admin** client (RLS bypass + server-side validation), then drop the unsafe user policies.

### Changes

**1. Database migration (RLS hardening)**
- DROP policies: `own sub insert`, `own sub update` on `subscriptions`
- DROP policies: `own access insert`, `own access update`, `own access delete` on `user_genius_access`
- Keep: `own sub select`, `own access select` (users still need to read their own rows)
- Keep all admin policies
- REVOKE EXECUTE ON FUNCTION `public.handle_new_user()` FROM PUBLIC, anon, authenticated (only the auth trigger calls it; runs as definer regardless)
- REVOKE EXECUTE ON FUNCTION `public.has_role(uuid, app_role)` FROM PUBLIC, anon; GRANT EXECUTE to authenticated only (needed by RLS policies)

**2. Server function changes (`src/lib/subscription.functions.ts`)**
- `activateMockSubscription`: switch from user-scoped `supabase` to `supabaseAdmin` for the cancel/insert writes. Still gated by `requireSupabaseAuth` so `userId` comes from a verified bearer token. Server-side enforces `user_id = context.userId` — users cannot forge another user's subscription.
- `selectOneGenius`: same change — use `supabaseAdmin` for the cancel/upsert writes, scoped to `context.userId`. Add a server-side check that the user's active subscription's plan permits the chosen genius (using `geniusSlugsForPlan` from `@/lib/access`). Prevents users from selecting a genius outside their plan.
- `getDashboardData` / `getCurrentSubscription` stay on the user-scoped client (reads only).

**3. No UI changes**
Checkout, dashboard, pricing, catalog, login, signup — untouched. Only the internal client used by two write handlers changes.

### Why this is safe
- `requireSupabaseAuth` verifies the bearer token before the handler runs, so `context.userId` is trusted.
- All writes are constrained to `context.userId` server-side.
- Admin/manual access via `/admin/users` continues to work (it already uses `supabaseAdmin`).
- Read paths and RLS read policies are unchanged → dashboard, catalog, pricing all keep working.
- `handle_new_user` runs as a trigger on `auth.users` (Supabase owner) — revoking PUBLIC EXECUTE does not break signup.
- `has_role` retains EXECUTE for `authenticated`, which is what RLS policies need.

### Verification
After the migration + code edits, re-run the Supabase security scan and report which findings cleared.
