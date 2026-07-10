/**
 * Decide qual seção de arte abrir no carregamento da página /art, a partir do
 * query param `?art=` e da lista de seções.
 *
 * Regras:
 *  - param ausente, vazio ou inválido → a primeira seção da lista.
 *  - param que casa uma seção → essa seção.
 */
export function resolveInitialArt(
  param: string | null | undefined,
  sectionIds: string[],
): string {
  const fallback = sectionIds[0] ?? '';
  if (!param) return fallback;
  return sectionIds.includes(param) ? param : fallback;
}
