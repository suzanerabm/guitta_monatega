import { kammaraContentApi } from '@/lib/kammara-app-content';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export function GET(request: Request) {
  // Enable only after the hosting rate limit is configured, including preview domains.
  if (process.env.KAMMARA_APP_API_ENABLED !== 'true') {
    return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }
  return kammaraContentApi.page(request);
}
