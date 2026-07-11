export function searchWords(term: string): string[] {
  return term
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/[,()%]/g, ""));
}
