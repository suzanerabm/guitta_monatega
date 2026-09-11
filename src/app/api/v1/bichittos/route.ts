import { json, readLocale } from '@/lib/api/respond';
import { getBichittos } from '@/lib/content/bichittos';

/** GET /api/v1/bichittos?locale=pt — criaturas publicadas, na ordem canônica. */
export function GET(request: Request) {
  const locale = readLocale(request);
  return json(request, `bichittos:${locale}`, () => ({
    locale,
    bichittos: getBichittos(locale),
  }));
}
