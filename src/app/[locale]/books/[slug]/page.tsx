import type { Metadata } from 'next';
import { Box, Heading, Image, Text } from '@chakra-ui/react';
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
import { BookEditionSelector } from '@/components/BookEditionSelector';

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
        gridTemplateColumns={{ base: '1fr', md: 'minmax(280px, 0.8fr) minmax(0, 1.2fr)' }}
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

        <Box minW="0">
          <Text
            fontSize="sm"
            letterSpacing="widest"
            textTransform="uppercase"
            color="inkMuted"
            mb="md"
          >
            {t(`collections.${book.collection}`)}
          </Text>
          <Heading as="h1" textStyle="heading" fontSize="h3" lineHeight={1.05} color="ink" mb="xl">
            {book.title}
          </Heading>
          <Text fontSize="md" color="inkSoft" lineHeight={1.7} whiteSpace="pre-line" mb="3xl">
            {book.description}
          </Text>

          <Box as="section" aria-label={t('editionsTitle')} borderTop="1px solid" borderColor="border" pt="2xl">
            <BookEditionSelector
              editions={book.editions}
              locale={loc}
              accentColor={visual.accent}
              formatLabels={{
                ebook: t('formats.ebook'),
                paperback: t('formats.paperback'),
                hardcover: t('formats.hardcover'),
              }}
              factsLabels={{
                readingAge: t('facts.readingAge'),
                pageCount: t('facts.pageCount'),
                language: t('facts.language'),
                dimensions: t('facts.dimensions'),
                weight: t('facts.weight'),
                fileSize: t('facts.fileSize'),
                publicationDate: t('facts.publicationDate'),
                isbn: t('facts.isbn'),
                pages: t('facts.pages'),
              }}
              buyLabel={t('buyLabel')}
              amazonBuyLabel={t('amazonBuyLabel')}
              soonLabel={t('soonLabel')}
            />
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
