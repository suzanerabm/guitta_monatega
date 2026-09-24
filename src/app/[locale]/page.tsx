import type { Metadata } from 'next';
import { Box, Heading, Text, VisuallyHidden } from '@chakra-ui/react';
import NextLink from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HomeBanner } from '@/components/HomeBanner';
import { BookCatalogCarousel } from '@/components/BookCatalogCarousel';
import { buildPageMetadata, SITE_URL } from '@/lib/seo';
import { getCatalogBooks } from '@/lib/books';
// import { DSCard } from '@/components/DSCard';
// import { BichittosBannerWithNinha } from './BichittosBannerWithNinha';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  return buildPageMetadata({
    locale,
    title: locale === 'en' ? 'Guitta Monatega — Books, Art & Original Worlds' : 'Guitta Monatega — Livros, Arte e Universos Autorais',
    description: `${t('heroSub')} ${t('books.description')}`,
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const tBooks = await getTranslations('booksPage');
  const loc = locale === 'en' ? 'en' : 'pt';

  const prefix = `/${locale}`;
  const books = getCatalogBooks(loc).filter((book) =>
    book.editions.some((edition) => edition.url !== null),
  );
  const booksJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t('books.title'),
    numberOfItems: books.length,
    itemListElement: books.map((book, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Book',
        name: book.title,
        image: book.cover ? `${SITE_URL}${book.cover}` : undefined,
        url: book.editions.find((edition) => edition.url)?.url,
        inLanguage: locale === 'en' ? 'en' : 'pt-BR',
        author: {
          '@type': 'Person',
          '@id': `${SITE_URL}/#guitta-monatega`,
          name: 'Guitta Monatega',
        },
      },
    })),
  };
  return (
    <>
      {books.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(booksJsonLd).replace(/</g, '\\u003c'),
          }}
        />
      )}
      <VisuallyHidden as="h1">{t('title')}</VisuallyHidden>
      {/* <HeroSection
        variant="home"
        title="guitta monatega"
        label={t('heroSub')}
        minHeight="10vh"
      /> */}

      {/* === Versão com hover/expand (DSCard + Zeco/Ninha/Napcat/Rui) ===
      <DSCard
        width="100vw"
        marginLeft="calc(-50vw + 50%)"
        expand={{
          amount: 0.1,
          left: {
            content: (
              <BichittosBannerWithNinha
                href={`${prefix}/bichittos`}
                label={t('bichittos.label')}
                title={t('bichittos.title')}
                description={t('bichittos.desc')}
              />
            ),
          },
          right: {
            content: (
              <HomeBanner
                href={`${prefix}/kammara`}
                label={t('kammara.label')}
                title={t('kammara.title')}
                description={t('kammara.desc')}
                variant="kammara"
                height={{ base: '60vh', md: '85vh' }}
                minHeight={{ base: '340px', md: '595px' }}
              />
            ),
          },
        }}
      />
      === Fim versão hover === */}

      <Box
        display="grid"
        gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }}
        gridTemplateRows={{ base: 'auto', md: 'auto 1fr' }}
        width="100vw"
        marginLeft="calc(-50vw + 50%)"
      >
        <Box gridColumn={{ base: '1', md: '1 / -1' }}>
          <HomeBanner
            href={`${prefix}/art`}
            label={t('art.label')}
            title={t('art.title')}
            description={t('art.desc')}
            variant="arte"
            fullWidth
            height={{ base: '35vh', md: '42vh' }}
            minHeight={{ base: '140px', md: '200px' }}
          />
        </Box>
        <HomeBanner
          href={`${prefix}/bichittos`}
          label={t('bichittos.label')}
          title={t('bichittos.title')}
          description={t('bichittos.desc')}
          variant="bichittos"
          height={{ base: '35vh', md: '42vh' }}
          minHeight={{ base: '180px', md: '280px' }}
        />
        <HomeBanner
          href={`${prefix}/kammara`}
          label={t('kammara.label')}
          title={t('kammara.title')}
          description={t('kammara.desc')}
          variant="kammara"
          height={{ base: '35vh', md: '42vh' }}
          minHeight={{ base: '180px', md: '280px' }}
        />
      </Box>

      {books.length > 0 && (
        <Box
          as="section"
          background="white"
          padding={{ base: '3rem 0', md: '4rem 0' }}
        >
          <Box maxW="1200px" mx="auto" px={{ base: 'lg', md: '3xl' }}>
            <Box
              display="flex"
              flexDirection={{ base: 'column', md: 'row' }}
              alignItems={{ base: 'flex-start', md: 'flex-end' }}
              justifyContent="space-between"
              gap="lg"
              mb="lg"
            >
              <Box>
                <Text fontSize="sm" letterSpacing="widest" textTransform="uppercase" color="inkMuted" mb="md">
                  {tBooks('eyebrow')}
                </Text>
                <Heading as="h2" textStyle="heading" fontSize="h1" color="ink">
                  {tBooks('title')}
                </Heading>
              </Box>
              <NextLink href={`${prefix}/books`} style={{ textDecoration: 'none' }}>
                <Box
                  as="span"
                  display="inline-flex"
                  border="1px solid"
                  borderColor="ink"
                  color="ink"
                  px="lg"
                  py="md"
                  fontSize="sm"
                  fontWeight="semibold"
                  letterSpacing="wide"
                  textTransform="uppercase"
                  whiteSpace="nowrap"
                  transitionProperty="opacity"
                  transitionDuration="default"
                  _hover={{ opacity: 0.72 }}
                >
                  {tBooks('viewAllLabel')}
                </Box>
              </NextLink>
            </Box>
            <Text
              fontSize="xl"
              color="inkSoft"
              lineHeight={1.7}
              maxW="720px"
              mb="2xl"
            >
              {tBooks('intro')}
            </Text>
            <BookCatalogCarousel
              books={books}
              locale={loc}
              detailsLabel={tBooks('detailsLabel')}
              fromPriceLabel={tBooks('fromPrice')}
              formatLabels={{
                ebook: tBooks('formats.ebook'), paperback: tBooks('formats.paperback'),
                hardcover: tBooks('formats.hardcover'), print: tBooks('formats.print'),
              }}
              collectionLabels={{
                art: tBooks('collections.art'), bichittos: tBooks('collections.bichittos'),
                kammara: tBooks('collections.kammara'),
              }}
            />
          </Box>
        </Box>
      )}
    </>
  );
}
