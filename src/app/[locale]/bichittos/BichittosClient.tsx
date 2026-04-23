'use client';
import { useEffect, useMemo, useState } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useTranslations, useLocale } from 'next-intl';
import { HeroSection } from '@/components/HeroSection';
import { FilterBar } from '@/components/FilterBar';
import { CreatureSection } from '@/components/CreatureSection';
import { CreatureCard } from '@/components/CreatureCard';
import { DSMainCard } from '@/components/DSMainCard';
import { CharacterStrip } from '@/components/CharacterStrip';
import { BookGallery } from '@/components/BookGallery';
import { useModal } from '@/components/Modal';
import { palettes, type CreatureId } from '@/theme/palettes';
import { characterPositions, zecoMascot } from '@/data/bichittos';
import {
  getCreatureName,
  getCreatureText,
  getCreaturePanelStory,
} from '@/data/characters/bichittos/_creatureData';
import { translateName } from '@/lib/translateName';
import type { Locale } from '@/lib/characters';

export interface BichittosCreatureData {
  id: CreatureId;
  chars: { name: string; image: string }[];
  books: { id: string; cover: string | null; pages: string[] }[];
}

interface Props {
  data: BichittosCreatureData[];
}

export function BichittosClient({ data }: Props) {
  const t = useTranslations('bichittos');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const [activeFilter, setActiveFilter] = useState('all');
  const { registerGallery, openGallery } = useModal();

  const bookIllustrated = t('bookIllustrated');

  // Word dictionary for translating filename-derived character names.
  // Each character image is named like "napcat-dormindo.png" — the manifest
  // stores the cleaned form ("napcat dormindo") and we translate each word
  // here so the label switches with the locale.
  const words = tCommon.raw('words') as Record<string, string>;

  // Build a flat list of book galleries: galleryId -> pages
  const galleries = useMemo(() => {
    const out: Record<string, { title: string; pages: string[] }> = {};
    for (const creature of data) {
      // Read translated book defs to map tag -> title
      const bookDefs = ((): { tag: string; title: string }[] | undefined => {
        try {
          if (!t.has(`${creature.id}.books` as never)) return undefined;
          return t.raw(`${creature.id}.books`) as { tag: string; title: string }[];
        } catch {
          return undefined;
        }
      })();
      for (const book of creature.books) {
        if (!book.pages || book.pages.length === 0) continue;
        const def = bookDefs?.find((d) => book.id.endsWith(d.tag));
        const title = def?.title ?? book.id;
        out[`book_${creature.id}-${book.id}`] = { title, pages: book.pages };
      }
    }
    return out;
  }, [data, t]);

  useEffect(() => {
    for (const [id, g] of Object.entries(galleries)) {
      registerGallery(id, g.pages);
    }
  }, [galleries, registerGallery]);

  const handleBookClick = (creatureId: string, bookId: string) => {
    const galleryId = `book_${creatureId}-${bookId}`;
    const g = galleries[galleryId];
    if (!g) return;
    openGallery(galleryId, 0, g.title, bookIllustrated);
  };

  const filters = [
    { id: 'napcat', label: getCreatureName('napcat', locale as Locale), color: palettes.napcat.colors[3], bgColor: palettes.napcat.dark },
    { id: 'zeco', label: getCreatureName('zeco', locale as Locale), color: palettes.zeco.colors[3], bgColor: palettes.zeco.colors[5] },
    { id: 'taylo', label: getCreatureName('taylo', locale as Locale), color: palettes.taylo.colors[0], bgColor: palettes.taylo.dark },
    { id: 'cheiodebolinha', label: getCreatureName('cheiodebolinha', locale as Locale), color: palettes.cheiodebolinha.colors[2], bgColor: palettes.cheiodebolinha.dark },
    { id: 'miscelania', label: getCreatureName('miscelania', locale as Locale), color: palettes.miscelania.colors[2], bgColor: palettes.miscelania.dark },
  ];

  // Per-creature decoration for the Bichittos section: parallax background
  // image behind the card and the accent colors used by the new DSTextPanel
  // creature variant. bgImage paths are placeholders — drop any image into
  // `public/imgs/bichittos/bg/<id>.jpg` (or .png) to turn the parallax on.
  const creatureDecor: Record<CreatureId, { bgImage?: string; accent: string; accentAlt: string; tag: string }> = {
    napcat: {
      bgImage: '/imgs/bichittos/bg/napcat.png',
      accent: palettes.napcat.colors[0],
      accentAlt: palettes.napcat.colors[3],
      tag: 'Gato · Sonhador',
    },
    zeco: {
      bgImage: '/imgs/bichittos/bg/zeco.png',
      accent: palettes.zeco.colors[5],
      accentAlt: palettes.zeco.colors[2],
      tag: 'Cachorro · Memória',
    },
    taylo: {
      bgImage: '/imgs/bichittos/bg/taylo.jpg',
      accent: palettes.taylo.colors[0],
      accentAlt: palettes.taylo.colors[4],
      tag: 'Amigos · Natureza',
    },
    cheiodebolinha: {
      bgImage: '/imgs/bichittos/bg/cheiodebolinha.png',
      accent: palettes.cheiodebolinha.colors[2],
      accentAlt: palettes.cheiodebolinha.colors[3],
      tag: 'Bobbin',
    },
    miscelania: {
      bgImage: '/imgs/bichittos/bg/miscelania.png',
      accent: palettes.miscelania.colors[2],
      accentAlt: palettes.miscelania.colors[3],
      tag: 'Histórias soltas',
    },
  };

  return (
    <>
      <HeroSection
        label={t('heroLabel')}
        title={t('heroTitle')}
        description={t('heroDesc')}
        background={palettes.bichittos.gradient}
      >
        <Box
          aria-hidden
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          pointerEvents="none"
          css={{
            '& > span': {
              position: 'absolute',
              borderRadius: '50%',
              opacity: 0.12,
              background: '#fff',
              animation: 'shapeFloat 6s ease-in-out infinite',
            },
            '& > span:nth-of-type(1)': {
              width: '150px',
              height: '150px',
              top: '10%',
              left: '5%',
            },
            '& > span:nth-of-type(2)': {
              width: '80px',
              height: '80px',
              top: '60%',
              right: '10%',
              animationDelay: '2s',
              borderRadius: '30%',
            },
            '& > span:nth-of-type(3)': {
              width: '100px',
              height: '100px',
              bottom: '15%',
              left: '20%',
              animationDelay: '1s',
            },
          }}
        >
          <span />
          <span />
          <span />
        </Box>
      </HeroSection>

      <FilterBar
        filters={filters}
        allLabel={locale === 'en' ? 'All' : 'Todos'}
        onFilter={setActiveFilter}
      />

      {data.map((creature) => {
        const palette = palettes[creature.id];
        const colors = palettes[creature.id].bichittos!;
        const text = getCreatureText(creature.id, locale as Locale);
        const panelStory = getCreaturePanelStory(creature.id, locale as Locale);
        const name = getCreatureName(creature.id, locale as Locale);
        const bookDefs = ((): { tag: string; title: string }[] | undefined => {
          try {
            if (!t.has(`${creature.id}.books` as never)) return undefined;
            return t.raw(`${creature.id}.books`) as { tag: string; title: string }[];
          } catch {
            return undefined;
          }
        })();
        const books = creature.books.map((b) => {
          const def = bookDefs?.find((d) => b.id.endsWith(d.tag));
          return {
            id: `${creature.id}-${b.id}`,
            image: b.cover ?? undefined,
            alt: def?.title ?? b.id,
            label: def?.title ?? b.id,
            soon: !b.pages || b.pages.length === 0,
          };
        });

        const hidden = activeFilter !== 'all' && activeFilter !== creature.id;
        const decor = creatureDecor[creature.id];
        const panelTitle = `${name}${creature.id === 'napcat' ? ' & Violeta' : (creature.id === 'zeco' || creature.id === 'taylo') ? ' & Amigos' : ''}`;

        return (
          <CreatureSection
            key={creature.id}
            id={creature.id}
            gradient={palette.gradientBg}
            accentColor={palette.colors[0]}
            bgImage={decor.bgImage}
            bgOpacity={0.22}
            hidden={hidden}
          >
            <CreatureCard
              name={name}
              color1={colors.name}
              color2={colors.text}
              banner={
                <DSMainCard
                  characters={characterPositions[creature.id] ?? []}
                  gradient={palette.gradient}
                  height="1400px"
                  maxHeight="80vh"
                  titleColor={colors.titleColor}
                  textColor={colors.textColor}
                  mascot={creature.id === 'zeco' ? zecoMascot : undefined}
                  textPanelTitle={panelTitle}
                  creatureAccent={decor.accent}
                  creatureAccentAlt={decor.accentAlt}
                  panelBadge={decor.tag}
                  text={
                    <>
                      {panelStory.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </>
                  }
                >
                  {creature.chars.length > 0 && (
                    <CharacterStrip
                      characters={creature.chars.map((c) => ({
                        ...c,
                        name: translateName(c.name, words),
                      }))}
                      gradient={palette.gradient}
                    />
                  )}
                </DSMainCard>
              }
            >
              {text.map((p, i) => (
                <Text key={i} mb="0.8rem">
                  {p}
                </Text>
              ))}
            </CreatureCard>
            {books.length > 0 && (
              <BookGallery
                title={t('booksTitle')}
                books={books}
                soonLabel={tCommon('soon')}
                tone="overlay"
                onBookClick={(bookId) => {
                  // bookId is `${creature.id}-${b.id}`; strip the creature prefix
                  const rawBookId = bookId.slice(creature.id.length + 1);
                  handleBookClick(creature.id, rawBookId);
                }}
              />
            )}
          </CreatureSection>
        );
      })}
    </>
  );
}
