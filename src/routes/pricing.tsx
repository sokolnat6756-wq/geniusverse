import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PlanCard } from "@/components/PlanCard";
import { useAuth } from "@/lib/auth-context";
import { getPublicCatalog } from "@/lib/public-data.functions";

const catalogQuery = queryOptions({
  queryKey: ["public-catalog"],
  queryFn: () => getPublicCatalog(),
});

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Тарифы — Академия Гениев" },
      { name: "description", content: "Выберите подходящий тариф: один Гений, школьный или семейный пакет, полный доступ." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: PricingPage,
});

const FEATURES: Record<string, string[]> = {
  one_genius: ["1 выбранный ассистент", "Помощь с заданиями", "Мини-проверки знаний"],
  school: ["Все школьные Гении", "Подготовка к ВПР / ОГЭ / ЕГЭ", "Поддержка по домашним заданиям"],
  family: ["ДошкоГений и ЛогоГений", "Все школьные Гении", "ФинГений, БлогГений, БизнесГений"],
  full: ["Все Гении сразу", "Будущие ассистенты бесплатно", "Максимальный доступ"],
};

function PricingPage() {
  const { data } = useSuspenseQuery(catalogQuery);
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (slug: string) => {
    if (loading) return;
    if (!session) {
      navigate({ to: "/register", search: { plan: slug } as never });
    } else {
      navigate({ to: "/checkout", search: { plan: slug } as never });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Тарифы</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            От точечной помощи до доступа ко всей экосистеме Гениев.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {data.plans.map((p) => (
            <PlanCard
              key={p.id}
              name={p.name}
              price={p.price}
              description={p.description ?? ""}
              features={FEATURES[p.slug] ?? []}
              highlight={p.slug === "family"}
              onSelect={() => handleSelect(p.slug)}
            />
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
