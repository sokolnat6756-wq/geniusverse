# Админка пользователей `/admin/users`

## 1. База данных (одна миграция)

**RLS-доступ админа к чужим данным** (сейчас все таблицы скоупятся через `auth.uid()`):
- `profiles`: добавить SELECT-политику `has_role(auth.uid(), 'admin')`.
- `subscriptions`: добавить SELECT / INSERT / UPDATE политики для админа через `has_role`.
- `user_genius_access`: добавить SELECT / INSERT / UPDATE / DELETE политики для админа.

Существующие user-policies (`auth.uid() = user_id`) остаются — обычный пользователь видит только своё. Админ получает параллельный набор политик. RLS остаётся включён.

## 2. Серверная логика (`src/lib/admin.functions.ts`)

Добавить (рядом с уже существующими `getIsAdmin / listAllGeniuses / updateGenius`):

- `listAllUsers()` — admin-only через `assertAdmin`. Через `supabaseAdmin` собирает:
  - `auth.admin.listUsers()` → email, created_at
  - все активные `subscriptions` (plan_slug, status)
  - все активные `user_genius_access` (genius_slug)
  - агрегирует в массив `{ user_id, email, created_at, plan_slug, status, geniuses_count, one_genius_slug }`
- `grantAccess({ userId, plan, geniusSlug? })` — admin-only, Zod:
  - `plan ∈ {'one_genius','school','family','full'}`
  - если `one_genius` — `geniusSlug` обязателен и должен существовать в `geniuses`
  - деактивирует прошлые `subscriptions` пользователя (`status='cancelled'`), вставляет новую `active`
  - очищает `user_genius_access` пользователя, затем заполняет в соответствии с планом:
    - `one_genius` → одна запись с выбранным slug
    - `school` → все Гении категории `school`
    - `family` → `school + kids + ['fingeniy','bloggeniy','biznesgeniy']`
    - `full` → все Гении
- `revokeAccess({ userId })` — admin-only:
  - все активные подписки → `status='cancelled'`
  - все `user_genius_access` пользователя → `access_status='cancelled'`

Логика составления списка Гениев по плану повторяет `isGeniusUnlocked` из `src/lib/access.ts` — вынесу хелпер `geniusSlugsForPlan(plan, allGeniuses, oneSlug?)` туда же, чтобы клиент и сервер использовали одно правило.

## 3. Роут `/_authenticated/admin/users`

`src/routes/_authenticated/admin/users.tsx`:
- `beforeLoad`: `getIsAdmin()` → если не админ → `redirect('/dashboard')`.
- React Query загружает `listAllUsers` + `listAllGeniuses` (для дропдауна one_genius).
- Таблица (shadcn `Table`) в том же premium-glass стиле, что и админка Гениев. Колонки: Email · Дата регистрации · Текущий план · Статус · Кол-во Гениев · Действия.
- Действия в строке:
  - `Select` плана (`no_access / one_genius / school / family / full`)
  - условный `Select` Гения (виден только если выбран `one_genius`)
  - кнопка **«Открыть доступ»** → `grantAccess` (для `no_access` — фактически revoke)
  - кнопка **«Закрыть доступ»** → `revokeAccess`
- Loading state на кнопках, `sonner` toast, `queryClient.invalidateQueries` после мутаций.

## 4. Навигация

В `Navbar.tsx` рядом с уже существующей «Админка» (которая ведёт на Гениев) — добавить второй пункт «Пользователи» (виден только админу). Дизайн без изменений.

## 5. Не трогаем

- Админку Гениев `/admin/geniuses`
- Landing/dashboard/checkout/pricing
- Auth, существующие user-RLS политики
- Дизайн-токены

## Технические заметки

- Все мутации защищены дважды: `assertAdmin` в handler + RLS на таблицах.
- `no_access` в селекте маппится на `revokeAccess` — отдельный план не создаём.
- Dashboard у пользователя обновляется при следующем заходе/refetch — серверных пушей не делаем.
- TS-типы `user_roles` уже подтянуты предыдущей миграцией; новая миграция меняет только политики, типы не изменятся.
- Для `auth.admin.listUsers()` используется `supabaseAdmin` (service role) — только на сервере.

## Открытые вопросы (предлагаю решить дефолтами без отдельного раунда вопросов)

- **Пагинация**: пока без пагинации (project small-scale). При >100 пользователей добавим `auth.admin.listUsers({ page, perPage })`.
- **Поиск по email**: не добавляю в первой версии — можно добавить позже одним инпутом с client-side фильтром.
