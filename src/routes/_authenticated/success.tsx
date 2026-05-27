import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/success")({
  head: () => ({ meta: [{ title: "Заявка отправлена — Академия Гениев" }] }),
  component: SuccessPage,
});

function SuccessPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-soft px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border bg-card p-10 shadow-elegant text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-soft">
          <Clock className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-bold">Заявка принята</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Ваша заявка принята. Доступ будет открыт администратором после подтверждения.
        </p>
        <Link to="/dashboard" className="block mt-8">
          <Button size="lg" className="w-full bg-gradient-hero text-primary-foreground shadow-soft">
            Перейти в кабинет
          </Button>
        </Link>
      </div>
    </div>
  );
}
