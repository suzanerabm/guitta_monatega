import type { Metadata } from 'next';
import { Box } from '@chakra-ui/react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BookCatalog } from '@/components/BookCatalog';
import { HeroSection } from '@/components/HeroSection';
import { getCatalogBooks, type BookLocale } from '@/lib/books';
import { buildPageMetadata } from '@/lib/seo';
import { artHero } from '@/theme/artSections';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'booksPage' });
  return buildPageMetadata({
    locale,
    route: 'books',
    title: t('pageTitle'),
    description: t('description'),
  });
}

export default async function BooksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc: BookLocale = locale === 'en' ? 'en' : 'pt';
  const t = await getTranslations('booksPage');
  const books = getCatalogBooks(loc);

  return (
    <Box bg="white" color="ink" minH="100vh">
      <HeroSection
        label={t('catalogLabel')}
        title={t('title')}
        description={t('intro')}
        background={artHero.background}
        textColor={artHero.textColor}
        labelColor={artHero.labelColor}
        minHeight="35vh"
      />

      <BookCatalog
        books={books}
        locale={loc}
        labels={{
          filterLabel: t('filterLabel'),
          allFormats: t('allFormats'),
          fromPrice: t('fromPrice'),
          details: t('detailsLabel'),
          comingSoon: t('soonLabel'),
          collections: {
            art: t('collections.art'),
            bichittos: t('collections.bichittos'),
            kammara: t('collections.kammara'),
          },
          formats: {
            ebook: t('formats.ebook'),
            paperback: t('formats.paperback'),
            hardcover: t('formats.hardcover'),
          },
        }}
      />
    </Box>
  );
}
