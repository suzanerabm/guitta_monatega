import type { Metadata } from 'next';
import { Box, Heading, Text, VisuallyHidden } from '@chakra-ui/react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HomeBanner } from '@/components/HomeBanner';
import { BookShelf } from '@/components/BookShelf';
import {
  getArtBooks,
  getBichittoBooks,
  getKammaraBooks,
} from '@/lib/visibility';
import { homeBooksGallery } from '@/theme/artSections';
import { buildPageMetadata, SITE_URL } from '@/lib/seo';
import { getBookSlug } from '@/lib/books';
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
  const tCommon = await getTranslations('common');
  const tBooks = await getTranslations('booksPage');
  const loc = locale === 'en' ? 'en' : 'pt';

  const prefix = `/${locale}`;
  const bichittoIds = ['napcat', 'zeco', 'taylo', 'cheiodebolinha', 'miscelania'];
  const books = [
    ...getArtBooks('art', loc).map((book) => ({ ...book, source: 'art' })),
    ...getKammaraBooks('kammara', loc).map((book) => ({ ...book, source: 'kammara' })),
    ...bichittoIds.flatMap((id) =>
      getBichittoBooks(id, loc).map((book) => ({ ...book, source: id })),
    ),
  ].filter((book) => book.buy !== null);
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
        url: book.buy?.url,
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
          background={homeBooksGallery.background}
          backgroundPosition={homeBooksGallery.backgroundPosition}
          backgroundSize={homeBooksGallery.backgroundSize}
          padding={{ base: '3rem 0', md: '4rem 0' }}
        >
          <Box maxW="1600px" mx="auto" px={{ base: '1rem', md: '2rem' }}>
            <Heading
              as="h2"
              textStyle="heading"
              fontSize="2xl"
              letterSpacing="tight"
              margin="0 0 0.3rem"
              color={homeBooksGallery.titleColor}
            >
              {t('books.title')}
            </Heading>
            <Text
              fontFamily="body"
              fontSize="sm"
              letterSpacing="wide"
              textTransform="uppercase"
              margin="0 0 2rem"
              color={homeBooksGallery.techColor}
            >
              {t('books.description')}
            </Text>
            <BookShelf
              arrowColor={homeBooksGallery.titleColor}
              viewAllHref={`${prefix}/books`}
              viewAllLabel={tBooks('viewAllLabel')}
              viewAllColor={homeBooksGallery.titleColor}
              comingSoonLabel={tCommon('soon')}
              cardWidth={{ base: '68vw', sm: '250px', xl: '280px' }}
              cardMaxWidth="300px"
              cardHeight={{ base: '480px', md: '520px' }}
              showLabels={false}
              panelBackground={homeBooksGallery.panelBackground}
              books={books.map((book) => ({
                book: {
                  id: `${book.source}-${book.id}`,
                  image: book.cover,
                  alt: book.title,
                  label: book.title,
                  soon: false,
                  buy: book.buy,
                  details: getBookSlug(book.id)
                    ? {
                        url: `${prefix}/books/${getBookSlug(book.id)}`,
                        label: tBooks('detailsLabel'),
                      }
                    : null,
                  extraLink: book.homeButton
                    ? {
                        ...book.homeButton,
                        url: book.homeButton.url.startsWith('/')
                          ? `${prefix}${book.homeButton.url}`
                          : book.homeButton.url,
                      }
                    : null,
                },
                borderColor: homeBooksGallery.titleColor,
                textColor: homeBooksGallery.titleColor,
              }))}
            />
          </Box>
        </Box>
      )}
    </>
  );
}
