// Переводит сообщения об ошибках аутентификации (Supabase) на русский язык.

interface AuthLikeError {
  message?: string;
  code?: string;
  status?: number;
}

export function translateAuthError(error: AuthLikeError | null | undefined): string {
  if (!error) return "Что-то пошло не так. Попробуйте ещё раз";

  const raw = (error.message ?? "").toLowerCase();
  const code = (error.code ?? "").toLowerCase();

  // Неверные учётные данные
  if (code === "invalid_credentials" || raw.includes("invalid login credentials")) {
    return "Неверный email или пароль";
  }

  // Слишком короткий пароль
  if (
    raw.includes("password should be at least") ||
    raw.includes("password is too short") ||
    code === "weak_password"
  ) {
    const match = raw.match(/at least (\d+)/);
    const min = match ? match[1] : "6";
    return `Пароль должен содержать минимум ${min} символов`;
  }

  // Пользователь уже существует
  if (
    code === "user_already_exists" ||
    raw.includes("user already registered") ||
    raw.includes("already been registered")
  ) {
    return "Пользователь с таким email уже зарегистрирован";
  }

  // Email не подтверждён
  if (code === "email_not_confirmed" || raw.includes("email not confirmed")) {
    return "Email не подтверждён. Проверьте почту";
  }

  // Некорректный формат email
  if (
    raw.includes("unable to validate email address") ||
    raw.includes("invalid format") ||
    raw.includes("invalid email")
  ) {
    return "Некорректный формат email";
  }

  // Слишком много попыток / ограничение по времени
  if (
    code === "over_request_rate_limit" ||
    code === "over_email_send_rate_limit" ||
    raw.includes("for security purposes") ||
    raw.includes("rate limit") ||
    raw.includes("too many requests")
  ) {
    return "Слишком много попыток. Повторите чуть позже";
  }

  // Пользователь не найден
  if (code === "user_not_found" || raw.includes("user not found")) {
    return "Пользователь с таким email не найден";
  }

  // Проблемы сети
  if (raw.includes("failed to fetch") || raw.includes("network")) {
    return "Ошибка сети. Проверьте подключение к интернету";
  }

  return "Что-то пошло не так. Попробуйте ещё раз";
}
