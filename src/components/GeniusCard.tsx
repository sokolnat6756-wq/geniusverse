import { ExternalLink, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS, type Genius } from "@/lib/access";
import { getGeniusVisual } from "@/lib/genius-icons";

interface GeniusCardProps {
  genius: Genius;
  unlocked: boolean;
  onUnlockClick?: () => void;
}

export function GeniusCard({ genius, unlocked, onUnlockClick }: GeniusCardProps) {
  const { Icon, gradientClass } = getGeniusVisual(genius.slug, genius.category);

  return (
    <div
      className={cn(
        "group flex flex-col rounded-3xl p-6 transition-all duration-300 ease-out",
        unlocked
          ? "glass-panel hover:-translate-y-1 hover:scale-[1.01] hover:shadow-elegant"
          : "rounded-3xl border border-dashed border-border/60 bg-white/40 backdrop-blur-md",
      )}
    >
      <div className="flex items-start justify-between">
        {genius.image_url ? (
          <div className="h-12 w-12 overflow-hidden rounded-2xl shadow-soft ring-1 ring-white/50">
            <img
              src={genius.image_url}
              alt={genius.name}
              className={cn(
                "h-full w-full object-cover transition-transform duration-300",
                unlocked ? "group-hover:scale-105" : "opacity-60 grayscale",
              )}
              loading="lazy"
            />
          </div>
        ) : (
          <div
            className={cn(
              "grid h-12 w-12 place-items-center rounded-2xl shadow-soft transition-transform duration-300",
              unlocked
                ? `bg-gradient-to-br ${gradientClass} ring-1 ring-white/50 group-hover:scale-105`
                : "bg-muted ring-1 ring-white/30",
            )}
          >
            <Icon
              className={cn(
                "h-6 w-6",
                unlocked ? "text-white" : "text-muted-foreground",
              )}
              strokeWidth={2}
            />
          </div>
        )}
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
      <h3 className="mt-5 text-base font-semibold tracking-tight">{genius.name}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-3 flex-1">
        {genius.short_description}
      </p>

      {unlocked ? (
        <a
          href={genius.chatgpt_url ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5"
          aria-disabled={!genius.chatgpt_url}
          onClick={(e) => {
            if (!genius.chatgpt_url) e.preventDefault();
          }}
        >
          <Button
            className="w-full bg-gradient-hero text-primary-foreground shadow-soft gap-2"
            disabled={!genius.chatgpt_url}
          >
            Открыть в ChatGPT <ExternalLink className="h-4 w-4" />
          </Button>
        </a>
      ) : (
        <Button
          variant="outline"
          className="mt-5 w-full"
          onClick={onUnlockClick}
        >
          Открыть доступ
        </Button>
      )}
    </div>
  );
}
