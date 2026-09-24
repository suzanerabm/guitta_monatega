import type { Metadata } from 'next';
import { Box, Heading, Text } from '@chakra-ui/react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BookCatalog } from '@/components/BookCatalog';
import { getCatalogBooks, type BookLocale } from '@/lib/books';
import { buildPageMetadata } from '@/lib/seo';
import { bookPageLayout } from '@/theme/bookPages';

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
      <Box
        as="header"
        maxW="1200px"
        mx="auto"
        px={{ base: 'lg', md: '3xl' }}
        pt={{ base: '5xl', md: '6xl' }}
        pb={{ base: '2xl', md: '4xl' }}
      >
        <Text
          fontSize="sm"
          letterSpacing="widest"
          textTransform="uppercase"
          color="inkMuted"
          mb="md"
        >
          {t('eyebrow')}
        </Text>
        <Heading as="h1" textStyle="heading" fontSize={bookPageLayout.catalogTitleSize} color="ink" mb="lg">
          {t('title')}
        </Heading>
        <Text fontSize="xl" color="inkSoft" lineHeight={1.7} maxW="720px">
          {t('intro')}
        </Text>
      </Box>

      <BookCatalog
        books={books}
        locale={loc}
        labels={{
          filterLabel: t('filterLabel'),
          allFormats: t('allFormats'),
          fromPrice: t('fromPrice'),
          details: t('detailsLabel'),
          collections: {
            art: t('collections.art'),
            bichittos: t('collections.bichittos'),
            kammara: t('collections.kammara'),
          },
          formats: {
            ebook: t('formats.ebook'),
            paperback: t('formats.paperback'),
            hardcover: t('formats.hardcover'),
            print: t('formats.print'),
          },
        }}
      />
    </Box>
  );
}
