export const NEW_NOTE_ID = "new";

export const AUTOSAVE_DELAY_MS = 1000;

export const DEFAULT_FONT_SIZE_PX = 18;
export const MIN_FONT_SIZE_PX = 14;
export const MAX_FONT_SIZE_PX = 28;
export const FONT_SIZE_STEP_PX = 2;

export function clampFontSizePx(size: number): number {
  return Math.min(MAX_FONT_SIZE_PX, Math.max(MIN_FONT_SIZE_PX, size));
}

export const NOTE_FONT_FAMILIES = ["newsreader", "google-sans-flex"] as const;
export type NoteFontFamily = (typeof NOTE_FONT_FAMILIES)[number];
export const DEFAULT_FONT_FAMILY: NoteFontFamily = "newsreader";

export function nextFontFamily(current: NoteFontFamily): NoteFontFamily {
  const i = NOTE_FONT_FAMILIES.indexOf(current);
  return NOTE_FONT_FAMILIES[(i + 1) % NOTE_FONT_FAMILIES.length];
}

export function isNoteFontFamily(value: string): value is NoteFontFamily {
  return (NOTE_FONT_FAMILIES as readonly string[]).includes(value);
}

export function normalizeFontFamily(value: string): NoteFontFamily {
  return isNoteFontFamily(value) ? value : DEFAULT_FONT_FAMILY;
}

export const NOTE_FONT_CSS: Record<NoteFontFamily, string> = {
  newsreader: "var(--font-serif)",
  "google-sans-flex": "var(--font-google-sans-flex)",
};

export const NOTE_FONT_DISPLAY_NAMES: Record<NoteFontFamily, string> = {
  newsreader: "Newsreader",
  "google-sans-flex": "Google Sans Flex",
};
