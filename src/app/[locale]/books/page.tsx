import type { Metadata } from 'next';
import { Box, Heading, Text } from '@chakra-ui/react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BookCatalogCard } from '@/components/BookCatalogCard';
import { getCatalogBooks, type BookLocale } from '@/lib/books';
import { buildPageMetadata } from '@/lib/seo';

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
        <Heading as="h1" textStyle="heading" fontSize="h1" color="ink" mb="lg">
          {t('title')}
        </Heading>
        <Text fontSize="xl" color="inkSoft" lineHeight={1.7} maxW="720px">
          {t('intro')}
        </Text>
      </Box>

      <Box
        as="section"
        aria-label={t('catalogLabel')}
        maxW="1200px"
        mx="auto"
        px={{ base: 'lg', md: '3xl' }}
        pb={{ base: '4xl', md: '6xl' }}
        display="grid"
        gridTemplateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
        gap={{ base: 'xl', md: '2xl' }}
      >
        {books.map((book) => (
          <BookCatalogCard
            key={book.slug}
            href={`/${loc}/books/${book.slug}`}
            title={book.title}
            collection={t(`collections.${book.collection}`)}
            cover={book.cover}
            detailsLabel={t('detailsLabel')}
          />
        ))}
      </Box>
    </Box>
  );
}

