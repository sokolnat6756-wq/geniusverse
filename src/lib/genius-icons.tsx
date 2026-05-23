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

// Statically declared so Tailwind JIT picks the classes up.
const GRADIENT_BY_CATEGORY: Record<string, string> = {
  school: "from-violet-500 to-blue-500",
  kids: "from-pink-500 to-orange-400",
  adult: "from-emerald-500 to-slate-600",
};

const DEFAULT_GRADIENT = "from-violet-500 to-blue-500";

export function getGeniusVisual(slug: string, category: string) {
  return {
    Icon: ICON_BY_SLUG[slug] ?? Sparkles,
    gradientClass: GRADIENT_BY_CATEGORY[category] ?? DEFAULT_GRADIENT,
  };
}
