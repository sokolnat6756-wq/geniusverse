import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { GeniusCard } from "@/components/GeniusCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { getDashboardData, selectOneGenius } from "@/lib/subscription.functions";
import { isGeniusUnlocked, PLAN_LABELS } from "@/lib/access";
import { getGeniusVisual } from "@/lib/genius-icons";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Кабинет — Академия Гениев" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getData = useServerFn(getDashboardData);
  const chooseGenius = useServerFn(selectOneGenius);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getData(),
  });

  const [pickerOpen, setPickerOpen] = useState(false);
  const [picking, setPicking] = useState<string | null>(null);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const { profile, subscription, geniuses, selectedOneGenius } = data;
  const planSlug = subscription?.plan_slug ?? null;
  const planLabel = planSlug ? PLAN_LABELS[planSlug] ?? planSlug : "Нет активного тарифа";

  const handleChoose = async (slug: string) => {
    setPicking(slug);
    try {
      await chooseGenius({ data: { geniusSlug: slug } });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
      setPickerOpen(false);
      toast.success("Гений выбран!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setPicking(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="rounded-3xl bg-gradient-hero p-8 md:p-10 text-primary-foreground shadow-elegant">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-sm opacity-80">Добро пожаловать</p>
              <h1 className="text-2xl md:text-3xl font-bold mt-1">
                {profile?.full_name || profile?.email || "Гений"}
              </h1>
              <p className="opacity-80 text-sm mt-1">{profile?.email}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider opacity-70">Текущий тариф</p>
              <p className="text-lg font-semibold mt-1">{planLabel}</p>
              {subscription && (
                <p className="text-xs opacity-70 mt-0.5">
                  Активирован {new Date(subscription.created_at).toLocaleDateString("ru-RU")}
                </p>
              )}
            </div>
          </div>

          {!subscription && (
            <div className="mt-6">
              <Link to="/pricing">
                <Button variant="secondary" size="lg">
                  Выбрать тариф <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}

          {subscription?.plan_slug === "one_genius" && !selectedOneGenius && (
            <div className="mt-6 rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm">Вы ещё не выбрали своего Гения для тарифа «Один Гений».</p>
              <Button onClick={() => setPickerOpen(true)} variant="secondary" size="sm" className="mt-3">
                <Sparkles className="mr-2 h-4 w-4" /> Выбрать Гения
              </Button>
            </div>
          )}
        </div>

        {/* Geniuses */}
        <div className="mt-10">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold">Ваши Гении</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Доступные ассистенты выделены, остальные — открываются при апгрейде тарифа.
              </p>
            </div>
            {planSlug !== "full" && (
              <Link to="/pricing" className="hidden md:block">
                <Button variant="outline">Открыть полный доступ</Button>
              </Link>
            )}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {geniuses.map((g) => (
              <GeniusCard
                key={g.id}
                genius={g}
                unlocked={isGeniusUnlocked(g, planSlug, selectedOneGenius)}
                onUnlockClick={() => navigate({ to: "/pricing" })}
              />
            ))}
          </div>

          {planSlug !== "full" && (
            <div className="mt-10 rounded-3xl bg-gradient-soft p-8 text-center">
              <h3 className="text-xl font-bold">Хотите ещё больше?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Откройте полный доступ ко всем Гениям и будущим обновлениям.
              </p>
              <Link to="/pricing" className="inline-block mt-4">
                <Button className="bg-gradient-hero text-primary-foreground shadow-soft">
                  Открыть полный доступ
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Выберите своего Гения</DialogTitle>
            <DialogDescription>
              Доступен один ассистент. В любой момент можно расширить доступ через тарифы.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2 max-h-[60vh] overflow-y-auto pr-1">
            {geniuses.map((g) => {
              const { Icon, gradientClass } = getGeniusVisual(g.slug, g.category);
              return (
                <button
                  key={g.id}
                  onClick={() => handleChoose(g.slug)}
                  disabled={picking !== null}
                  className="text-left rounded-xl border p-4 transition-all hover:border-primary hover:shadow-soft disabled:opacity-50"
                >
                  <div className="flex items-start gap-3">
                    <div className={`grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${gradientClass} shadow-soft`}>
                      <Icon className="h-5 w-5 text-white" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="font-semibold">{g.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{g.short_description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
