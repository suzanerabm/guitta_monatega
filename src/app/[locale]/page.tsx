import type { Metadata } from 'next';
import { Box, Heading, Text, VisuallyHidden } from '@chakra-ui/react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HomeBanner } from '@/components/HomeBanner';
import { BookShelf } from '@/components/BookShelf';
import { buildPageMetadata, SITE_URL } from '@/lib/seo';
import { getCatalogBooks, isBookComingSoon } from '@/lib/books';
import { getMosaic, getWorlds } from '@/lib/content/kammara';
import { bookPageLayout } from '@/theme/bookPages';
import { homeBooksGallery } from '@/theme/artSections';
import { palettes, type PaletteName } from '@/theme/palettes';
import { worldCrestGlyph } from '@/theme/kalunGlyphs';
// import { DSCard } from '@/components/DSCard';
import { BichittosBannerWithNinha } from './BichittosBannerWithNinha';
import { KammaraBannerWithPlanets } from './KammaraBannerWithPlanets';

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
    book.editions.some((edition) => edition.price),
  );
  const kammaraDrops = getMosaic(loc).map((drop) => ({
    ...drop,
    crestGlyph: worldCrestGlyph(drop.worldId),
  }));
  const kammaraPlanets = getWorlds(loc).slice(0, 4).map((world) => {
    const palette = palettes[world.id as PaletteName];
    return {
      id: world.id,
      name: world.name,
      summary: world.summary[0] ?? '',
      color: palette.colors[0],
      darkColor: palette.dark,
      image: world.bgImage ?? undefined,
      crestGlyph: worldCrestGlyph(world.id),
      badges: world.tags,
    };
  });
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
        url: `${SITE_URL}/${loc}/books/${book.slug}`,
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
        paddingTop={{ base: 'homeHeaderOffsetMobile', md: 'homeHeaderOffsetDesktop' }}
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
            height={{ base: '28vh', md: '30vh' }}
            minHeight={{ base: '180px', md: '220px' }}
          />
        </Box>
        <BichittosBannerWithNinha
          href={`${prefix}/bichittos`}
          label={t('bichittos.label')}
          title={t('bichittos.title')}
          description={t('bichittos.desc')}
        />
        <KammaraBannerWithPlanets
          href={`${prefix}/kammara`}
          label={t('kammara.label')}
          title={t('kammara.title')}
          description={t('kammara.desc')}
          planetLabel={t('kammara.planetLabel')}
          planets={kammaraPlanets}
          drops={kammaraDrops}
        />
      </Box>

      {books.length > 0 && (
        <Box
          as="section"
          background={homeBooksGallery.background}
          padding={{ base: '3rem 0', md: '4rem 0' }}
        >
          <Box maxW="1200px" mx="auto" px={{ base: 'base', md: '3xl' }} position="relative">
            <Heading
              as="h2"
              textStyle="heading"
              fontSize="2xl"
              letterSpacing="tight"
              m="0"
              mb="tight"
              color={homeBooksGallery.accentColor}
            >
              {tBooks('title')}
            </Heading>
            <Text
              fontFamily="body"
              fontSize="sm"
              letterSpacing="wide"
              textTransform="uppercase"
              m="0 0 2rem"
              color={homeBooksGallery.accentSoftColor}
            >
              {tBooks('intro')}
            </Text>
            <BookShelf
              arrowColor={homeBooksGallery.accentColor}
              disabledArrowColor={homeBooksGallery.accentColor}
              arrowVariant="plain"
              overlayArrows
              overlayArrowOffset={bookPageLayout.homeShelfArrowOffset}
              cardPadding={bookPageLayout.homeShelfTrackPadding}
              viewAllHref={`${prefix}/books`}
              viewAllLabel={tBooks('viewAllBooksLabel')}
              viewAllColor={homeBooksGallery.accentColor}
              viewAllPlacement="section-title"
              comingSoonLabel={tBooks('soonLabel')}
              cardWidth={bookPageLayout.homeCarouselCardWidth}
              cardMaxWidth={bookPageLayout.homeCarouselCardWidth}
              cardHeight={bookPageLayout.homeShelfCardHeight}
              panelBackground={homeBooksGallery.panelBackground}
              books={books.map((book) => ({
                book: {
                  id: book.slug,
                  image: book.cover,
                  alt: book.title,
                  label: book.title,
                  soon: isBookComingSoon(book),
                  details: {
                    url: `${prefix}/books/${book.slug}`,
                    label: tBooks('detailsLabel'),
                  },
                },
                borderColor: homeBooksGallery.panelBorderColor,
                textColor: homeBooksGallery.titleColor,
              }))}
            />
          </Box>
        </Box>
      )}
    </>
  );
}
