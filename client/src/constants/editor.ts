export const ZERO_WIDTH_SPACE = "\u200B";
export const AUTOSAVE_DELAY_MS = 1000;

export const MARKDOWN_PATTERNS = [
  { regex: /\*\*([^*\n]+)\*\*$/,          tag: "strong" as const },
  { regex: /(?<!\*)\*([^*\n]+)\*(?!\*)$/, tag: "em"     as const },
  { regex: /`([^`\n]+)`$/,                tag: "code"   as const },
];