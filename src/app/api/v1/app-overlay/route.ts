import { json } from '@/lib/api/respond';
import { getAppOverlay } from '@/lib/content/appOverlay';

/**
 * GET /api/v1/app-overlay
 *
 * O que o app Android precisa e as outras rotas não carregam: conexões entre
 * verbetes, a página do universo, os livros de Kammara, privacidade,
 * subtítulos de seção e os contadores de "em breve".
 *
 * Sem `?locale=`: vem nos dois idiomas de uma vez, porque o app guarda os dois
 * no mesmo catálogo e troca de idioma sem rede.
 */
export function GET(request: Request) {
  return json(request, 'app-overlay', () => getAppOverlay());
}
