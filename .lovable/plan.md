# Админка для управления Гениями

## 1. База данных (одна миграция)

**Роли:**
- `CREATE TYPE public.app_role AS ENUM ('admin', 'user');`
- Таблица `public.user_roles (id, user_id uuid, role app_role, unique(user_id, role))` с RLS.
- Security definer функция `public.has_role(_user_id uuid, _role app_role) returns boolean`.
- RLS на `user_roles`: пользователь видит свои роли; только админ может INSERT/UPDATE/DELETE через `has_role(auth.uid(), 'admin')`.

**Доступ админа к `geniuses`:**
- Добавить RLS политику UPDATE на `public.geniuses`: `USING (public.has_role(auth.uid(), 'admin'))`.
- SELECT уже публичный — оставить. INSERT/DELETE не нужны (редактируем только существующие записи).

После миграции — выполнить вручную через SQL: `INSERT INTO user_roles (user_id, role) VALUES ('<ваш-uuid>', 'admin');` (инструкция будет в чате).

## 2. Серверная логика (`createServerFn`)

`src/lib/admin.functions.ts`:
- `getIsAdmin()` — middleware `requireSupabaseAuth`, возвращает `{ isAdmin: boolean }` через запрос к `user_roles`.
- `updateGenius({ id, name, short_description, emoji, chatgpt_url })` — middleware `requireSupabaseAuth`, проверка admin-роли на сервере, Zod-валидация (длины, URL-формат для `chatgpt_url`, разрешён null/пустая строка → null), затем UPDATE через RLS-клиент. Если не админ — `throw new Error('Forbidden')`.

## 3. Роут `/_authenticated/admin/geniuses`

`src/routes/_authenticated/admin/geniuses.tsx`:
- `beforeLoad`: `getIsAdmin()`; если `!isAdmin` → `throw redirect({ to: '/dashboard' })`.
- Loader: грузит список всех гениев через существующий публичный server fn (или новый admin-only с полным селектом).
- Компонент: таблица из shadcn `Table` со строками по каждому Гению. Поля редактируемые inline: `emoji` (короткий input), `name` (input), `short_description` (textarea), `chatgpt_url` (input). Кнопка «Сохранить» на каждой строке, индикатор loading, toast об успехе/ошибке через `sonner`. React Query для инвалидации.
- Дизайн: те же premium-glass токены, что и dashboard — никаких новых стилей.

## 4. Навигация

В `src/components/Navbar.tsx` — условный пункт «Админка» (виден только если `getIsAdmin()` вернул true; кешируется через React Query).

## 5. Не трогаем

Auth, существующие RLS на других таблицах, mock checkout, доступ Гениев, дизайн-токены, ChatGPT-ссылки на dashboard.

## Технические заметки

- Все мутации проходят дважды через защиту: RLS политика на `geniuses` UPDATE + явная проверка `has_role` в `updateGenius` handler.
- `chatgpt_url` валидируется как `z.string().url().nullable()` (пустая строка → `null`).
- Список гениев в админке грузится через `supabaseAdmin` для надёжности (или через тот же публичный select — данные совпадают).
- TypeScript-типы `user_roles` подтянутся автоматически после миграции.
