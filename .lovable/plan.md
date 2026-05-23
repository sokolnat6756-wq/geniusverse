# Pivot to External ChatGPT Access Hub

The dashboard becomes a closed members area that hands out links to Custom GPTs. No internal AI chat for now.

## 1. Database

Migration:
- `ALTER TABLE public.geniuses ADD COLUMN chatgpt_url text;`
- Seed all 17 existing geniuses with placeholder: `UPDATE public.geniuses SET chatgpt_url = 'https://chat.openai.com/g/g-placeholder' WHERE chatgpt_url IS NULL;`

RLS unchanged (public read already allows anon to see the column). No schema changes elsewhere.

## 2. Types & access layer

- `src/lib/access.ts` — add `chatgpt_url: string | null` to the `Genius` interface.
- `src/integrations/supabase/types.ts` regenerates automatically after the migration.
- `src/lib/public-data.functions.ts` — include `chatgpt_url` in the select (verify; likely `select('*')`, no change needed).

## 3. GeniusCard

`src/components/GeniusCard.tsx`:
- When `unlocked`: replace the `<Link to="/chat-placeholder">` block with an `<a href={genius.chatgpt_url ?? '#'} target="_blank" rel="noopener noreferrer">` wrapping the same gradient button. Button label: **«Открыть в ChatGPT»** with an external-link icon (`ExternalLink` from lucide). If `chatgpt_url` is null, disable the button with tooltip "Ссылка скоро будет".
- Locked state unchanged: «Открыть доступ» → `onUnlockClick`.

No design/layout/typography changes — same button styling, just different content + anchor.

## 4. Remove internal chat route

- Delete `src/routes/_authenticated/chat-placeholder.tsx`. TanStack Router regenerates the route tree.
- Grep for any remaining `to="/chat-placeholder"` references and remove (should only be GeniusCard after the edit).

## 5. Dashboard

`src/routes/_authenticated/dashboard.tsx`:
- Picker dialog: after `selectOneGenius` succeeds, no navigation change needed (it just refreshes dashboard).
- No other changes — dashboard already renders `GeniusCard` which now opens external links.

## 6. Untouched

- Auth, RLS, plans, mock checkout, `isGeniusUnlocked` logic, pricing page, landing page, glassmorphism design, icons, gradients.

## Technical notes

- Anchor must use `target="_blank" rel="noopener noreferrer"` for security.
- `chatgpt_url` is nullable so future per-genius URLs can be filled in via SQL without code changes.
- Later swap to internal chat by reverting GeniusCard's button to a `<Link>` — single-file change.
