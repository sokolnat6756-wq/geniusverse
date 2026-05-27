## Changes

### 1. Footer (`src/components/Footer.tsx`)
- Add new "Контакты" content: Telegram link rendered as "Поддержка / Telegram" pointing to `https://t.me/digital_izba` (target=_blank, rel=noopener), with a small Telegram/MessageCircle icon, styled with hover color transition matching existing footer link style.
- Under "Правовая информация" add a third link: **«Согласие на обработку персональных данных»** → `/consent`. Keep existing «Политика конфиденциальности» link → `/privacy` (already present).

### 2. New legal page `src/routes/consent.tsx`
- Create a placeholder page modeled exactly on `src/routes/privacy.tsx` (same Navbar/Footer, same typography, same container width).
- Title: «Согласие на обработку персональных данных».
- Sections: цели обработки, перечень данных, срок, право отзыва, контактный email. Marked as образец документа.
- Includes proper `head()` meta (title, description, og:title/description, canonical).

### 3. Registration consent (`src/routes/register.tsx`)
- Add a required Checkbox (shadcn `@/components/ui/checkbox`) above the submit button with label «Я соглашаюсь на обработку персональных данных», with inline link to `/consent`.
- Local state `consent: boolean` (default false). Submit button stays clickable but `handleSubmit` guards: if `!consent`, show `toast.error("Подтвердите согласие на обработку персональных данных")` and abort. Also `disabled={loading || !consent}` to keep UX clear.
- Layout: checkbox + label in a flex row, `items-start gap-2`, label uses `text-xs leading-relaxed text-muted-foreground`. Mobile-responsive (inherits form width).
- Keep existing legal microcopy below the button intact.

## Out of scope / preserved
- Auth flow, Supabase signup call, redirect logic, email verification — unchanged.
- Existing design tokens, gradients, glass panels — unchanged.
- No DB / RLS / server function changes.
- No changes to `/privacy`, `/offer`, or other routes.
