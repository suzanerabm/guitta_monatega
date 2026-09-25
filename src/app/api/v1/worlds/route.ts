import { json, readLocale } from '@/lib/api/respond';
import { getWorlds } from '@/lib/content/kammara';

/**
 * GET /api/v1/worlds?locale=pt
 *
 * Mundos de Kammara publicados, com lore, subsistemas, personagens, cenas e
 * drops já resolvidos para o idioma. Mundo não publicado não aparece — o gate
 * roda dentro de `getWorlds`, a mesma função que a página usa.
 */
export function GET(request: Request) {
  const locale = readLocale(request);
  return json(request, `worlds:${locale}`, () => ({
    locale,
    worlds: getWorlds(locale),
  }));
}
