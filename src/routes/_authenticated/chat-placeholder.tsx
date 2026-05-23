import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getPublicCatalog } from "@/lib/public-data.functions";

interface ChatSearch { genius?: string }

const catalogQuery = queryOptions({
  queryKey: ["public-catalog"],
  queryFn: () => getPublicCatalog(),
});

export const Route = createFileRoute("/_authenticated/chat-placeholder")({
  head: () => ({ meta: [{ title: "Чат — Академия Гениев" }] }),
  validateSearch: (s: Record<string, unknown>): ChatSearch => ({
    genius: typeof s.genius === "string" ? s.genius : undefined,
  }),
  component: ChatPlaceholder,
});

function ChatPlaceholder() {
  const { genius: slug } = Route.useSearch();
  const { data } = useQuery(catalogQuery);
  const genius = data?.geniuses.find((g) => g.slug === slug);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> В кабинет
        </Link>

        <div className="mt-8 rounded-3xl border bg-card p-10 shadow-elegant text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-gradient-soft text-4xl">
            {genius?.emoji ?? "✨"}
          </div>
          <h1 className="mt-6 text-2xl md:text-3xl font-bold">
            Чат с {genius?.name ?? "Гением"} скоро будет здесь
          </h1>
          <p className="mt-3 text-muted-foreground">
            На следующем этапе мы подключим AI-чат, историю сообщений и персональные инструкции для каждого Гения.
          </p>

          <div className="mt-8 rounded-2xl bg-gradient-soft p-4 text-sm text-left">
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles className="h-4 w-4 text-primary" /> Что появится здесь
            </div>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>• Полноценный AI-чат с памятью</li>
              <li>• История диалогов</li>
              <li>• Персональные инструкции для каждого Гения</li>
            </ul>
          </div>

          <Link to="/dashboard" className="block mt-8">
            <Button size="lg" className="w-full bg-gradient-hero text-primary-foreground shadow-soft">
              Вернуться в кабинет
            </Button>
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
