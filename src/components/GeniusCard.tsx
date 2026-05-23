import { Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS, type Genius } from "@/lib/access";

interface GeniusCardProps {
  genius: Genius;
  unlocked: boolean;
  onUnlockClick?: () => void;
}

export function GeniusCard({ genius, unlocked, onUnlockClick }: GeniusCardProps) {
  return (
    <div
      className={cn(
        "group flex flex-col rounded-2xl border bg-card p-5 transition-all",
        unlocked
          ? "border-border shadow-soft hover:shadow-elegant hover:-translate-y-0.5"
          : "border-dashed border-border/70 bg-muted/30",
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "grid h-12 w-12 place-items-center rounded-xl text-2xl",
            unlocked ? "bg-gradient-soft" : "bg-muted",
          )}
        >
          {genius.emoji}
        </div>
        {unlocked ? (
          <Badge variant="secondary" className="text-[10px]">
            {CATEGORY_LABELS[genius.category] ?? genius.category}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px] gap-1">
            <Lock className="h-3 w-3" /> Недоступно
          </Badge>
        )}
      </div>
      <h3 className="mt-4 text-base font-semibold">{genius.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-3 flex-1">
        {genius.short_description}
      </p>

      {unlocked ? (
        <Link
          to="/chat-placeholder"
          search={{ genius: genius.slug }}
          className="mt-4"
        >
          <Button className="w-full bg-gradient-hero text-primary-foreground shadow-soft">
            Открыть чат
          </Button>
        </Link>
      ) : (
        <Button
          variant="outline"
          className="mt-4 w-full"
          onClick={onUnlockClick}
        >
          Открыть доступ
        </Button>
      )}
    </div>
  );
}
