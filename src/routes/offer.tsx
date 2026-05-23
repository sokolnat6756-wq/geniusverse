import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/offer")({
  head: () => ({
    meta: [
      { title: "Публичная оферта — Академия Гениев" },
      { name: "description", content: "Условия предоставления доступа к сервису Академия Гениев: тарифы, оплата, права и обязанности сторон." },
      { property: "og:title", content: "Публичная оферта — Академия Гениев" },
      { property: "og:description", content: "Условия предоставления доступа к сервису Академия Гениев." },
      { property: "og:url", content: "/offer" },
    ],
    links: [{ rel: "canonical", href: "/offer" }],
  }),
  component: OfferPage,
});

function OfferPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-sm text-muted-foreground">Действует с: 23 мая 2026</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Публичная оферта</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Образец документа. Перед использованием рекомендуем согласовать с юристом.
        </p>

        <div className="mt-10 space-y-8 text-[15px] leading-7 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Предмет оферты</h2>
            <p className="mt-2">
              Настоящая публичная оферта (далее — «Оферта») является официальным предложением сервиса
              «Академия Гениев» (далее — «Исполнитель») заключить договор о предоставлении доступа к
              онлайн-платформе с AI-наставниками на условиях, изложенных ниже.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Услуги</h2>
            <p className="mt-2">
              Исполнитель предоставляет Пользователю доступ к выбранным AI-наставникам («Гениям») в объёме,
              соответствующем выбранному тарифу. Перечень и стоимость тарифов указаны на странице
              {" "}
              <Link to="/pricing" className="text-primary hover:underline">тарифов</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Порядок акцепта</h2>
            <p className="mt-2">
              Акцептом Оферты считается оплата выбранного тарифа Пользователем. С момента акцепта договор
              между Пользователем и Исполнителем считается заключённым на условиях настоящей Оферты.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Стоимость и оплата</h2>
            <p className="mt-2">
              Стоимость услуг определяется выбранным тарифом и указывается в рублях. Оплата производится
              предварительно, в полном объёме. Доступ открывается после подтверждения оплаты.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Срок действия подписки</h2>
            <p className="mt-2">
              Подписка действует в течение оплаченного периода с момента активации. По окончании периода
              доступ может быть продлён повторной оплатой.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Права и обязанности сторон</h2>
            <p className="mt-2">
              Исполнитель обязуется обеспечить работоспособность Сервиса и сохранность данных Пользователя.
              Пользователь обязуется использовать Сервис в рамках законодательства и не передавать данные
              учётной записи третьим лицам.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Возврат средств</h2>
            <p className="mt-2">
              Возврат уплаченных средств возможен по письменному обращению Пользователя в течение 14 дней
              с момента оплаты при условии, что доступ к Сервису фактически не использовался.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. Ответственность</h2>
            <p className="mt-2">
              Исполнитель не несёт ответственности за решения, принятые Пользователем на основании ответов
              AI-наставников. Сервис предоставляется «как есть».
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">9. Форс-мажор</h2>
            <p className="mt-2">
              Стороны освобождаются от ответственности за неисполнение обязательств вследствие обстоятельств
              непреодолимой силы.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">10. Контакты</h2>
            <p className="mt-2">
              По вопросам, связанным с условиями Оферты, обращайтесь:
              {" "}
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
