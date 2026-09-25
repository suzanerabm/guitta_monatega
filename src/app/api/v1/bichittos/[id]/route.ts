import { json, notFound, readLocale } from '@/lib/api/respond';
import { getBichitto, isKnownBichitto } from '@/lib/content/bichittos';

/** GET /api/v1/bichittos/:id?locale=pt */
export async function GET(request: Request, ctx: RouteContext<'/api/v1/bichittos/[id]'>) {
  const { id } = await ctx.params;
  const locale = readLocale(request);
  if (!isKnownBichitto(id)) return notFound('Bichitto', id);
  return json(request, `bichitto:${id}:${locale}`, () => ({
    locale,
    bichitto: getBichitto(id, locale),
  }));
}
