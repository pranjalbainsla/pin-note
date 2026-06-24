export const NEW_NOTE_ID = "new";

export const AUTOSAVE_DELAY_MS = 1000;

export const DEFAULT_FONT_SIZE_PX = 18;
export const MIN_FONT_SIZE_PX = 14;
export const MAX_FONT_SIZE_PX = 28;
export const FONT_SIZE_STEP_PX = 2;

export function clampFontSizePx(size: number): number {
  return Math.min(MAX_FONT_SIZE_PX, Math.max(MIN_FONT_SIZE_PX, size));
}
