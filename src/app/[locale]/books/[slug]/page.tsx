import type { Metadata } from 'next';
import { Box, Heading, Image, Link, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import {
  getAllBookSlugs,
  getBookLocales,
  getCatalogBook,
  type BookLocale,
} from '@/lib/books';
import { buildPageMetadata, SITE_URL } from '@/lib/seo';
import { bookPageVisuals } from '@/theme/bookPages';
import { BookContextBanner } from '@/components/BookContextBanner';
import { BookFacts } from '@/components/BookFacts';

export function generateStaticParams() {
  return getAllBookSlugs().flatMap((slug) =>
    getBookLocales(slug).map((locale) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const loc: BookLocale = locale === 'en' ? 'en' : 'pt';
  const book = getCatalogBook(slug, loc);
  if (!book) return {};
  const base = buildPageMetadata({
    locale,
    route: `books/${slug}`,
    title: `${book.title} — Guitta Monatega`,
    description: book.description,
  });
  const languages = Object.fromEntries(
    getBookLocales(slug).map((availableLocale) => [
      availableLocale === 'pt' ? 'pt-BR' : 'en',
      `/${availableLocale}/books/${slug}`,
    ]),
  );

  return {
    ...base,
    alternates: {
      canonical: `/${loc}/books/${slug}`,
      languages: { ...languages, 'x-default': `/pt/books/${slug}` },
    },
  };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const loc: BookLocale = locale === 'en' ? 'en' : 'pt';
  const book = getCatalogBook(slug, loc);
  if (!book) notFound();
  const t = await getTranslations('booksPage');
  const visual = bookPageVisuals[book.visualKey];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    description: book.description,
    image: book.cover ? `${SITE_URL}${book.cover}` : undefined,
    inLanguage: loc === 'pt' ? 'pt-BR' : 'en',
    author: {
      '@type': 'Person',
      '@id': `${SITE_URL}/#guitta-monatega`,
      name: 'Guitta Monatega',
    },
  };

  return (
    <Box background="offWhite" color="ink" minH="100vh">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <Box
        maxW="1200px"
        mx="auto"
        px={{ base: 'lg', md: '3xl' }}
        pt={{ base: '5xl', md: '6xl' }}
        pb={{ base: '4xl', md: '6xl' }}
        display="grid"
        gridTemplateColumns={{ base: '1fr', md: 'minmax(280px, 0.8fr) 1.2fr' }}
        gap={{ base: '2xl', md: '4xl' }}
        alignItems="start"
      >
        <Box bg="surface" position={{ md: 'sticky' }} top={{ md: '5xl' }}>
          {book.cover && (
            <Image
              src={book.cover}
              alt={book.title}
              width="100%"
              height="auto"
              decoding="async"
            />
          )}
        </Box>

        <Box>
          <NextLink href={`/${loc}/books`} style={{ textDecoration: 'underline' }}>
            <Text as="span" fontSize="sm" color="inkMuted">
              {t('backToBooks')}
            </Text>
          </NextLink>
          <Text
            fontSize="sm"
            letterSpacing="widest"
            textTransform="uppercase"
            color="inkMuted"
            mt="2xl"
            mb="md"
          >
            {t(`collections.${book.collection}`)}
          </Text>
          <Heading as="h1" textStyle="heading" fontSize="h2" lineHeight={1.05} color="ink" mb="xl">
            {book.title}
          </Heading>
          <Text fontSize="xl" color="inkSoft" lineHeight={1.8} mb="3xl">
            {book.description}
          </Text>

          {book.facts && (
            <BookFacts
              facts={book.facts}
              accentColor={visual.accent}
              labels={{
                readingAge: t('facts.readingAge'),
                pageCount: t('facts.pageCount'),
                language: t('facts.language'),
                dimensions: t('facts.dimensions'),
                publicationDate: t('facts.publicationDate'),
                isbn: t('facts.isbn'),
                pages: t('facts.pages'),
              }}
            />
          )}

          <Box as="section" aria-labelledby="book-editions-title" borderTop="1px solid" borderColor="border" pt="2xl">
            <Heading id="book-editions-title" as="h2" textStyle="heading" fontSize="2xl" color="ink" mb="xl">
              {t('editionsTitle')}
            </Heading>
            <Box display="grid" gap="md">
              {book.editions.map((edition) => (
                <Box
                  key={edition.id}
                  border="1px solid"
                  borderColor="border"
                  p={{ base: 'lg', md: 'xl' }}
                  display="flex"
                  flexDirection={{ base: 'column', sm: 'row' }}
                  alignItems={{ sm: 'center' }}
                  justifyContent="space-between"
                  gap="lg"
                >
                  <Box>
                    <Text textStyle="heading" fontSize="lg" color="ink">
                      {t(`formats.${edition.format}`)}
                    </Text>
                    {edition.retailer && (
                      <Text fontSize="sm" color="inkMuted" mt="xs">
                        {edition.retailer}
                      </Text>
                    )}
                  </Box>
                  {edition.url ? (
                    <Link
                      href={edition.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      bg="ink"
                      color="white"
                      px="xl"
                      py="md"
                      fontSize="sm"
                      letterSpacing="wide"
                      textTransform="uppercase"
                      textAlign="center"
                    >
                      {t('buyLabel')}
                    </Link>
                  ) : (
                    <Text fontSize="sm" color="inkMuted">
                      {t('soonLabel')}
                    </Text>
                  )}
                </Box>
              ))}
            </Box>
          </Box>

        </Box>
      </Box>
      <BookContextBanner
        href={`/${loc}${book.contextPath}`}
        eyebrow={t(`collections.${book.collection}`)}
        title={book.contextTitle}
        backgroundImage={visual.contextBackground}
        overlay={visual.contextOverlay}
        backgroundImageOpacity={visual.contextImageOpacity}
        textColor={visual.contextText}
        eyebrowColor={visual.contextEyebrow}
        decorations={visual.decorations}
        accentColor={visual.accent}
      />
    </Box>
  );
}
