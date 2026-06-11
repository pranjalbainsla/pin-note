export const PIN_THEMES = [
  {
    bg: "rgba(214, 228, 214, 0.72)",
    border: "rgba(168, 192, 168, 0.35)",
    header: "rgba(200, 216, 200, 0.45)",
  },
  {
    bg: "rgba(232, 218, 208, 0.72)",
    border: "rgba(200, 178, 158, 0.35)",
    header: "rgba(220, 206, 194, 0.45)",
  },
  {
    bg: "rgba(228, 222, 210, 0.72)",
    border: "rgba(198, 188, 172, 0.35)",
    header: "rgba(216, 210, 198, 0.45)",
  },
  {
    bg: "rgba(210, 222, 228, 0.72)",
    border: "rgba(168, 188, 200, 0.35)",
    header: "rgba(196, 210, 218, 0.45)",
  },
] as const;

export function getPinTheme(index: number) {
  return PIN_THEMES[index % PIN_THEMES.length];
}
