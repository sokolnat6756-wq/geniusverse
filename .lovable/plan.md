## Принципы
Hybrid glassmorphism: стекло — только на акцентных поверхностях (hero, cards, navbar, CTA, modals, dashboard-виджеты). Длинные тексты, FAQ, footer-низ, фон страницы — остаются плотными для читаемости. Цвета: white + soft violet/blue + premium slate. Производительность: один общий glass-класс с `backdrop-blur-xl`, без вложенных blur-слоёв.

## 1. Дизайн-токены — `src/styles.css`
Добавить (без удаления существующего):
- `--gradient-mesh`: мягкий многоточечный radial-градиент (violet + blue + white) для фоновых "стекольных" подложек у секций hero/CTA.
- `--shadow-glass`: `0 8px 32px -12px oklch(0.55 0.22 285 / 0.18), inset 0 1px 0 0 rgba(255,255,255,0.6)` — мягкая тень + тонкая внутренняя подсветка верхнего края.
- Утилиты:
  - `bg-gradient-mesh` → фон секций (под стеклом).
  - `glass-panel` — composable utility: `bg-white/60 backdrop-blur-xl border border-white/40 shadow-glass` (light glass для светлого фона).
  - `glass-panel-strong` — `bg-white/75 backdrop-blur-2xl border border-white/50 shadow-glass` (для карточек на цветной/градиентной подложке).
  - `glass-panel-dark` — `bg-white/10 backdrop-blur-xl border border-white/20` (для hero/CTA с тёмным gradient-фоном).
- Базовый `--radius` поднять до `1.25rem` (20px), плюс используем `rounded-3xl` (24px) и `rounded-[2rem]` (32px) на крупных стеклянных карточках.

## 2. Navbar — `src/components/Navbar.tsx`
- `bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-[0_1px_0_0_rgba(255,255,255,0.6)]` вместо текущего `bg-background/80`.
- Logo-плашка: чуть сильнее тень, hover scale-105.
- Mobile-меню: тоже glass-панель с радиусом снизу.

## 3. Landing — `src/routes/index.tsx`
- **Hero**: оставить mesh-градиентный фон, добавить плавающие orb'ы (как уже есть). Поверх — `glass-panel` пилюлю с "AI-наставники нового поколения" (уже есть, но усилить blur + border). CTA-кнопки: основная — gradient-hero, вторичная — `glass-panel` (полупрозрачная белая).
- **"Для кого"**: карточки в `glass-panel`, `rounded-3xl`, hover `-translate-y-1 scale-[1.01] transition-all duration-300`.
- **Каталог Гениев**: убрать тяжёлый `bg-gradient-soft` секции, заменить на `bg-gradient-mesh` (мягче). Карточки Гениев (`src/components/GeniusCard.tsx` + инлайн-каталог в `index.tsx`) — `glass-panel`, `rounded-3xl`, hover lift + soft scale.
- **Как работает**: light-glass карточки на белом фоне, без тяжёлого blur.
- **Преимущества**: glass-карточки на mesh-фоне.
- **Тарифы**: `PlanCard` → glass-panel-strong, highlighted-вариант — с цветным мягким glow позади (`absolute inset-0 -z-10 bg-gradient-hero blur-3xl opacity-30`).
- **FAQ**: НЕ glass. Чистый белый блок, `rounded-2xl border border-border/60` — приоритет читаемости.
- **Финальный CTA**: gradient-hero контейнер + поверх `glass-panel-dark` для подсветки внутренних элементов (текст и кнопки сохраняют контраст).

## 4. Карточки Гениев — `src/components/GeniusCard.tsx`
- Контейнер → `glass-panel rounded-3xl p-6`, hover `hover:-translate-y-1 hover:scale-[1.01] hover:shadow-elegant transition-all duration-300 ease-out`.
- Иконочный gradient-контейнер: сохранить, добавить `ring-1 ring-white/50` для glass-обвода.
- Locked: `bg-white/40` (легче), pattern остаётся.

## 5. Pricing страница — `src/routes/pricing.tsx`
- Hero-шапка: mesh-фон + glass-pill заголовок.
- Использовать обновлённый `PlanCard`.

## 6. Dashboard — `src/routes/_authenticated/dashboard.tsx`
- **Header-виджет** (приветствие + тариф): сохранить `bg-gradient-hero` градиент, поверх внутреннего блока с тарифом — `glass-panel-dark` "стекло на стекле" (один уровень blur, без вложенности).
- "Хотите ещё больше?" CTA: glass-panel-strong на mesh-фоне.
- Dialog (выбор Гения): `DialogContent` через shadcn — добавить класс `glass-panel-strong rounded-3xl`. Внутренние пункты — белые light-glass карточки.

## 7. Auth страницы (`login`, `register`, `forgot-password`)
- Фон: `bg-gradient-mesh` + два мягких orb'а.
- Card формы: `glass-panel-strong rounded-3xl p-8 shadow-elegant`.

## 8. Footer — `src/components/Footer.tsx`
- НЕ glass. Сохранить плотный фон (заменить `bg-gradient-soft` на чистый `bg-muted/40`) — длинный текстовый блок, читаемость > эффект.

## 9. Микроанимации
Унифицированные классы (Tailwind, без новых keyframes):
- Стандартный hover для всех стеклянных карточек: `transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-elegant`.
- Кнопки: уже есть hover в shadcn; добавить `active:scale-[0.98]` на крупные CTA.

## Что НЕ трогаем
- `src/lib/*`, server functions, supabase, auth-context.
- Routing, migrations, schema.
- `routeTree.gen.ts`.
- FAQ-секция / privacy / offer / chat-placeholder / success — длинные тексты, остаются плотными.

## Производительность
- Один уровень `backdrop-blur-xl` на элемент, никаких вложенных blur.
- На карточках в крупных грид-сетках (каталог, dashboard) использовать `backdrop-blur-md` вместо `xl`, чтобы мобильные не страдали.
- Orb'ы (`blur-3xl`) — максимум 2 на секцию, `-z-10`, без анимаций.
