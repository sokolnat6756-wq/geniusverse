## Проблема

При регистрации и входе всплывающие красные уведомления показывают текст ошибки на английском (например, «Password should be at least 6 characters», «Invalid login credentials»). Это происходит потому, что код напрямую выводит `error.message` от системы аутентификации, а она возвращает текст на английском.

## Решение

Создать небольшую функцию-переводчик, которая преобразует стандартные сообщения об ошибках аутентификации в русский текст, и использовать её во всех формах входа/регистрации.

### 1. Новый файл `src/lib/auth-errors.ts`

Функция `translateAuthError(error)`, которая:
- распознаёт типовые ошибки по коду/тексту и возвращает русский аналог, например:
  - «Invalid login credentials» → «Неверный email или пароль»
  - «Password should be at least 6 characters» → «Пароль должен содержать минимум 6 символов»
  - «User already registered» → «Пользователь с таким email уже зарегистрирован»
  - «Email not confirmed» → «Email не подтверждён. Проверьте почту»
  - «Unable to validate email address: invalid format» → «Некорректный формат email»
  - «For security purposes, you can only request this after N seconds» → «Слишком много попыток. Повторите чуть позже»
  - и т. п.
- для нераспознанных случаев возвращает понятный запасной текст на русском («Что-то пошло не так. Попробуйте ещё раз»).

### 2. Подключить перевод

В трёх местах заменить `toast.error(error.message)` на `toast.error(translateAuthError(error))`:
- `src/routes/login.tsx`
- `src/routes/register.tsx`
- `src/routes/forgot-password.tsx`

## Результат

Все предупреждения при регистрации, входе и восстановлении пароля будут отображаться на русском языке.
