import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Политика конфиденциальности — Академия Гениев" },
      { name: "description", content: "Как Академия Гениев собирает, хранит и защищает персональные данные пользователей." },
      { property: "og:title", content: "Политика конфиденциальности — Академия Гениев" },
      { property: "og:description", content: "Как Академия Гениев обрабатывает персональные данные пользователей." },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-sm text-muted-foreground">Обновлено: 23 мая 2026</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Политика конфиденциальности</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Образец документа. Перед использованием рекомендуем согласовать с юристом.
        </p>

        <div className="mt-10 space-y-8 text-[15px] leading-7 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Общие положения</h2>
            <p className="mt-2">
              Настоящая Политика описывает порядок обработки персональных данных пользователей сервиса
              «Академия Гениев» (далее — «Сервис»). Используя Сервис, вы подтверждаете согласие с условиями
              настоящей Политики.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Какие данные мы собираем</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Имя и адрес электронной почты, указанные при регистрации.</li>
              <li>Данные о выбранном тарифе и статусе подписки.</li>
              <li>Технические данные: IP-адрес, тип устройства, cookie-файлы, журналы посещений.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Цели обработки</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Регистрация и аутентификация пользователя.</li>
              <li>Предоставление доступа к функциям Сервиса в рамках выбранного тарифа.</li>
              <li>Связь с пользователем по вопросам поддержки и работы Сервиса.</li>
              <li>Улучшение качества и безопасности Сервиса.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Хранение и защита данных</h2>
            <p className="mt-2">
              Данные хранятся на защищённой облачной инфраструктуре с шифрованием каналов передачи.
              Доступ к данным имеют только уполномоченные сотрудники в объёме, необходимом для выполнения
              своих обязанностей.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Передача третьим лицам</h2>
            <p className="mt-2">
              Мы не передаём персональные данные третьим лицам, за исключением случаев, предусмотренных
              законодательством, либо подрядчиков, обеспечивающих работу Сервиса (хостинг, рассылки,
              аналитика), на условиях конфиденциальности.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Файлы cookie</h2>
            <p className="mt-2">
              Сервис использует cookie-файлы для аутентификации, сохранения настроек и сбора обезличенной
              статистики. Вы можете отключить cookie в настройках браузера, однако часть функций Сервиса
              может стать недоступной.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Права пользователя</h2>
            <p className="mt-2">
              Вы вправе запросить доступ к своим данным, их уточнение, удаление или ограничение обработки,
              а также отозвать согласие на обработку, направив обращение на адрес, указанный ниже.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. Контакты</h2>
            <p className="mt-2">
              По всем вопросам, связанным с обработкой персональных данных, пишите на
              {" "}
              <a href="mailto:hello@academy-genius.ru" className="text-primary hover:underline">
                hello@academy-genius.ru
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 text-sm text-muted-foreground">
          См. также: <Link to="/offer" className="text-primary hover:underline">Публичная оферта</Link>.
        </div>
      </main>
      <Footer />
    </div>
  );
}
