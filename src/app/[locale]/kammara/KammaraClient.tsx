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
import { SceneStrip } from '@/components/SceneStrip';
import { SubSystem } from '@/components/SubSystem';
import { SoonPanel } from '@/components/SoonPanel';
import { BookGallery } from '@/components/BookGallery';
import { useModal } from '@/components/Modal';
import { palettes, type PaletteName } from '@/theme/palettes';
import { kammaraHero, kammaraFilter } from '@/theme/creatures';
import { translateName } from '@/lib/translateName';
import { KammaraStarField } from './KammaraStarField';

type WorldId = 'lunnp1' | 'eni4' | 'triplec' | 'orfv' | 'z1' | 'gotto';

interface WorldData {
  id: WorldId;
  chars: { name: string; image: string }[];
  scenes: { name: string; image: string }[];
  bgImage: string | null;
  subsystemImages: (string | null)[];
}

interface KammaraBook {
  id: string;
  cover: string | null;
  pages: string[];
}

interface Props {
  worlds: WorldData[];
  kammaraBooks: KammaraBook[];
  kammaraBg: string | null;
  kammaraChars: { name: string; image: string }[];
}

const WORLD_NAMES: Record<WorldId, string> = {
  lunnp1: "LUNN'P1",
  eni4: 'ENI-4Δ',
  triplec: 'TripleC',
  orfv: 'ORF-V',
  z1: 'Z1',
  gotto: 'Gotto',
};

/**
 * Per-world color indices into the palette.colors[] array. Matches the
 * Astro original where triplec/orfv use their -4 color (colors[3]) as
 * the name instead of -1, because their -1 purple doesn't read well
 * on the dark gradient.
 *
 * Numbers map to palette.colors[N] (0-indexed); -1..-6 in Astro tokens.
 */
const WORLD_COLOR_INDICES: Record<
  WorldId,
  { name: number; text: number; title: number; label: number }
> = {
  lunnp1: { name: 0, text: 2, title: 1, label: 5 },
  eni4: { name: 0, text: 2, title: 1, label: 5 },
  triplec: { name: 3, text: 2, title: 1, label: 5 },
  orfv: { name: 3, text: 2, title: 1, label: 5 },
  z1: { name: 0, text: 2, title: 1, label: 5 },
  gotto: { name: 0, text: 2, title: 1, label: 5 },
};

/**
 * Per-world bgOpacity override. orfv has a custom 0.4, others use the
 * default (0.6 if bgImage present, 1 otherwise).
 */
const WORLD_BG_OPACITY: Partial<Record<WorldId, number>> = {
  orfv: 0.4,
};

