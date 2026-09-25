import { json } from '@/lib/api/respond';
import { getArtSections } from '@/lib/content/art';

/**
 * GET /api/v1/art
 *
 * Sem `locale`: o payload é só caminho de imagem. Título e técnica de cada
 * seção vivem nas mensagens de i18n, não nos dados.
 */
export function GET(request: Request) {
  return json(request, 'art', () => ({ sections: getArtSections() }));
}
