import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles, Brain, GraduationCap, Users, Zap, Heart, ShieldCheck, Check, Target, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PlanCard } from "@/components/PlanCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getPublicCatalog } from "@/lib/public-data.functions";
import { CATEGORY_LABELS } from "@/lib/access";
import { getGeniusVisual } from "@/lib/genius-icons";
import { useAuth } from "@/lib/auth-context";
import { getPreselectedGenius, setPreselectedGenius } from "@/lib/preselected-genius";
import { useState, useEffect } from "react";

const catalogQuery = queryOptions({
  queryKey: ["public-catalog"],
  queryFn: () => getPublicCatalog(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Академия Гениев — AI-наставники для учёбы, речи и развития" },
      { name: "description", content: "Выберите своего Гения: для школы, английского, речи, финансов и блогинга. Обучение становится понятным, добрым и современным." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: LandingPage,
});

const PLAN_FEATURES: Record<string, string[]> = {
  one_genius: ["1 выбранный ассистент", "Помощь с заданиями", "Повышение уровня знаний"],
  school: ["Все школьные Гении", "Подготовка к ВПР / ОГЭ / ЕГЭ", "Поддержка по домашним заданиям"],
  family: ["ДошкоГений и ЛогоГений", "Все школьные Гении", "ФинГений"],
  full: ["Все Гении сразу", "Максимальный доступ"],
};

function LandingPage() {
  const { data } = useSuspenseQuery(catalogQuery);
  const { plans, geniuses } = data;
  const { session } = useAuth();
  const navigate = useNavigate();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  useEffect(() => {
    setSelectedSlug(getPreselectedGenius());
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectGenius = (slug: string, name: string) => {
    setPreselectedGenius(slug);
    setSelectedSlug(slug);
    toast.success(`Гений «${name}» выбран. Теперь выберите тариф.`);
    scrollTo("pricing");
  };

  const handlePlanSelect = (slug: string) => {
    if (slug === "one_genius") {
      const genius = getPreselectedGenius();
      if (!genius) {
        toast.info("Сначала выберите своего Гения в каталоге.");
        scrollTo("catalog");
        return;
      }
      if (session) {
        navigate({ to: "/checkout", search: { plan: slug, genius } as never });
      } else {
        navigate({ to: "/register", search: { plan: slug, genius } as never });
      }
      return;
    }
    if (session) {
      navigate({ to: "/checkout", search: { plan: slug } as never });
    } else {
      navigate({ to: "/register", search: { plan: slug } as never });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh -z-10" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl -z-10" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary-glow/20 blur-3xl -z-10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <span className="inline-flex items-center gap-2 rounded-full glass-panel px-4 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> AI-наставники нового поколения
          </span>
          <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            Академия Гениев —<br />
            <span className="text-gradient">умные помощники</span> для учёбы и развития
          </h1>
          <p className="mt-6 mx-auto max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
            Выберите своего Гения: для школы, речи, развития, английского, блогинга, финансов и личного роста.
            Обучение становится понятным, добрым и современным.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              variant="outline"
              className="glass-panel border-white/50 text-white bg-blue-500 hover:bg-blue-600"
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Узнать больше <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ДЛЯ КОГО */}
      <section id="about" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center">Для кого Академия</h2>
        <p className="mt-3 text-center text-muted-foreground max-w-2xl mx-auto">
          Гении помогают на любом этапе — от первых букв до собственного бизнеса.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: Heart, title: "Малышам и дошкольникам", text: "Игровое развитие, речь, буквы, цифры и любопытство к миру." },
            { icon: GraduationCap, title: "Школьникам", text: "Все предметы, домашка и подготовка к ВПР, ОГЭ и ЕГЭ." },
            { icon: Users, title: "Взрослым", text: "Английский, финансы, блогинг, бизнес и личный рост." },
          ].map((it) => (
            <div key={it.title} className="glass-panel rounded-3xl p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-elegant">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-soft ring-1 ring-white/50">
                <it.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">{it.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{it.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ОСНОВАТЕЛЬ */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/15 blur-3xl -z-10" aria-hidden />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-primary-glow/20 blur-3xl -z-10" aria-hidden />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="glass-panel-strong rounded-[2.5rem] shadow-elegant p-6 sm:p-8 md:p-12">
            <div className="grid gap-8 md:grid-cols-5 md:items-stretch">
              {/* Левая колонка */}
              <div className="md:col-span-2 flex flex-col">
                {/* Карточка с фото */}
                <div className="glass-panel-strong rounded-3xl p-3 shadow-soft">
                  <div className="aspect-[9/16] overflow-hidden rounded-2xl ring-1 ring-white/60 bg-gradient-hero">
                    {data.founder?.image_url ? (
                      <img
                        src={data.founder.image_url}
                        alt="Юлия Копасова — создатель Академии Гениев"
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-7xl font-bold text-white/90 tracking-tight">ЮК</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 mb-1 text-center text-lg font-semibold tracking-tight">
                    Юлия Копасова
                  </p>
                </div>

                {/* Карточка доверия */}
                <div className="mt-6 glass-panel-strong rounded-3xl p-5 shadow-soft">
                  <ul className="space-y-3.5">
                    {[
                      { icon: Users, title: "110 000+", text: "подписчиков" },
                      { icon: GraduationCap, title: "800+", text: "учеников обучены онлайн" },
                      { icon: Heart, title: "Мама 3 детей", text: "семья и забота" },
                      { icon: Briefcase, title: "Предприниматель", text: "создатель Академии Гениев" },
                    ].map((f) => (
                      <li key={f.title} className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-soft ring-1 ring-white/50">
                          <f.icon className="h-4 w-4" strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold tracking-tight leading-tight">{f.title}</p>
                          <p className="text-xs text-muted-foreground leading-tight mt-0.5">{f.text}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>


              {/* Текст */}
              <div className="md:col-span-3">
                <span className="inline-flex items-center gap-2 rounded-full glass-panel px-4 py-1.5 text-xs font-medium text-primary">
                  <Heart className="h-3.5 w-3.5" /> Личное слово основателя
                </span>
                <h2 className="mt-5 text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                  Идея, которая стала <span className="text-gradient">Академией Гениев</span>
                </h2>
                <div className="mt-6 space-y-4 text-base text-muted-foreground leading-relaxed">
                  <p>
                    Я создала Академию Гениев, чтобы современные технологии стали не сложностью,
                    а мощным инструментом развития для детей, школьников и взрослых.
                  </p>
                  <p>
                    Я верю, что каждый человек может раскрыть свой потенциал быстрее, если рядом
                    есть умный помощник, поддержка и доступ к знаниям.
                  </p>
                  <p>
                    Так появилась Академия Гениев — пространство AI-помощников для обучения,
                    роста и новых возможностей.
                  </p>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: Sparkles, title: "Умные AI-помощники", text: "Поддержка в учебе, развитии и достижении целей." },
                    { icon: Target, title: "Индивидуальный подход", text: "Каждый Гений создан для конкретных задач и потребностей." },
                    { icon: ShieldCheck, title: "Безопасное пространство", text: "Контролируемый доступ и современная цифровая среда." },
                  ].map((f) => (
                    <div key={f.title} className="glass-panel rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elegant">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-soft ring-1 ring-white/50">
                        <f.icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-3 text-sm font-semibold tracking-tight">{f.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-white/40 pt-6 text-center">
              <p className="text-base md:text-lg font-medium italic text-gradient">
                Мечтайте. Учитесь. Действуйте. Будущее начинается сегодня.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* КАТАЛОГ ГЕНИЕВ */}
      <section id="catalog" className="relative bg-gradient-mesh py-20 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center tracking-tight">Каталог Гениев</h2>
          <p className="mt-3 text-center text-muted-foreground">
            Выберите Гения, который подходит именно вам — затем подберём тариф.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {geniuses.map((g) => {
              const { Icon, gradientClass } = getGeniusVisual(g.slug, g.category);
              const isSelected = selectedSlug === g.slug;
              return (
                <div
                  key={g.id}
                  className={`group glass-panel flex flex-col rounded-3xl p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-elegant ${
                    isSelected ? "ring-2 ring-primary shadow-elegant" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    {g.image_url ? (
                      <div className="h-12 w-12 overflow-hidden rounded-2xl shadow-soft ring-1 ring-white/50">
                        <img src={g.image_url} alt={g.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      </div>
                    ) : (
                      <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${gradientClass} shadow-soft ring-1 ring-white/50 transition-transform duration-300 group-hover:scale-105`}>
                        <Icon className="h-6 w-6 text-white" strokeWidth={2} />
                      </div>
                    )}
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {CATEGORY_LABELS[g.category] ?? g.category}
                    </span>
                  </div>
                  <h3 className="mt-5 font-semibold tracking-tight">{g.name}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2 flex-1">{g.short_description}</p>
                  <Button
                    onClick={() => handleSelectGenius(g.slug, g.name)}
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    className={`mt-4 w-full ${isSelected ? "bg-gradient-hero text-primary-foreground shadow-soft" : ""}`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="mr-1.5 h-4 w-4" /> Выбран
                      </>
                    ) : (
                      "Выбрать этого Гения"
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* КАК РАБОТАЕТ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center">Как это работает</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { n: "01", title: "Выберите тариф", text: "От одного Гения до полного доступа ко всей экосистеме." },
            { n: "02", title: "Активируйте доступ", text: "Регистрация занимает 30 секунд — никаких лишних шагов." },
            { n: "03", title: "Начните общаться", text: "Ваш Гений готов помогать с задачами и учить новому." },
          ].map((s) => (
            <div key={s.n} className="rounded-3xl border border-border/60 bg-white/70 backdrop-blur-md p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant">
              <span className="text-sm font-mono text-primary font-semibold">{s.n}</span>
              <h3 className="mt-2 text-lg font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ПРЕИМУЩЕСТВА */}
      <section className="bg-gradient-mesh py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center tracking-tight">Почему Академия Гениев</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Brain, title: "Понятно объясняем", text: "Простые шаги без сухих формулировок." },
              { icon: ShieldCheck, title: "Бережно к детям", text: "Дружелюбный тон и безопасный контент." },
              { icon: Zap, title: "Быстрая помощь", text: "Ответ в один клик — без поиска по учебникам." },
              { icon: Sparkles, title: "Развиваемся", text: "Новые Гении и навыки появляются регулярно." },
            ].map((f) => (
              <div key={f.title} className="glass-panel rounded-3xl p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-elegant">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-soft ring-1 ring-white/50">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ТАРИФЫ */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 scroll-mt-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center">Тарифы</h2>
        <p className="mt-3 text-center text-muted-foreground">
          {selectedSlug
            ? "Гений выбран — осталось подобрать удобный формат доступа."
            : "Для тарифа «Один Гений» сначала выберите Гения в каталоге выше."}
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => (
            <PlanCard
              key={p.id}
              name={p.name}
              price={p.price}
              description={p.description ?? ""}
              features={PLAN_FEATURES[p.slug] ?? []}
              highlight={p.slug === "family"}
              ctaLabel={p.slug === "one_genius" && !selectedSlug ? "Сначала выберите Гения" : "Выбрать тариф"}
              onSelect={() => handlePlanSelect(p.slug)}
            />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center">Частые вопросы</h2>
        <Accordion type="single" collapsible className="mt-10">
          <AccordionItem value="1">
            <AccordionTrigger>Подходит ли это младшим школьникам?</AccordionTrigger>
            <AccordionContent>Да. У нас есть отдельные Гении для дошкольников и младших школьников — они общаются простым, добрым языком.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="2">
            <AccordionTrigger>Можно ли купить только одного Гения?</AccordionTrigger>
            <AccordionContent>Да, тариф «Один Гений» — это точечная помощь по одному направлению.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="3">
            <AccordionTrigger>Будут ли появляться новые Гении?</AccordionTrigger>
            <AccordionContent>Да. В тарифе «Полный доступ» все будущие ассистенты подключаются автоматически.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="4">
            <AccordionTrigger>Как работает оплата?</AccordionTrigger>
            <AccordionContent>На этом этапе платформа в режиме раннего доступа — оплата тестовая. Реальные платежи подключим в следующей версии.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* ФИНАЛЬНЫЙ CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-hero p-10 md:p-16 text-center text-primary-foreground shadow-elegant">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" aria-hidden />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Готовы найти своего Гения?</h2>
            <p className="mt-3 max-w-xl mx-auto opacity-90 leading-relaxed">
              Начните учиться по-новому — с тёплым, понятным и умным наставником.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="active:scale-[0.98] transition-transform">Создать аккаунт</Button>
              </Link>
              <Button
                size="lg"
                variant="ghost"
                className="glass-panel-dark border border-white/30 text-white hover:bg-white/20 hover:text-white"
                onClick={() => scrollTo("catalog")}
              >
                Выбрать Гения
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