export function KammaraClient({ worlds, kammaraBooks, kammaraBg, kammaraChars }: Props) {
  const t = useTranslations('kammara');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const [activeFilter, setActiveFilter] = useState('all');
  const { registerGallery, openGallery } = useModal();

  // Word dictionary for translating filename-derived character/scene names
  const words = tCommon.raw('words') as Record<string, string>;

  const bookGalleries = useMemo(() => {
    const out: Record<string, { title: string; pages: string[] }> = {};
    const defs = (() => {
      try {
        return t.raw('section.books') as { tag: string; title: string }[] | undefined;
      } catch {
        return undefined;
      }
    })();
    for (const book of kammaraBooks) {
      if (book.pages.length === 0) continue;
      const def = defs?.find((d) => d.tag === book.id);
      out[`book_kammara-${book.id}`] = {
        title: def?.title ?? book.id,
        pages: book.pages,
      };
    }
    return out;
  }, [kammaraBooks, t]);

  useEffect(() => {
    for (const [id, g] of Object.entries(bookGalleries)) {
      registerGallery(id, g.pages);
    }
  }, [bookGalleries, registerGallery]);

  const sectionName = (() => {
    try {
      return t('section.name');
    } catch {
      return 'Kammara';
    }
  })();

  const sectionText = (() => {
    try {
      return t.raw('section.text') as string[];
    } catch {
      return [];
    }
  })();

  const sectionStory = (() => {
    try {
      return t.raw('section.panel.story') as string[];
    } catch {
      return [];
    }
  })();

  const filters = [
    { id: 'kammara', label: sectionName, color: kammaraFilter.color, bgColor: kammaraFilter.bgColor },
    ...worlds.map((w) => ({
      id: w.id,
      label: WORLD_NAMES[w.id],
      color: palettes[w.id as PaletteName].colors[0],
      bgColor: palettes[w.id as PaletteName].dark,
    })),
  ];

  const kammaraPalette = palettes.kammara;
  const kammaraHidden = activeFilter !== 'all' && activeFilter !== 'kammara';

  const handleBookClick = (rawBookId: string) => {
    const galleryId = `book_kammara-${rawBookId.replace(/^kammara-/, '')}`;
    const g = bookGalleries[galleryId];
    if (!g) return;
    openGallery(galleryId, 0, g.title, '');
  };

  return (
    <>
      <HeroSection
        label={t('heroLabel')}
        title={t('heroTitle')}
        description={t('heroDesc')}
        background={kammaraHero.background}
        textColor={kammaraHero.textColor}
        labelColor={kammaraHero.labelColor}
      >
        {/* Star field decoration — two layers of small white dots via box-shadow */}
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
              width: '1px',
              height: '1px',
              background: 'transparent',
              animation: 'twinkleField 6s ease-in-out infinite',
            },
            '& > span:nth-of-type(1)': {
              boxShadow:
                '25px 15px #fff, 80px 40px #fff, 150px 20px rgba(255,255,255,0.8), 200px 60px #fff, 320px 30px rgba(255,255,255,0.6), 400px 80px #fff, 50px 90px rgba(255,255,255,0.5), 180px 110px #fff, 280px 95px rgba(255,255,255,0.7), 350px 120px #fff, 450px 50px rgba(255,255,255,0.4), 500px 100px #fff, 30px 140px rgba(255,255,255,0.6), 120px 160px #fff, 250px 150px rgba(255,255,255,0.5), 380px 170px #fff, 480px 140px rgba(255,255,255,0.8), 550px 160px #fff, 70px 200px #fff, 160px 220px rgba(255,255,255,0.6), 300px 210px #fff, 420px 230px rgba(255,255,255,0.7), 520px 200px #fff, 600px 220px rgba(255,255,255,0.5), 90px 250px rgba(255,255,255,0.4), 210px 270px #fff, 340px 260px rgba(255,255,255,0.8), 460px 280px #fff, 580px 250px rgba(255,255,255,0.6), 650px 270px #fff, 40px 300px #fff, 130px 320px rgba(255,255,255,0.5), 270px 310px #fff, 390px 330px rgba(255,255,255,0.7), 510px 300px #fff, 630px 320px rgba(255,255,255,0.4), 700px 50px rgba(255,255,255,0.6), 750px 120px #fff, 800px 200px rgba(255,255,255,0.5), 850px 80px #fff, 900px 160px rgba(255,255,255,0.7), 950px 240px #fff, 720px 300px rgba(255,255,255,0.4), 780px 30px #fff, 830px 280px rgba(255,255,255,0.6)',
            },
            '& > span:nth-of-type(2)': {
              animationDelay: '-3s',
              boxShadow:
                '60px 35px rgba(255,255,255,0.5), 140px 70px #fff, 230px 45px rgba(255,255,255,0.7), 310px 85px #fff, 410px 55px rgba(255,255,255,0.4), 490px 75px #fff, 100px 130px rgba(255,255,255,0.6), 190px 145px #fff, 290px 125px rgba(255,255,255,0.8), 370px 155px #fff, 460px 135px rgba(255,255,255,0.5), 540px 150px #fff, 75px 190px #fff, 170px 205px rgba(255,255,255,0.7), 260px 195px #fff, 360px 215px rgba(255,255,255,0.4), 440px 190px #fff, 530px 210px rgba(255,255,255,0.6), 110px 260px rgba(255,255,255,0.5), 200px 275px #fff, 330px 265px rgba(255,255,255,0.8), 430px 285px #fff, 520px 260px rgba(255,255,255,0.6), 610px 280px #fff, 680px 100px rgba(255,255,255,0.5), 740px 180px #fff, 810px 130px rgba(255,255,255,0.7), 870px 220px #fff, 930px 100px rgba(255,255,255,0.4), 760px 260px #fff',
            },
            // Glow orb
            '& > span:nth-of-type(3)': {
              width: '350px',
              height: '350px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(100,80,200,0.15) 0%, transparent 70%)',
              top: '25%',
              left: '50%',
              transform: 'translateX(-50%)',
              animation: 'glowPulse 8s ease-in-out infinite',
              filter: 'blur(20px)',
              boxShadow: 'none',
            },
            '@keyframes twinkleField': {
              '0%, 100%': { opacity: 0.4 },
              '50%': { opacity: 1 },
            },
            '@keyframes glowPulse': {
              '0%, 100%': { transform: 'translateX(-50%) scale(1)', opacity: 0.5 },
              '50%': { transform: 'translateX(-50%) scale(1.3)', opacity: 0.8 },
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

      {/* KAMMARA META SECTION */}
      <CreatureSection
        id="kammara"
        gradient={kammaraPalette.gradient}
        accentColor={kammaraPalette.colors[4]}
        bgImage={kammaraBg ?? undefined}
        hidden={kammaraHidden}
      >
        <KammaraStarField />
        <CreatureCard
          name={sectionName}
          color1={kammaraPalette.colors[0]}
          color2={kammaraPalette.colors[1]}
          banner={
            <DSMainCard
              characters={[]}
              gradient={kammaraPalette.gradientBg}
              height="1400px"
              maxHeight="80vh"
              titleColor={kammaraPalette.colors[0]}
              textColor={kammaraPalette.colors[1]}
              stripSide
              bgOpacity={0.3}
              text={
                <>
                  <h2>{sectionName}</h2>
                  {sectionStory.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </>
              }
            >
              {kammaraChars.length > 0 ? (
                <CharacterStrip
                  characters={kammaraChars.map((c) => ({
                    ...c,
                    name: translateName(c.name, words),
                  }))}
                  gradient={kammaraPalette.gradient}
                  cardSize={300}
                  noFloat
                  transparent
                  speed={120}
                  inStripSide
                  contextId="kammara/kammara"
                  locale={locale as 'pt' | 'en'}
                />
              ) : (
                <SoonPanel label={tCommon('soon')} />
              )}
            </DSMainCard>
          }
        >
          {sectionText.map((p, i) => (
            <Text key={i} mb="0.8rem">
              {p}
            </Text>
          ))}
        </CreatureCard>
        {kammaraBooks.length > 0 && (
          <BookGallery
            title={t('booksTitle')}
            books={kammaraBooks.map((b) => {
              const defs = (() => {
                try {
                  return t.raw('section.books') as { tag: string; title: string }[] | undefined;
                } catch {
                  return undefined;
                }
              })();
              const def = defs?.find((d) => d.tag === b.id);
              return {
                id: `kammara-${b.id}`,
                image: b.cover ?? undefined,
                alt: def?.title ?? b.id,
                label: def?.title ?? b.id,
                soon: b.pages.length === 0,
              };
            })}
            soonLabel={tCommon('soon')}
            onBookClick={handleBookClick}
            tone="overlay"
          />
        )}
      </CreatureSection>

      {/* WORLDS */}
      {worlds.map((w) => {
        const palette = palettes[w.id as PaletteName];
        const worldName = (() => {
          try {
            return t(`worlds.${w.id}.name` as never);
          } catch {
            return WORLD_NAMES[w.id];
          }
        })();
        const worldText = (() => {
          try {
            return t.raw(`worlds.${w.id}.text`) as string[];
          } catch {
            return [];
          }
        })();
        const panelStory = (() => {
          try {
            return t.raw(`worlds.${w.id}.panel.story`) as string[];
          } catch {
            return [];
          }
        })();
        const subsystems = (() => {
          try {
            return (t.raw(`worlds.${w.id}.subsystems`) as { title: string; text: string[] }[]) || [];
          } catch {
            return [];
          }
        })();

        const hidden = activeFilter !== 'all' && activeFilter !== w.id;
        const placeholder = (() => {
          try {
            return t('placeholder');
          } catch {
            return '';
          }
        })();
        const scenesTitle = (() => {
          try {
            return t('scenesTitle');
          } catch {
            return '';
          }
        })();
        const subsystemsTitle = (() => {
          try {
            return t('subsystemsTitle');
          } catch {
            return '';
          }
        })();

        return (
          <CreatureSection
            key={w.id}
            id={w.id}
            gradient={palette.gradientBg}
            accentColor={palette.colors[0]}
            bgImage={w.bgImage ?? undefined}
            hidden={hidden}
          >
            <CreatureCard
              name={worldName}
              color1={palette.colors[WORLD_COLOR_INDICES[w.id].name]}
              color2={palette.colors[WORLD_COLOR_INDICES[w.id].text]}
              banner={
                <DSMainCard
                  characters={[]}
                  gradient={palette.gradient}
                  height="1400px"
                  maxHeight="80vh"
                  titleColor={palette.colors[WORLD_COLOR_INDICES[w.id].title]}
                  textColor={palette.text}
                  stripSide
                  bgOpacity={WORLD_BG_OPACITY[w.id] ?? (w.bgImage ? 0.6 : 1)}
                  text={
                    <>
                      <h2>{worldName}</h2>
                      {panelStory.map((p, i) =>
                        p.startsWith('### ') ? (
                          <h3 key={i}>{p.slice(4)}</h3>
                        ) : p.startsWith('## ') ? (
                          <h2 key={i}>{p.slice(3)}</h2>
                        ) : (
                          <p key={i}>{p}</p>
                        )
                      )}
                    </>
                  }
                >
                  {w.chars.length > 0 ? (
                    <CharacterStrip
                      characters={w.chars.map((c) => ({
                        ...c,
                        name: translateName(c.name, words),
                      }))}
                      gradient={palette.gradient}
                      cardSize={300}
                      noFloat
                      transparent
                      labelColor={palette.colors[WORLD_COLOR_INDICES[w.id].label]}
                      speed={100}
                      inStripSide
                      contextId={`kammara/${w.id}`}
                      locale={locale as 'pt' | 'en'}
                    />
                  ) : (
                    <SoonPanel label={tCommon('soon')} color={palette.colors[0]} />
                  )}
                </DSMainCard>
              }
            >
              {worldText.length > 0
                ? worldText.map((p, i) => (
                    <Text key={i} mb="0.8rem">
                      {p}
                    </Text>
                  ))
                : placeholder && <Text>{placeholder}</Text>}
            </CreatureCard>
            {w.scenes.length > 0 && (
              <SceneStrip
                scenes={w.scenes.map((s) => ({
                  ...s,
                  name: translateName(s.name, words),
                }))}
                sectionTitle={scenesTitle}
                arrowColor={palette.colors[1]}
                labelColor={palette.colors[3]}
                modalBg={palette.gradientBg}
                modalTitle={worldName}
                modalSubtitle={worldText[0] || ''}
              />
            )}
            {subsystems.filter((s) => s.text.length > 0 && !s.text[0].startsWith('Placeholder')).length > 0 && (
              <SubSystem
                sectionTitle={subsystemsTitle}
                cards={subsystems
                  .map((s, i) => ({
                    title: s.title,
                    image: w.subsystemImages[i] ?? undefined,
                    imageAlt: s.title,
                    texts: s.text,
                  }))
                  .filter((c) => c.texts.length > 0 && !c.texts[0].startsWith('Placeholder'))}
                titleColor={palette.colors[1]}
                subtitleColor={palette.colors[3]}
                textColor={palette.text}
                gradient={palette.gradient}
              />
            )}
          </CreatureSection>
        );
      })}
    </>
  );
}
