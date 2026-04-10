import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for those starting with /api, /_next, /_vercel,
  // or containing a file extension (e.g. /favicon.ico)
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
