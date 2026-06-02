import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  name: string;
  price: number;
  description: string;
  features: string[];
  ctaLabel?: string;
  highlight?: boolean;
  onSelect?: () => void;
  loading?: boolean;
}

export function PlanCard({
  name,
  price,
  description,
  features,
  ctaLabel = "Выбрать тариф",
  highlight = false,
  onSelect,
  loading = false,
}: PlanCardProps) {
  return (
    <div className="relative">
      {highlight && (
        <div className="absolute -inset-1 -z-10 rounded-[2rem] bg-gradient-hero opacity-30 blur-2xl" aria-hidden />
      )}
      <div
        className={cn(
          "relative flex flex-col rounded-3xl p-7 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-elegant",
          highlight ? "glass-panel-strong ring-1 ring-primary/30" : "glass-panel",
        )}
      >
        {highlight && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-hero px-3 py-1 text-xs font-semibold text-primary-foreground shadow-soft">
            Популярный
          </span>
        )}
        <h3 className="text-lg font-semibold tracking-tight">{name}</h3>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight">{price.toLocaleString("ru-RU")}</span>
          <span className="text-muted-foreground">₽</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>

        <ul className="mt-6 space-y-2.5 text-sm flex-1">
          {features.map((f) => (
            <li key={f} className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={onSelect}
          disabled={loading}
          className={cn(
            "mt-6 w-full active:scale-[0.98] transition-transform",
            highlight && "bg-gradient-hero text-primary-foreground shadow-soft",
          )}
          variant={highlight ? "default" : "outline"}
        >
          {loading ? "..." : ctaLabel}
        </Button>
      </div>
    </div>
  );
}
