import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { activateMockSubscription } from "@/lib/subscription.functions";
import { getPublicCatalog } from "@/lib/public-data.functions";

interface CheckoutSearch { plan?: string }

const catalogQuery = queryOptions({
  queryKey: ["public-catalog"],
  queryFn: () => getPublicCatalog(),
});

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({ meta: [{ title: "Оформление — Академия Гениев" }] }),
  validateSearch: (s: Record<string, unknown>): CheckoutSearch => ({
    plan: typeof s.plan === "string" ? s.plan : undefined,
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { plan } = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const activate = useServerFn(activateMockSubscription);
  const { data, isLoading } = useQuery(catalogQuery);
  const [submitting, setSubmitting] = useState(false);

  const selected = data?.plans.find((p) => p.slug === plan);

  const handlePay = async () => {
    if (!plan) return;
    setSubmitting(true);
    try {
      await activate({ data: { planSlug: plan as "one_genius" | "school" | "family" | "full" } });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
      navigate({ to: "/success" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось активировать тариф");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-xl px-4 sm:px-6 py-16">
        <Link to="/pricing" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> К тарифам
        </Link>

        <h1 className="mt-4 text-3xl font-bold">Оформление доступа</h1>
        <p className="text-muted-foreground mt-1">Тестовый платёж — реальной оплаты не происходит.</p>

        <div className="mt-8 rounded-3xl border bg-card p-7 shadow-elegant">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : !selected ? (
            <div className="text-sm text-muted-foreground">
              Тариф не выбран. <Link to="/pricing" className="text-primary hover:underline">Перейти к тарифам</Link>.
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between">
                <h2 className="text-xl font-semibold">{selected.name}</h2>
                <div className="text-2xl font-bold">{selected.price.toLocaleString("ru-RU")} ₽</div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{selected.description}</p>

              <div className="mt-6 rounded-xl bg-gradient-soft p-4 text-xs text-muted-foreground">
                На этом этапе MVP оплата не списывается. После клика тариф активируется в вашем кабинете.
              </div>

              <Button
                onClick={handlePay}
                disabled={submitting}
                className="mt-6 w-full bg-gradient-hero text-primary-foreground shadow-soft"
                size="lg"
              >
                {submitting ? "Активируем..." : "Оплатить тестово"}
              </Button>
              <p className="mt-3 text-xs text-muted-foreground text-center">
                Нажимая «Оплатить», вы принимаете условия{" "}
                <Link to="/offer" className="text-primary hover:underline">оферты</Link>.
              </p>
            </>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
