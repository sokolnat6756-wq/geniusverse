export const PRESELECTED_GENIUS_KEY = "preselectedGenius";

export function getPreselectedGenius(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(PRESELECTED_GENIUS_KEY);
  } catch {
    return null;
  }
}

export function setPreselectedGenius(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PRESELECTED_GENIUS_KEY, slug);
  } catch {
    /* ignore */
  }
}

export function clearPreselectedGenius(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PRESELECTED_GENIUS_KEY);
  } catch {
    /* ignore */
  }
}
