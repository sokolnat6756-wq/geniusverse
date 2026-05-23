
# План: MVP «Академия Гениев»

## Важное уточнение по стеку

Проект уже инициализирован на **TanStack Start (React 19 + Vite 7)**, а не на Next.js. Это шаблон Lovable, в котором роутинг файловый (`src/routes/`), серверная логика — через `createServerFn`, а БД — через **Lovable Cloud** (Supabase под капотом). Технически результат будет 1-в-1 как описано (Tailwind, shadcn/ui, Supabase Auth + DB, RLS, адаптив), просто без Next.js. Если критично именно Next.js — это потребует пересоздания проекта с нуля; подтвердите, или продолжаем на текущем стеке.

Дальше план написан под текущий стек.

---

## 1. Backend: Lovable Cloud + схема БД

Включаю Lovable Cloud и накатываю миграцию со следующими таблицами:

- `profiles` (id → auth.users, email, full_name, created_at) + триггер автосоздания при signup
- `plans` (id, name, slug unique, price, description, created_at)
- `subscriptions` (id, user_id, plan_slug, status, created_at, expires_at)
- `geniuses` (id, name, slug unique, emoji, category, short_description)
- `user_genius_access` (id, user_id, genius_slug, access_status, created_at) — используется только для тарифа `one_genius` (выбор одного Гения)

**RLS:** включён на всех таблицах.
- `profiles`, `subscriptions`, `user_genius_access` — SELECT/INSERT/UPDATE только `auth.uid() = user_id`
- `plans`, `geniuses` — публичный SELECT (справочники)

**Seed data:**
- 4 тарифа: `one_genius` 990, `school` 2990, `family` 4990, `full` 7990
- 17 Гениев из ТЗ (school / kids / adult категории)

## 2. Серверная логика (`createServerFn`)

- `getCurrentSubscription()` — активная подписка пользователя
- `activateMockSubscription({ planSlug })` — mock checkout: апсерт в `subscriptions` со статусом `active`
- `selectGeniusForOneGenius({ geniusSlug })` — выбор Гения для тарифа `one_genius`
- `getDashboardData()` — профиль + подписка + список Гениев с флагом `unlocked` по правилам доступа

**Логика доступа (на сервере, единый источник правды):**
- нет подписки → всё locked
- `one_genius` → доступен только выбранный slug
- `school` → все где `category='school'`
- `family` → school + kids + `fingeniy`, `bloggeniy`, `biznesgeniy`
- `full` → все

## 3. Страницы (роуты)

Публичные (`src/routes/`):
- `/` — Landing: Hero, Для кого, Каталог Гениев, Как работает, Преимущества, Тарифы (превью), FAQ, финальный CTA
- `/pricing` — 4 карточки тарифов, кнопка «Выбрать тариф» → `/register` если не авторизован, иначе `/checkout?plan=...`
- `/login`, `/register`, `/forgot-password` — Supabase Auth (email/password), редирект на `/dashboard`

Защищённые (`src/routes/_authenticated/`):
- `/checkout` — карточка выбранного тарифа + кнопка «Оплатить тестово» → `activateMockSubscription` → `/success`
- `/success` — «Доступ активирован 🎉» + кнопка «Перейти в кабинет»
- `/dashboard` — приветствие, email, текущий тариф, дата активации, сетка карточек Гениев (unlocked/locked), CTA «Открыть полный доступ»
- `/chat-placeholder?genius=slug` — заголовок «Чат с [имя Гения] скоро будет здесь», кнопка возврата

Гард — через layout `_authenticated.tsx` с `beforeLoad` (редирект на `/login` если нет сессии).

## 4. UI / дизайн-система

- Tailwind v4 через `src/styles.css`, токены в `oklch`
- Палитра: белый фон, мягкие фиолетово-синие градиенты (primary purple + accent blue), скруглённые карточки (radius lg/xl), чистая типографика
- shadcn компоненты: Button, Card, Badge, Input, Label, Dialog, Toast (sonner)
- Общие компоненты: `Navbar` (лого + Тарифы + Войти/Кабинет), `Footer`, `PlanCard`, `GeniusCard` (с состоянием locked/unlocked), `LoadingState`, `EmptyState`
- Полная адаптивность (mobile-first), сетки 1/2/3/4 колонки

## 5. Подготовка под будущий AI-этап

- Логика доступа изолирована в `src/lib/access.ts` — одна функция `getAccessibleGeniuses(plan, oneGeniusSlug)` используется и на сервере, и в UI
- Структура серверных функций (`src/lib/*.functions.ts`) готова для добавления `chat.functions.ts` (sessions/messages)
- `geniuses` уже содержит `slug` — позже добавится поле `system_prompt` миграцией
- `/chat-placeholder` будет заменён на `/chat/$geniusSlug` без изменений в dashboard

## 6. Технические детали

- Auth flow: `supabase.auth.signUp/signInWithPassword`, `onAuthStateChange` слушатель в `__root.tsx` для инвалидации кэша
- Цены отображаются как `990 ₽` (целые рубли, integer в БД)
- Subscription `status`: `active` / `cancelled`; `expires_at` оставляем nullable (для будущих платных подписок)
- Mock checkout — это просто кнопка → `createServerFn` → insert/update в `subscriptions`. Никаких внешних API.
- SEO: уникальные `head()` (title/description/og) на каждом публичном роуте `/`, `/pricing`, `/login`, `/register`

## Что НЕ делаем на этом этапе

- OpenAI / любой AI
- Реальная оплата (Stripe/ЮKassa и т.п.)
- Чат-страница с историей сообщений
- Админка управления Гениями/тарифами (только seed)

---

После апрува плана: включаю Lovable Cloud, накатываю миграцию + seed, и собираю все страницы и компоненты.
