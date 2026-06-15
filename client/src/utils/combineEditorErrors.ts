/** Merges editor-scoped error messages into a single display string. */
export function combineEditorErrors(...errors: string[]): string {
  return errors.filter(Boolean).join(" · ");
}
