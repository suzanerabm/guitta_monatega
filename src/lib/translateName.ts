/**
 * Translate a multi-word name (derived from a filename) using the i18n
 * `common.words` dictionary.
 *
 * The manifest stores raw cleaned filenames as `name` (e.g. "napcat dormindo"),
 * and at render time we look up each word in the active locale's word
 * dictionary so the same image gets a localized label.
 *
 * Words not present in the dictionary fall back to their original form.
 */
export function translateName(
  raw: string,
  words: Record<string, string>
): string {
  return raw
    .split(/\s+/)
    .map((word) => {
      const key = word.toLowerCase();
      return words[key] ?? word;
    })
    .join(' ');
}
