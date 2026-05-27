// Pure access-control logic — used both server- and client-side.

export type PlanSlug = "one_genius" | "school" | "family" | "full";

export type GeniusCategory = "school" | "kids" | "adult";

export interface Genius {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  category: string;
  short_description: string;
  chatgpt_url: string | null;
  image_url?: string | null;
}

const FAMILY_ADULT_SLUGS = new Set(["fingeniy", "bloggeniy", "biznesgeniy"]);

export function isGeniusUnlocked(
  genius: Pick<Genius, "slug" | "category">,
  planSlug: string | null,
  selectedOneGenius: string | null,
): boolean {
  if (!planSlug) return false;
  switch (planSlug as PlanSlug) {
    case "full":
      return true;
    case "school":
      return genius.category === "school";
    case "family":
      return (
        genius.category === "school" ||
        genius.category === "kids" ||
        (genius.category === "adult" && FAMILY_ADULT_SLUGS.has(genius.slug))
      );
    case "one_genius":
      return !!selectedOneGenius && selectedOneGenius === genius.slug;
    default:
      return false;
  }
}

export const PLAN_LABELS: Record<string, string> = {
  one_genius: "Один Гений",
  school: "Школьный пакет",
  family: "Семейный пакет",
  full: "Полный доступ",
};

export const CATEGORY_LABELS: Record<string, string> = {
  school: "Школа",
  kids: "Дети",
  adult: "Взрослым",
};

export function geniusSlugsForPlan(
  plan: PlanSlug,
  allGeniuses: Pick<Genius, "slug" | "category">[],
  oneGeniusSlug?: string | null,
): string[] {
  switch (plan) {
    case "full":
      return allGeniuses.map((g) => g.slug);
    case "school":
      return allGeniuses.filter((g) => g.category === "school").map((g) => g.slug);
    case "family":
      return allGeniuses
        .filter(
          (g) =>
            g.category === "school" ||
            g.category === "kids" ||
            (g.category === "adult" && FAMILY_ADULT_SLUGS.has(g.slug)),
        )
        .map((g) => g.slug);
    case "one_genius":
      return oneGeniusSlug ? [oneGeniusSlug] : [];
    default:
      return [];
  }
}
