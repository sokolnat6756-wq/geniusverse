import {
  Calculator,
  PenTool,
  Languages,
  Globe2,
  Leaf,
  Landmark,
  FlaskConical,
  Atom,
  Scale,
  BookText,
  Code2,
  Rocket,
  Blocks,
  Mic,
  Megaphone,
  Wallet,
  Briefcase,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const ICON_BY_SLUG: Record<string, LucideIcon> = {
  matgeniy: Calculator,
  rusgeniy: PenTool,
  anglogeniy: Languages,
  geogeniy: Globe2,
  biogeniy: Leaf,
  istogeniy: Landmark,
  himgeniy: FlaskConical,
  fizgeniy: Atom,
  obshestvogeniy: Scale,
  litgeniy: BookText,
  infogeniy: Code2,
  astrogeniy: Rocket,
  doshkogeniy: Blocks,
  logogeniy: Mic,
  bloggeniy: Megaphone,
  fingeniy: Wallet,
  biznesgeniy: Briefcase,
};

// Single unified gradient for ALL Genius icons across the platform.
export const GENIUS_ICON_GRADIENT = "from-blue-500 to-violet-600";

export function getGeniusIcon(slug: string): LucideIcon {
  return ICON_BY_SLUG[slug] ?? Sparkles;
}

// Backward-compatible helper — gradient is now constant.
export function getGeniusVisual(slug: string, _category?: string) {
  return {
    Icon: getGeniusIcon(slug),
    gradientClass: GENIUS_ICON_GRADIENT,
  };
}
