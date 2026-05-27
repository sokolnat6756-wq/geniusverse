import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/consent")({
  head: () => ({
    meta: [
      { title: "Согласие на обработку персональных данных — Академия Гениев" },
      { name: "description", content: "Условия согласия на обработку персональных данных пользователей Академии Гениев." },
      { property: "og:title", content: "Согласие на обработку персональных данных — Академия Гениев" },
      { property: "og:description", content: "Условия согласия на обработку персональных данных пользователей Академии Гениев." },
      { property: "og:url", content: "/consent" },
    ],
    links: [{ rel: "canonical", href: "/consent" }],
  }),
  component: ConsentPage,
});

function ConsentPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-sm text-muted-foreground">Обновлено: 27 мая 2026</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Согласие на обработку персональных данных
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Образец документа. Перед использованием рекомендуем согласовать с юристом.
        </p>

        <div className="mt-10 space-y-8 text-[15px] leading-7 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Общие положения</h2>
            <p className="mt-2">
              Регистрируясь в сервисе «Академия Гениев» (далее — «Сервис»), вы даёте согласие
              оператору Сервиса на обработку ваших персональных данных на условиях, изложенных
              ниже.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Перечень данных</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Имя и адрес электронной почты.</li>
              <li>Информация о выбранном тарифе и статусе подписки.</li>
              <li>Технические данные: IP-адрес, cookie-файлы, журналы посещений.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Цели обработки</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Регистрация и аутентификация пользователя.</li>
              <li>Предоставление доступа к функциям Сервиса в рамках выбранного тарифа.</li>
              <li>Информирование о работе Сервиса и поддержка пользователей.</li>
              <li>Улучшение качества и безопасности Сервиса.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Действия с данными</h2>
            <p className="mt-2">
              Сбор, запись, систематизация, накопление, хранение, уточнение, использование,
              передача (предоставление подрядчикам на условиях конфиденциальности),
              обезличивание, блокирование, удаление и уничтожение.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Срок действия согласия</h2>
            <p className="mt-2">
              Согласие действует с момента регистрации и до момента его отзыва. Вы вправе
              отозвать согласие в любое время, направив письменное обращение на указанный
              ниже адрес.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Контакты</h2>
            <p className="mt-2">
              По вопросам обработки персональных данных пишите на{" "}
              <a href="mailto:hello@academy-genius.ru" className="text-primary hover:underline">
                hello@academy-genius.ru
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 text-sm text-muted-foreground">
          См. также: <Link to="/privacy" className="text-primary hover:underline">Политика конфиденциальности</Link>.
        </div>
      </main>
      <Footer />
    </div>
  );
}
