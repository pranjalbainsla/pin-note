export function isNoteEmpty(title: string, html: string): boolean {
  const stripped = html.replace(/<[^>]*>/g, "").trim();
  return title.trim() === "" && stripped === "";
}
