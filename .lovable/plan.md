## Sync landing page pricing with /pricing route

Catalog changes (МАКС Гений added, АстроГений → "Школа") and the `/pricing` route bullets are already applied. The only remaining drift is the duplicated `PLAN_FEATURES` block on the landing page (`src/routes/index.tsx`), which still shows the old bullets.

### Single change

`src/routes/index.tsx` — update `PLAN_FEATURES` to match `/pricing`:

```ts
const PLAN_FEATURES: Record<string, string[]> = {
  one_genius: ["1 выбранный ассистент", "Помощь с заданиями", "Повышение уровня знаний"],
  school: ["Все школьные Гении", "Подготовка к ВПР / ОГЭ / ЕГЭ", "Поддержка по домашним заданиям"],
  family: ["ДошкоГений и ЛогоГений", "Все школьные Гении", "ФинГений"],
  full: ["Все Гении сразу", "Максимальный доступ"],
};
```

### Not changed

- `PlanCard` component, layout, styling, spacing, buttons, colors, fonts, responsive behavior — untouched. Equal card heights and button alignment are already handled by the existing `PlanCard` flex layout and continue to work with shorter bullet lists.
- Catalog grid, DB rows, icon map — already correct, no further edits.
- `/pricing` route — already correct, no further edits.
