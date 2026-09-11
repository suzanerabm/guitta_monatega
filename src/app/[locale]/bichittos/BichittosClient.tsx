'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Box, Grid, Text, chakra } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { HeroSection } from '@/components/HeroSection';
import { FilterBar } from '@/components/FilterBar';
import { CreatureSection } from '@/components/CreatureSection';
import { CreatureCard } from '@/components/bichittos/CreatureCard';
import { DSMainCard } from '@/components/DSMainCard';
import { CharacterStrip } from '@/components/bichittos/CharacterStrip';
import { BichittoVideoCarousel } from '@/components/bichittos/BichittoVideoCarousel';
import { BookGallery } from '@/components/BookGallery';
import { useModal } from '@/components/Modal';
import { palettes } from '@/theme/palettes';
import { resolveInitialBichitto } from './resolveInitialBichitto';
import type { BichittoPayload } from '@/lib/content/types';

/**
 * Tudo aqui chega pronto do servidor (`src/lib/content/bichittos.ts`). Este
 * componente NÃO importa módulo de dados: era assim que a lore de criaturas
 * não publicadas entrava no bundle do cliente.
 */
export type BichittosCreatureData = BichittoPayload;

interface Props {
  data: BichittosCreatureData[];
}

export function BichittosClient({ data }: Props) {
  const t = useTranslations('bichittos');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Ids publicados, na ordem de `data` (já filtrado por isBichittoPublished
  // na page.tsx). O primeiro é o default quando não há ?bichitto= na URL.
  const publishedIds = data.map((c) => c.id);
  const [activeFilter, setActiveFilter] = useState(() =>
    resolveInitialBichitto(searchParams.get('bichitto'), publishedIds),
  );

  // Troca a criatura ativa E sincroniza a URL (?bichitto=<id>), sem recarregar
  // nem empilhar histórico. É o único ponto de entrada do menu de filtros.
  const handleSelectFilter = (id: string) => {
    setActiveFilter(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set('bichitto', id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const { registerGallery, openGallery } = useModal();

  const bookIllustrated = t('bookIllustrated');

  // Build a flat list of book galleries: galleryId -> pages
  const galleries = useMemo(() => {
    const out: Record<
      string,
      {
        title: string;
        pages: string[];
        buy?: { url: string; label: string } | null;
      }
    > = {};
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
        out[`book_${creature.id}-${book.id}`] = {
          title,
          pages: book.pages,
          buy: book.buy,
        };
      }
    }
    return out;
  }, [data, t]);

  useEffect(() => {
    for (const [id, g] of Object.entries(galleries)) {
      registerGallery(id, g.pages);
    }
  }, [galleries, registerGallery]);

  // Ao trocar de criatura, a seção anterior desmonta e a nova monta — a posição
  // de scroll fica quebrada. Rola pra logo abaixo do FilterBar sticky. Espera um
  // beat pro layout da seção recém-montada assentar antes de medir.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const target = document.querySelector(
        `[data-section-creature="${activeFilter}"]`,
      );
      if (!target) return;
      const bar = document.querySelector('nav[aria-label="filters"]');
      const offset = bar ? bar.getBoundingClientRect().bottom + 10 : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 80);
    return () => window.clearTimeout(id);
  }, [activeFilter]);

  const handleBookClick = (creatureId: string, bookId: string) => {
    const galleryId = `book_${creatureId}-${bookId}`;
    const g = galleries[galleryId];
    if (!g) return;
    openGallery(galleryId, 0, g.title, bookIllustrated, undefined, undefined, undefined, g.buy);
  };

  // Índice da cor de cada criatura dentro da sua paleta. O resto (label,
  // ordem, quais criaturas aparecem) vem do payload, que já é gateado no
  // servidor e chega na ordem canônica.
  const FILTER_COLOR_INDEX: Record<string, number> = {
    napcat: 3,
    zeco: 3,
    taylo: 0,
    cheiodebolinha: 2,
    miscelania: 2,
  };
  const filters = data.map((c) => ({
    id: c.id,
    label: c.name,
    color: palettes[c.id].colors[FILTER_COLOR_INDEX[c.id]],
    bgColor: palettes[c.id].dark,
  }));

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
        showAll={false}
        defaultActive={publishedIds[0]}
        active={activeFilter}
        onFilter={handleSelectFilter}
      />

      {data.map((creature) => {
        const palette = palettes[creature.id];
        const colors = palettes[creature.id].bichittos!;
        // Cor da borda dos boxes. Só o Zeco define `borderColor` na paleta;
        // os outros caem no titleColor pra todos terem a mesma borda.
        const boxBorder = colors.borderColor ?? colors.titleColor;
        const { text, panelStory, name } = creature;
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
          const hasPages = Boolean(b.pages && b.pages.length > 0);
          return {
            id: `${creature.id}-${b.id}`,
            image: b.cover ?? undefined,
            alt: def?.title ?? b.id,
            label: def?.title ?? b.id,
            // "soon" só quando NÃO há páginas E NÃO há link de compra. Um livro
            // à venda (só capa + buyUrl) não é "em breve" — mostra o botão.
            soon: !hasPages && !b.buy,
            buy: b.buy ?? undefined,
          };
        });

        const panelTitle = `${name}${creature.id === 'napcat' ? ' & Violeta' : (creature.id === 'zeco' || creature.id === 'taylo') ? ' & Amigos' : ''}`;

        if (creature.id !== activeFilter) return null;

        return (
          <CreatureSection
            key={creature.id}
            id={creature.id}
            gradient={palette.gradientBg}
            accentColor={palette.colors[0]}
            bgImage={colors.bgImage}
            bgOpacity={0.22}
          >
            <CreatureCard
              name={name}
              color1={colors.name}
              color2={colors.text}
              banner={
                <DSMainCard
                  characters={creature.positions}
                  gradient={palette.gradient}
                  cardBgOpacity={0.7}
                  bottomShadow
                  bgGradientOverlay={palette.dark}
                  height="2000px"
                  maxHeight="800px"
                  titleColor={colors.titleColor}
                  textColor={colors.textColor}
                  mascot={creature.mascot}
                  textPanelTitle={panelTitle}
                  creatureAccent={colors.accent}
                  creatureAccentAlt={colors.accentAlt}
                  panelBadge={colors.tag}
                  panelBg={colors.panelBg}
                  panelBorderColor={colors.borderColor}
                  // Painel de texto escondido TEMPORARIAMENTE: sem `text`, o
                  // DSMainCard não renderiza o painel (título/tag/descrição).
                  // A cena + strip de personagens continuam. Pra reativar,
                  // descomente o bloco `text={...}` abaixo.
                  // text={
                  //   <>
                  //     {panelStory.map((p, i) => (
                  //       <p key={i}>{p}</p>
                  //     ))}
                  //   </>
                  // }
                >
                  {creature.chars.length > 0 && (
                    <CharacterStrip
                      characters={creature.chars.map((c) => ({
                        ...c,
                        name: c.name,
                      }))}
                      gradient={palette.gradient}
                      cardBg="rgba(255,255,255,0.12)"
                      cardSize={260}
                      labelColor={colors.stripColor ?? colors.titleColor}
                    />
                  )}
                  {/* Vídeo DENTRO do DSMain — só em xl+ (>1280px), centralizado
                      na horizontal, no vão à esquerda do personagem. Nas telas
                      menores ele aparece fora (bloco abaixo). */}
                  {creature.videos.length > 0 && (
                    <Box
                      display={{ base: 'none', xl: 'block' }}
                      position="absolute"
                      left="0"
                      right="0"
                      bottom="3rem"
                      zIndex={5}
                    >
                      {/* Mesmo container do card de baixo (1200px centralizado +
                          px 3rem) pra alinhar à esquerda com ele. */}
                      <Box maxW="1200px" mx="auto" px="3rem">
                        <BichittoVideoCarousel
                          videos={creature.videos}
                          color={colors.stripColor ?? colors.titleColor}
                        />
                      </Box>
                    </Box>
                  )}
                </DSMainCard>
              }
            >
              {text.map((p, i) => (
                <Text
                  key={i}
                  mb="0.8rem"
                  fontWeight={i === text.length - 1 ? 'bold' : undefined}
                >
                  {p}
                </Text>
              ))}
            </CreatureCard>
            {/* Carrossel de vídeo "um por vez" — fora do DSMain, só ATÉ xl
                (≤1280px). Em xl+ ele aparece DENTRO do DSMain (acima). */}
            {creature.videos.length > 0 && (
              <Box
                display={{ base: 'block', xl: 'none' }}
                maxW="1200px"
                mx="auto"
                px={{ base: '1.5rem', md: '3rem' }}
                pb={{ base: '1rem', md: '1.5rem' }}
              >
                <BichittoVideoCarousel
                  videos={creature.videos}
                  color={colors.stripColor ?? colors.titleColor}
                />
              </Box>
            )}
            {/* Dois boxes lado a lado (desktop) / empilhados (mobile):
                LIVRO (capa + título + botão) e TEXTO (a história). Estilo
                inspirado no card "Última Aventura" mas com a borda dos
                bichittos (outline + offset, na cor da criatura). */}
            <Box maxW="1200px" mx="auto" px={{ base: '1.5rem', md: '3rem' }} py={{ base: '1.5rem', md: '2.5rem' }}>
              <Grid
                templateColumns={
                  books.length > 0 && books[0]
                    ? { base: '1fr', md: '1fr 1fr' }
                    : '1fr'
                }
                gap={{ base: '2rem', md: '2.5rem' }}
                alignItems="stretch"
              >
                {/* Box do TEXTO (história) — mesma altura do box do livro
                    (height 100% no Grid stretch); scroll interno quando a
                    história é longa. */}
                {panelStory.length > 0 && (
                  <Box
                    borderRadius="20px"
                    p={{ base: '1.5rem', md: '2rem' }}
                    height="100%"
                    maxHeight={{ base: '420px', md: '560px' }}
                    overflowY="auto"
                    css={{
                      background: 'rgba(0,0,0,0.28)',
                      outline: `2px solid ${boxBorder}`,
                      outlineOffset: '6px',
                      // Scrollbar discreta na cor do bichitto.
                      scrollbarWidth: 'thin',
                      scrollbarColor: `${boxBorder} transparent`,
                      '&::-webkit-scrollbar': { width: '6px' },
                      '&::-webkit-scrollbar-thumb': {
                        background: boxBorder,
                        borderRadius: '999px',
                      },
                      '&::-webkit-scrollbar-track': { background: 'transparent' },
                    }}
                  >
                    {panelStory.map((p, i) => (
                      <Text
                        key={i}
                        mb="0.8rem"
                        fontSize={{ base: '0.9rem', md: 'md' }}
                        lineHeight={1.7}
                        color={colors.textColor}
                      >
                        {p}
                      </Text>
                    ))}
                  </Box>
                )}

                {/* Box do LIVRO (capa + título + botão) */}
                {books.length > 0 && books[0] && (
                  <Box
                    borderRadius="20px"
                    p={{ base: '1.5rem', md: '2rem' }}
                    height="100%"
                    css={{
                      background: 'rgba(0,0,0,0.28)',
                      outline: `2px solid ${boxBorder}`,
                      outlineOffset: '6px',
                    }}
                  >
                    <Text
                      textStyle="heading"
                      fontSize="xs"
                      letterSpacing="hero"
                      textTransform="uppercase"
                      color={colors.textColor}
                      mb="1rem"
                    >
                      {t('booksTitle')}
                    </Text>
                    {books[0].image && (
                      <chakra.img
                        src={books[0].image}
                        alt={books[0].alt}
                        width="100%"
                        borderRadius="12px"
                        mb="1rem"
                        css={{
                          outline: `2px solid ${boxBorder}`,
                          outlineOffset: '4px',
                          display: 'block',
                          objectFit: 'cover',
                        }}
                      />
                    )}
                    <Text textStyle="heading" fontSize={{ base: 'lg', md: 'xl' }} color={colors.textColor} mb="1rem">
                      {books[0].label}
                    </Text>
                    {books[0].buy ? (
                      // Livro à venda (só capa + link): botão leva pra loja.
                      <chakra.a
                        href={books[0].buy.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        css={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          outline: `2px solid ${boxBorder}`,
                          outlineOffset: '3px',
                          borderRadius: '999px',
                          padding: '0.5rem 1.4rem',
                          color: colors.textColor,
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          background: 'transparent',
                          textDecoration: 'none',
                          transition: 'transform 0.15s ease, opacity 0.15s ease',
                        }}
                      >
                        {books[0].buy.label} ↗
                      </chakra.a>
                    ) : !books[0].soon ? (
                      <chakra.button
                        type="button"
                        onClick={() => handleBookClick(creature.id, books[0].id.slice(creature.id.length + 1))}
                        css={{
                          display: 'inline-block',
                          outline: `2px solid ${boxBorder}`,
                          outlineOffset: '3px',
                          borderRadius: '999px',
                          padding: '0.5rem 1.4rem',
                          color: colors.textColor,
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          background: 'transparent',
                        }}
                      >
                        Ler história ✦
                      </chakra.button>
                    ) : null}
                  </Box>
                )}
              </Grid>
            </Box>
          </CreatureSection>
        );
      })}
    </>
  );
}
