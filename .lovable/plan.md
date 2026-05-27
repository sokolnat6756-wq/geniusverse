# Fix Genius selection flow

## Цель
Сейчас «Выбрать своего Гения» ведёт сразу к тарифам, но тариф «Один Гений» требует предварительного выбора. Делаем поток: сначала Гений → потом тариф → выбор сохраняется до активации.

## Изменения

### 1. `src/routes/index.tsx` — каталог становится точкой входа
- Добавить `id="catalog"` на секцию «Каталог Гениев».
- Кнопке «Выбрать своего Гения» (секция «Основатель», `<Link to="/pricing">`) заменить на обычную `<Button onClick={…}>` со скроллом к `#catalog`.
- В каждой карточке каталога добавить CTA `«Выбрать этого Гения»` (сохраняет стиль glass + bg-gradient-hero, как у CTA дашборда). По клику:
  - сохранить `localStorage.setItem("preselectedGenius", g.slug)`;
  - плавно проскроллить к секции `#pricing` (она уже есть).
- В блоке тарифов на лендинге: для карточки `one_genius` CTA должна вести на `/register?plan=one_genius&genius=<slug>` (или `/checkout` если уже залогинен), используя `localStorage` как источник `genius`. Если для `one_genius` Гений не выбран — toast + скролл к каталогу. Остальные тарифы работают как сейчас.
- Финальный CTA «Выбрать своего Гения» в нижней секции — тоже скроллит к `#catalog`.

### 2. `src/routes/pricing.tsx` — то же поведение для отдельной страницы
- При клике на `one_genius`: если в `localStorage` нет `preselectedGenius`, редиректим на `/#catalog` с toast «Сначала выберите Гения». Если есть — добавляем `genius` в search при переходе в `/register` или `/checkout`.
- Остальные тарифы — без изменений.

### 3. Проброс `genius` через регистрацию и оплату
- `src/routes/register.tsx`: расширить `validateSearch` полем `genius?: string`. После авторизации передавать `{ plan, genius }` в `/checkout`.
- `src/routes/_authenticated/checkout.tsx`: расширить `validateSearch` полем `genius?: string`. При submit, если `plan === "one_genius"` и есть `genius` — после `activateMockSubscription` сохранить `localStorage.setItem("preselectedGenius", genius)` (на случай, если ещё не сохранено). Ничего на сервер дополнительно слать не нужно: серверная функция `selectOneGenius` уже требует активную подписку.

### 4. `src/routes/_authenticated/dashboard.tsx` — авто-применение выбора после одобрения
- В `useEffect`: если `subscription?.plan_slug === "one_genius"`, `!selectedOneGenius`, и в `localStorage` есть `preselectedGenius`, который существует в `geniuses` — автоматически вызвать `chooseGenius({ data: { geniusSlug } })`, инвалидировать `["dashboard"]` и очистить `localStorage`.
- Если автоприменение не сработало (нет в localStorage) — текущий fallback с кнопкой «Выбрать Гения» и диалогом остаётся.

## Технические детали
- `localStorage` ключ: `preselectedGenius` (slug string). Очищать после успешной привязки.
- SSR-safe: все обращения к `localStorage` обернуть `typeof window !== "undefined"`.
- Серверная логика (`selectOneGenius`, `activateMockSubscription`, RLS, admin approval) — не трогаем. Поток админского ручного одобрения сохраняется как есть.
- Дизайн карточек каталога: добавляется только нижняя кнопка в существующем стиле `glass-panel` блока, отступы и адаптив сохранены.

## Что НЕ меняем
- Схема БД, серверные функции, RLS.
- Регистрация, логин, админ-панель.
- Hero-секция, прочие секции лендинга.
- Family / Full / School — продолжают работать через текущий поток `/pricing → /checkout`.
