## Цель
Заменить emoji в карточках Гениев на профессиональные lucide-react иконки и поднять премиальность визуала. Только UI каталога (landing) и dashboard-карточек. Бизнес-логика, auth, schema, routing — не трогаем (emoji-колонка в БД остаётся, мы её просто не используем в UI).

## Что меняем

### 1. Новый файл `src/lib/genius-icons.tsx`
Маппинг `slug → { Icon, accent }`, чтобы и landing, и dashboard брали иконки из одного источника.

- `matgeniy` → Calculator
- `rusgeniy` → PenTool
- `anglogeniy` → Languages
- `geogeniy` → Globe2
- `biogeniy` → Leaf (Dna запасной)
- `istogeniy` → Landmark
- `himgeniy` → FlaskConical
- `fizgeniy` → Atom
- `obshestvogeniy` → Scale
- `litgeniy` → BookText
- `infogeniy` → Code2
- `astrogeniy` → Rocket
- `doshkogeniy` → Blocks (toy-brick эквивалент)
- `logogeniy` → Mic
- `bloggeniy` → Megaphone
- `fingeniy` → Wallet
- `biznesgeniy` → Briefcase

Палитра акцентов по категориям (token-friendly Tailwind утилитарные классы для градиента иконок):
- `school` → violet → blue (`from-violet-500 to-blue-500`)
- `kids` → pink → orange (`from-pink-500 to-orange-400`)
- `adult` → emerald → slate (`from-emerald-500 to-slate-600`)

Хелпер `getGeniusVisual(slug, category)` возвращает `{ Icon, gradientClass }` с fallback на `Sparkles` + категорийный градиент.

### 2. `src/components/GeniusCard.tsx` — редизайн
- Убрать `genius.emoji`, рендерить `<Icon className="h-6 w-6 text-white" />` внутри rounded gradient контейнера `h-12 w-12 rounded-xl bg-gradient-to-br ... shadow-soft`.
- Locked-состояние: тот же контейнер, но `bg-muted` + `text-muted-foreground`, иконка `Lock` поверх (полупрозрачный overlay) или замена на Lock-иконку — сохраним текущий UX (иконка Гения видна, бейдж "Недоступно" справа).
- Премиальность: `rounded-2xl`, увеличить padding до `p-6`, hover — `hover:-translate-y-1 hover:shadow-elegant transition-all duration-300`, тонкая граница `border-border/60`, заголовок `text-base font-semibold tracking-tight`, описание `text-sm leading-relaxed text-muted-foreground`, чище spacing (`mt-5` между блоками).
- Кнопка "Открыть чат" — сохранить existing variant.

### 3. `src/routes/index.tsx` — каталог на landing
Заменить инлайн-рендер карточки в секции "Каталог Гениев": вместо `{g.emoji}` использовать `getGeniusVisual(g.slug, g.category)` и тот же gradient container. Сохранить grid и текущую структуру секции.

### 4. `src/routes/_authenticated/dashboard.tsx` — селектор "Один Гений"
В `<Dialog>` пикере заменить `{g.emoji}` на ту же иконку в маленьком gradient containere (`h-10 w-10`).

## Что НЕ трогаем
- `src/lib/access.ts` (тип `Genius.emoji` остаётся — поле в БД не убираем).
- migrations, RLS, server functions, routing, auth.
- `src/styles.css` — текущих токенов (`bg-gradient-soft`, `shadow-soft`, `shadow-elegant`) хватает; добавлять ничего не нужно.

## Технические детали
- Все иконки из `lucide-react` (уже в зависимостях).
- Категорийный градиент — Tailwind utility-классы, без новых CSS-переменных, чтобы не раздувать дизайн-систему ради 3 акцентов.
- Хелпер возвращает строку класса, а не объект стилей, чтобы Tailwind JIT её увидел (статические литералы в карте).
