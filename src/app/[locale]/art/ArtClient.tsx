'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Box, Heading, Text } from '@chakra-ui/react';
import { HeroSection } from '@/components/HeroSection';
import { FilterBar } from '@/components/FilterBar';
import { ArtSection } from '@/components/ArtSection';
import { BookShelf } from '@/components/BookShelf';
import { useModal } from '@/components/Modal';
import { artSectionMeta, artHero, type ArtSectionId } from '@/theme/artSections';
import { resolveInitialArt } from './resolveInitialArt';

interface ArtSectionData {
  id: string;
  thumbs: string[];
  full: string[];
}

interface ArtBook {
  id: string;
  title: string;
  cover: string | null;
  buy: { url: string; label: string } | null;
  pages: string[];
}

interface Props {
  sections: ArtSectionData[];
  books: ArtBook[];
}

export function ArtClient({ sections, books }: Props) {
  const t = useTranslations('art');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sectionIds = sections.map((s) => s.id);
  const filterIds = books.length > 0 ? [...sectionIds, 'livros'] : sectionIds;
  const [activeFilter, setActiveFilter] = useState(() =>
    resolveInitialArt(searchParams.get('art'), filterIds),
  );

  // Troca a seção ativa E sincroniza a URL (?art=<id>), sem recarregar nem
  // empilhar histórico. É o único ponto de entrada do menu de filtros.
  const handleSelectFilter = (id: string) => {
    setActiveFilter(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set('art', id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const { registerGallery, openGallery } = useModal();

  useEffect(() => {
    for (const s of sections) {
      if (s.full.length > 0) {
        registerGallery(s.id, s.full);
      }
    }
  }, [sections, registerGallery]);

  useEffect(() => {
    for (const b of books) {
      if (b.pages.length > 0) {
        registerGallery(`book_art-${b.id}`, b.pages);
      }
    }
  }, [books, registerGallery]);

  const handleBookRead = (bookId: string) => {
    const b = books.find((x) => x.id === bookId);
    if (!b) return;
    openGallery(`book_art-${b.id}`, 0, b.title, undefined, undefined, b.title, undefined, b.buy);
  };

  // Ao trocar de seção, a anterior desmonta e a nova monta — rola pra logo
  // abaixo do FilterBar sticky, esperando o layout assentar.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const target = document.querySelector(
        `[data-section-art="${activeFilter}"]`,
      );
      if (!target) return;
      const bar = document.querySelector('nav[aria-label="filters"]');
      const offset = bar ? bar.getBoundingClientRect().bottom + 10 : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 80);
    return () => window.clearTimeout(id);
  }, [activeFilter]);

  const sectionsWithMeta = sections.map((s) => {
    const meta = artSectionMeta[s.id as ArtSectionId];
    let title = s.id;
    let technique = '';
    try {
      title = t(`sections.${s.id}.title` as never);
    } catch {
      // ignore
    }
    try {
      technique = t(`sections.${s.id}.technique` as never);
    } catch {
      // ignore
    }
    return { ...s, ...meta, title, technique };
  });

  const booksMeta = artSectionMeta.livros;
  let booksTitle = t('booksTitle');
  let booksTechnique = '';
  try {
    booksTitle = t('sections.livros.title' as never);
  } catch {
    // ignore
  }
  try {
    booksTechnique = t('sections.livros.technique' as never);
  } catch {
    // ignore
  }

  const filters = [
    ...sectionsWithMeta.map((s) => ({ id: s.id, label: s.title })),
    ...(books.length > 0 ? [{ id: 'livros', label: t('booksTitle') }] : []),
  ];

  const handleThumbClick = (sectionId: string, idx: number) => {
    const s = sectionsWithMeta.find((x) => x.id === sectionId);
    if (!s || s.full.length === 0) return;
    openGallery(sectionId, idx, s.title, s.technique, s.theme);
  };

  return (
    <>
      <HeroSection
        label={t('heroLabel')}
        title={t('heroTitle')}
        labelBottom={t('heroLabelBottom')}
        background={artHero.background}
        textColor={artHero.textColor}
        labelColor={artHero.labelColor}
        minHeight="35vh"
      />

      <FilterBar
        filters={filters}
        showAll={false}
        defaultActive={sectionIds[0]}
        active={activeFilter}
        onFilter={handleSelectFilter}
      />

      {sectionsWithMeta.map((s) =>
        s.id !== activeFilter ? null : (
          <ArtSection
            key={s.id}
            id={s.id}
            title={s.title}
            technique={s.technique}
            bg={s.bg}
            titleColor={s.titleColor}
            techColor={s.techColor}
            large={s.large}
            thumbs={s.thumbs}
            onThumbClick={(idx) => handleThumbClick(s.id, idx)}
          />
        ),
      )}

      {books.length > 0 && (() => {
        const hidden = activeFilter !== 'livros';
        return (
          <Box
            as="section"
            data-section-art="livros"
            data-hidden={hidden ? 'true' : undefined}
            background={booksMeta.bg}
            padding={hidden ? '0' : '4rem 0'}
            opacity={hidden ? 0 : 1}
            maxHeight={hidden ? '0' : 'none'}
            overflow={hidden ? 'hidden' : undefined}
            transition="opacity 0.5s ease, max-height 0.5s ease"
          >
            <Box maxW="1200px" mx="auto" px={{ base: '1rem', md: '2rem' }}>
              <Heading
                as="h2"
                textStyle="heading"
                fontSize="2xl"
                letterSpacing="tight"
                margin="0 0 0.3rem"
                color={booksMeta.titleColor}
              >
                {booksTitle}
              </Heading>
              <Text
                fontFamily="body"
                fontSize="sm"
                letterSpacing="wide"
                textTransform="uppercase"
                margin="0 0 2rem"
                color={booksMeta.techColor}
              >
                {booksTechnique}
              </Text>
              <BookShelf
                title={booksTitle}
                arrowColor={booksMeta.titleColor}
                comingSoonLabel={tCommon('soon')}
                books={books.map((b) => ({
                  book: {
                    id: b.id,
                    image: b.cover,
                    alt: b.title,
                    label: b.title,
                    soon: !b.buy,
                    buy: b.buy,
                  },
                  borderColor: booksMeta.titleColor,
                  textColor: booksMeta.titleColor,
                  onRead: handleBookRead,
                }))}
              />
            </Box>
          </Box>
        );
      })()}
    </>
  );
}
