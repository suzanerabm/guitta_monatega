import type { Metadata } from 'next';
import { Box, Heading, Text } from '@chakra-ui/react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BookCatalog } from '@/components/BookCatalog';
import { getCatalogBooks, type BookLocale } from '@/lib/books';
import { buildPageMetadata } from '@/lib/seo';
import { homeBooksGallery } from '@/theme/artSections';

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
    <Box bg={homeBooksGallery.background} color="ink" minH="100vh">
      <Box as="section" background="white">
        <Box
          maxW="1200px"
          mx="auto"
          px={{ base: 'lg', md: '3xl' }}
          pt={{ base: '5xl', md: '5xl' }}
          pb={{ base: 'xl', md: '2xl' }}
        >
          <Heading
            as="h1"
            textStyle="heading"
            fontSize="2xl"
            letterSpacing="tight"
            m="0"
            mb="tight"
            color={homeBooksGallery.titleColor}
          >
            {t('title')}
          </Heading>
          <Text
            fontFamily="body"
            fontSize="sm"
            letterSpacing="wide"
            textTransform="uppercase"
            m="0"
            color={homeBooksGallery.titleColor}
          >
            {t('intro')}
          </Text>
        </Box>
      </Box>

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
