import { json, readLocale } from '@/lib/api/respond';
import { getProgress } from '@/lib/content/kammara';

/**
 * GET /api/v1/progress?locale=pt
 *
 * Heatmap "Próximos Planetas". `progress: null` quando todo mundo já chegou a
 * 100% — é o mesmo sinal que a página usa pra não renderizar a seção.
 */
export function GET(request: Request) {
  const locale = readLocale(request);
  return json(request, `progress:${locale}`, () => ({
    locale,
    progress: getProgress(locale),
  }));
}
