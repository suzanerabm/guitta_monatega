import { json, readLocale } from '@/lib/api/respond';
import { getMosaic } from '@/lib/content/kammara';

/** GET /api/v1/mosaic?locale=pt — clipes do mosaico de planetas publicados. */
export function GET(request: Request) {
  const locale = readLocale(request);
  return json(request, `mosaic:${locale}`, () => ({
    locale,
    clips: getMosaic(locale),
  }));
}
