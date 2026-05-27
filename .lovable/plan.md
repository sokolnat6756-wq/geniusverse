## Founder section: redesign, make photo editable, move position

### Position change
Move the founder block so it sits **right after "Для кого Академия"** and **before "Каталог Гениев"** in `src/routes/index.tsx`. Current order will become:
1. Hero
2. Для кого Академия
3. **Основатель (redesigned)** ← new position
4. Каталог Гениев
5. Как это работает
6. Почему Академия Гениев
7. Тарифы
8. FAQ
9. Финальный CTA

### Backend (minimal)
- New `public.site_settings` (key text PK, value jsonb, updated_at). RLS:
  - public SELECT (so the landing page reads the founder photo URL)
  - INSERT/UPDATE only for admins via `has_role(auth.uid(),'admin')`
  - Seed row `key='founder'`, `value={ image_url: null }`
- Reuse existing public `genius-images` bucket; store under `founder/` prefix. Admin-only write policy scoped to that prefix (added in the same migration if not already permissive enough).

### Server functions
- `getFounderSettings()` — public read; fold result into landing data (either extend `getPublicCatalog` or add a parallel `queryOptions`).
- `updateFounderImage({ image_url | null })` — admin-only, upserts `site_settings`.

### Admin page
- New `src/routes/_authenticated/admin/settings.tsx` ("Настройки сайта"):
  - Shows current founder photo
  - Upload (browser-side to storage `genius-images/founder/<timestamp>.<ext>`) → calls `updateFounderImage`
  - "Удалить фото" clears it
- Add link to it from the existing admin navigation.

### Founder section UI (new design)
Premium two-column glass block, full-width container, soft ambient glows preserved.

```
┌──────────────────────────── glass-panel-strong, rounded-[2.5rem] ─────┐
│  LEFT (md:col-span-2)          │  RIGHT (md:col-span-3)               │
│  ┌──────────────────────────┐  │  chip "Личное слово основателя"      │
│  │  PHOTO (4/5, rounded-3xl │  │  H2  Идея, которая стала             │
│  │  ring-1, shadow-elegant) │  │       Академией Гениев               │
│  │  uploaded image OR       │  │  3 body paragraphs (new copy)        │
│  │  initials "ЮК" gradient  │  │                                      │
│  └──────────────────────────┘  │  ┌─ 3 feature mini-cards ─────────┐  │
│  Создатель Академии (xs,muted) │  │ Sparkles  Умные AI-помощники   │  │
│  Юлия Копасова (lg, semibold)  │  │ Target    Индивидуальный подход│  │
│                                │  │ Shield    Безопасное простр…   │  │
│                                │  └────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────────┤
│  Centered accent line, text-gradient, italic, medium:                  │
│  "Мечтайте. Учитесь. Действуйте. Будущее начинается сегодня."          │
└────────────────────────────────────────────────────────────────────────┘
```

Details:
- Copy exactly as provided (heading, 3 paragraphs, 3 feature blocks, accent line).
- No stock or AI-generated photo: when `image_url` is empty, render a tasteful gradient placeholder with initials "ЮК" — never a generated face.
- Feature cards: `glass-panel rounded-2xl p-5`, 11×11 gradient icon tile (matches existing "Для кого" / "Почему" sections); icons `Sparkles`, `Target`, `ShieldCheck` from `lucide-react`.
- Removes the current "Выбрать своего Гения" button from inside the founder card so the block stays purely trust-building (catalog CTA already exists elsewhere on the page). Tell me if you'd rather keep it.
- Fully responsive: stacks single-column under `md`, photo capped at `max-w-sm` and centered on mobile.
- Visually integrated: same `bg-gradient-mesh`, blurred glow accents, glass tokens, and rounded scale as the rest of the page — no new colors introduced.

### Files
- New: `supabase/migrations/<ts>_site_settings.sql`
- New: `src/lib/site-settings.functions.ts`
- New: `src/routes/_authenticated/admin/settings.tsx`
- Edit: `src/routes/index.tsx` (replace + relocate founder section)
- Edit: `src/lib/public-data.functions.ts` (include founder image) — or add a parallel query in `index.tsx`
- Edit: admin nav to add "Настройки"

### Out of scope (untouched)
Genius selection flow, pricing, registration, consent, footer, legal pages, admin approval flow.

One small confirm before I build: **keep the "Выбрать своего Гения" button inside the founder card, or remove it?** (Plan removes it.)
