## Goal
Match the attached mockup: portrait photo card with name caption inside the same card, and the trust card moved BELOW the photo card as a separate full-width block in the left column — aligned horizontally with the row of 3 feature cards on the right.

## Scope
`src/routes/index.tsx`, founder section only (lines ~149–196). Admin upload, server functions, and right-column content untouched.

## Layout target

```
┌─────────────────┐   ┌─────────────────────────────────┐
│                 │   │  Идея, которая стала ...        │
│   PHOTO 9:16    │   │  body text paragraphs           │
│                 │   │                                 │
│ ─────────────── │   │                                 │
│ Юлия Копасова   │   │                                 │
└─────────────────┘   │                                 │
┌─────────────────┐   ├──────┬──────┬──────┐
│ 110 000+        │   │ card │ card │ card │
│ 800+            │   │      │      │      │
│ Мама 3 детей    │   │      │      │      │
│ Предприниматель │   │      │      │      │
└─────────────────┘   └──────┴──────┴──────┘
```

## Changes

### 1. Restructure left column
Replace the current single nested wrapper with two stacked cards, both inside `md:col-span-2`:

- **Card A — Photo card** (`glass-panel-strong rounded-3xl p-3 shadow-soft`):
  - Photo frame: keep `data.founder?.image_url` rendering and fallback. Aspect `aspect-[9/16]` (currently `3/4`), `rounded-2xl overflow-hidden ring-1 ring-white/60`.
  - Name caption INSIDE the card, centered, `mt-3`: only `Юлия Копасова` (`text-lg font-semibold tracking-tight`). Remove "Создатель Академии" eyebrow entirely.

- **Card B — Trust card** (`glass-panel-strong rounded-3xl p-5 shadow-soft mt-6`):
  - Same 4 rows (Users / GraduationCap / Heart / Briefcase) with current copy. No content change.

### 2. Right column alignment
- Change grid to `md:items-stretch` so columns stretch equally. Right-column wrapper becomes `flex flex-col` so the 3 feature mini-cards row can be pushed to the bottom with `mt-auto` on its container — this makes the feature-card row line up horizontally with the trust card on the left.
- Bottom accent line stays after the grid, unchanged.

### 3. Tokens
Reuse existing utilities only: `glass-panel-strong`, `bg-gradient-hero`, `shadow-soft`, `shadow-elegant`, `text-gradient`. No CSS/token additions.

## Out of scope
- Admin photo upload, server functions, storage — untouched.
- Right-column copy, headline, body text, feature card content, bottom accent — untouched.
- Light/dark theme tokens — untouched.
