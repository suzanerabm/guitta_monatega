'use client';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Breadcrumb } from './Breadcrumb';

/**
 * Reads the current path and locale to render the Breadcrumb automatically
 * on every page except the home. Maps the URL segment (bichittos, kammara,
 * art, about, books) to a translated label. Nested pages use their root
 * segment so a book detail URL still reads "Livros"/"Books".
 */
export function AutoBreadcrumb() {
  const pathname = usePathname() ?? '/';
  const locale = useLocale();
  const t = useTranslations('common');

  // Strip the locale prefix to get the page segment
  const segment = pathname.replace(/^\/(pt|en)(?=\/|$)/, '').replace(/^\//, '');
  const rootSegment = segment.split('/')[0];

  // No breadcrumb on the home page
  if (!segment) return null;

  // Map segment -> translated label
  const labels: Record<string, { pt: string; en: string }> = {
    about: { pt: 'Sobre', en: 'About' },
    'licensing-partnerships': { pt: 'Licenciamento e parcerias', en: 'Licensing & Partnerships' },
    bichittos: { pt: 'Bichittos', en: 'Bichittos' },
    kammara: { pt: 'Kammara', en: 'Kammara' },
    art: { pt: 'Arte', en: 'Art' },
    books: { pt: 'Livros', en: 'Books' },
  };

  const label =
    labels[rootSegment]?.[locale === 'en' ? 'en' : 'pt'] ?? rootSegment;

  const backLabel = (() => {
    try {
      return t('back');
    } catch {
      return locale === 'en' ? 'back' : 'voltar';
    }
  })();

  const homePath = `/${locale}`;

  return (
    <Breadcrumb
      items={[{ label }]}
      homePath={homePath}
      backLabel={backLabel}
      useGlyphs={rootSegment === 'kammara'}
    />
  );
}
