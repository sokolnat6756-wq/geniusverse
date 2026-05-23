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
    <div
      className={cn(
        "relative flex flex-col rounded-3xl border bg-card p-7 transition-all",
        highlight
          ? "border-primary/30 shadow-elegant ring-1 ring-primary/20"
          : "border-border shadow-soft hover:shadow-elegant",
      )}
    >
      {highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-hero px-3 py-1 text-xs font-semibold text-primary-foreground shadow-soft">
          Популярный
        </span>
      )}
      <h3 className="text-lg font-semibold">{name}</h3>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight">{price.toLocaleString("ru-RU")}</span>
        <span className="text-muted-foreground">₽</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>

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
          "mt-6 w-full",
          highlight && "bg-gradient-hero text-primary-foreground shadow-soft",
        )}
        variant={highlight ? "default" : "outline"}
      >
        {loading ? "..." : ctaLabel}
      </Button>
    </div>
  );
}
