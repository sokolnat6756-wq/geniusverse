## Goal
Fix visual imbalance under the founder photo by adding a premium glass trust card with 4 facts, and slightly increasing photo height.

## Scope
Single file: `src/routes/index.tsx`, founder section only. No content, copy, or backend changes.

## Changes

### 1. Founder photo
- Change `aspect-[4/5]` → `aspect-[3/4]` so the photo column grows taller and better matches the right column height.

### 2. New trust card (below "Юлия Копасова" caption)
Add a `glass-panel-strong rounded-2xl p-5 shadow-elegant` card with 4 rows, each row = gradient icon tile (h-9 w-9, `bg-gradient-hero`, rounded-xl, ring-1 ring-white/50) + text block (bold number/label + muted sub-label).

Facts + icons (from `lucide-react`, already partially imported):
- `Users` — **110 000+** / подписчиков
- `GraduationCap` — **800+** / учеников обучены онлайн
- `Heart` — **Мама 3 детей** / семья и забота
- `Briefcase` — **Предприниматель** / создатель Академии Гениев

(Add `Briefcase` to the existing lucide import; rest are already imported.)

Layout: vertical stack with `space-y-3`, each row `flex items-center gap-3`. Card sits inside the left column under the name caption with `mt-6`.

### 3. Spacing
- Photo block keeps `mt-5` caption; trust card gets `mt-6` separation.
- On mobile the card stays full width inside the same left column — no layout change needed since the column already stacks at `< md`.

## Out of scope
- Right-column text, feature mini-cards, bottom accent line — untouched.
- No CSS/token changes; reuses existing `glass-panel-strong`, `bg-gradient-hero`, `shadow-elegant`, `shadow-soft`.
