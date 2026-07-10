/**
 * Decide qual criatura abrir no carregamento da página /bichittos, a partir do
 * query param `?bichitto=` e da lista de criaturas publicadas.
 *
 * Regras:
 *  - param ausente, vazio ou inválido → a primeira criatura publicada (napcat).
 *  - param que casa uma criatura PUBLICADA → essa criatura.
 *  - param de criatura não-publicada ou inexistente → a primeira publicada,
 *    pra ninguém forçar uma criatura escondida via link.
 *
 * Diferente do kammara, a bichittos não tem seção "intro": o default é sempre
 * a primeira criatura da lista publicada.
 */
export function resolveInitialBichitto(
  param: string | null | undefined,
  publishedIds: string[],
): string {
  const fallback = publishedIds[0] ?? '';
  if (!param) return fallback;
  return publishedIds.includes(param) ? param : fallback;
}
