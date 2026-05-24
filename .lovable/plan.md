## Plan: Update pricing bullet text

Single file edit: `src/routes/pricing.tsx` — update the `FEATURES` constant.

```ts
const FEATURES: Record<string, string[]> = {
  one_genius: ["1 выбранный ассистент", "Помощь с заданиями", "Повышение уровня знаний"],
  school: ["Все школьные Гении", "Подготовка к ВПР / ОГЭ / ЕГЭ", "Поддержка по домашним заданиям"],
  family: ["ДошкоГений и ЛогоГений", "Все школьные Гении", "ФинГений"],
  full: ["Все Гении сразу", "Максимальный доступ"],
};
```

No other changes. Card layout, prices, buttons, styling, and responsive behavior remain untouched. The `PlanCard` already uses `flex-1` on the features list, so cards stay equal height and the CTAs remain aligned even with different bullet counts.