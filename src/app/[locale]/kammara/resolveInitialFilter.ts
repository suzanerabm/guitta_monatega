/**
 * Decide qual filtro/planeta abrir no carregamento da página, a partir do
 * query param `?planeta=` e da lista de mundos publicados.
 *
 * Regras:
 *  - param ausente, vazio ou inválido → 'kammara' (a vitrine do universo).
 *  - param que casa um mundo PUBLICADO → esse mundo.
 *  - param de um mundo não-publicado (incompleto) ou inexistente → 'kammara',
 *    pra ninguém forçar um planeta escondido via link.
 *
 * `'kammara'` em si é sempre válido (é a seção do universo, não um mundo da
 * lista publicada).
 */
export function resolveInitialFilter(
  param: string | null | undefined,
  publishedIds: string[],
): string {
  if (!param) return 'kammara';
  if (param === 'kammara') return 'kammara';
  return publishedIds.includes(param) ? param : 'kammara';
}
