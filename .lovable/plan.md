## Цель
Унифицировать визуал всех иконок Гениев: один градиент `from-blue-500 to-violet-600`, белая иконка, `rounded-2xl`, одинаковый размер/padding/тень. Убрать категорийные цвета (зелёный/розовый/слейт).

## Изменения

### 1. `src/lib/genius-icons.tsx`
- Убрать `GRADIENT_BY_CATEGORY` и параметр `category` из `getGeniusVisual`.
- Экспортировать единую константу `GENIUS_ICON_GRADIENT = "from-blue-500 to-violet-600"` (для использования в карточках) и `getGeniusIcon(slug)` возвращающий только `Icon`.
- Оставить fallback `Sparkles`.

### 2. `src/components/GeniusCard.tsx`
- Иконочный контейнер: `rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 ring-1 ring-white/50 shadow-soft` — одинаково для unlocked. Для locked: тот же `rounded-2xl`, но `bg-muted` (иконка `text-muted-foreground`) — единый размер/радиус/тень сохраняем.
- Размер: `h-12 w-12`, иконка `h-6 w-6 text-white` — без изменений.

### 3. `src/routes/index.tsx` (каталог на landing)
- Заменить инлайн `bg-gradient-to-br ${gradientClass}` на `bg-gradient-to-br from-blue-500 to-violet-600`.
- Радиус контейнера иконки `rounded-xl` → `rounded-2xl`.
- Обновить вызов `getGeniusVisual` на новый API (только `Icon`).

### 4. `src/routes/_authenticated/dashboard.tsx` (модалка выбора Гения)
- В Dialog-пикере: тот же градиент `from-blue-500 to-violet-600`, `rounded-2xl`, размер `h-10 w-10` оставить (это уменьшенный preview в списке — но по требованию "same size everywhere" подгоним до `h-12 w-12` для консистентности с карточками).
- Обновить вызов `getGeniusVisual`.

### 5. Прочие места — проверено: иконки Гениев нигде больше не рендерятся (pricing/sidebar/auth используют общий `Sparkles` логотип, не иконки Гениев). Pricing и sidebar отдельных Genius-иконок не имеют, изменений не требуют.

## Что НЕ трогаем
- Layout, типографика, отступы карточек.
- Backend/auth/routing/migrations/RLS.
- Логотип Sparkles в navbar/auth/footer (это бренд, не иконка Гения).
- Категорийные бейджи (`CATEGORY_LABELS`) — это текст, не цвет иконки.
