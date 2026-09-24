import type { Metadata } from 'next';

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://guittamonategastudio.com'
).replace(/\/$/, '');

export const SITE_NAME = 'Guitta Monatega Studio';
export const SOCIAL_IMAGE = '/imgs/banners/banner_zeco.jpg';

export type SiteLocale = 'pt' | 'en';

export function normalizeLocale(locale: string): SiteLocale {
  return locale === 'en' ? 'en' : 'pt';
}

export function localizedPath(locale: SiteLocale, route = ''): string {
  return route ? `/${locale}/${route}` : `/${locale}`;
}

export function buildPageMetadata({
  locale,
  route = '',
  title,
  description,
}: {
  locale: string;
  route?: string;
  title: string;
  description: string;
}): Metadata {
  const normalizedLocale = normalizeLocale(locale);
  const path = localizedPath(normalizedLocale, route);

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: {
        'pt-BR': localizedPath('pt', route),
        en: localizedPath('en', route),
        'x-default': localizedPath('pt', route),
      },
    },
    openGraph: {
      type: 'website',
      url: path,
      siteName: SITE_NAME,
      title,
      description,
      locale: normalizedLocale === 'pt' ? 'pt_BR' : 'en_US',
      alternateLocale: normalizedLocale === 'pt' ? ['en_US'] : ['pt_BR'],
      images: [{ url: SOCIAL_IMAGE, width: 1400, height: 600, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [SOCIAL_IMAGE],
    },
  };
}

