import ptBR from './pt-BR';
import en from './en';

const translations = { 'pt-BR': ptBR, 'en': en } as const;

export type Locale = keyof typeof translations;
export type Translations = typeof ptBR;

export function useTranslations(locale: string): Translations {
  return translations[locale as Locale] ?? ptBR;
}

export function getLocaleFromUrl(url: URL): Locale {
  const [, segment] = url.pathname.split('/');
  if (segment === 'en') return 'en';
  return 'pt-BR';
}

export function getLocalizedPath(path: string, locale: Locale): string {
  // Remove leading /en if present, then add prefix for non-default locale
  const cleanPath = path.replace(/^\/en/, '') || '/';
  if (locale === 'en') return `/en${cleanPath}`;
  return cleanPath;
}

export function getAlternateLocale(locale: Locale): Locale {
  return locale === 'pt-BR' ? 'en' : 'pt-BR';
}
