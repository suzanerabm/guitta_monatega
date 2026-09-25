import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './src/i18n/routing';

const handleI18nRouting = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // A raiz sempre representa a edição em português. Um redirect permanente
  // evita que buscadores tratem `/` como uma URL temporária/duplicada.
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/pt', request.url), 308);
  }

  return handleI18nRouting(request);
}

export const config = {
  // Match all pathnames except for those starting with /api, /_next, /_vercel,
  // /export (chrome-free static-export routes, no locale), or containing a
  // file extension (e.g. /favicon.ico)
  matcher: '/((?!api|_next|_vercel|export|.*\\..*).*)',
};
