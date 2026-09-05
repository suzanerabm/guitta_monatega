'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Box, Grid, Text, chakra } from '@chakra-ui/react';
import { Apple } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { HeroSection } from '@/components/HeroSection';
import { FilterBar } from '@/components/FilterBar';
import { CreatureSection } from '@/components/CreatureSection';
import { CreatureCard } from '@/components/bichittos/CreatureCard';
import { DSMainCard } from '@/components/DSMainCard';
import { CharacterStrip } from '@/components/bichittos/CharacterStrip';
import { BichittoVideoCarousel } from '@/components/bichittos/BichittoVideoCarousel';
import { BookPanel } from '@/components/BookPanel';
import { BookShelf } from '@/components/BookShelf';
import { useModal } from '@/components/Modal';
import { palettes, type CreatureId } from '@/theme/palettes';
import { isBichittoPublished } from '@/lib/visibility';
import { characterPositions, zecoMascot, bichittoVideos } from '@/data/bichittos';
import {
  getCreatureName,
  getCreatureText,
  getCreaturePanelStory,
  getBooksText,
} from '@/data/characters/bichittos/_creatureData';
import { translateName } from '@/lib/translateName';
import { resolveInitialBichitto } from './resolveInitialBichitto';
import type { Locale } from '@/lib/characters';

export interface BichittosCreatureData {
  id: CreatureId;
  chars: { name: string; image: string }[];
  books: {
    id: string;
    title: string;
    cover: string | null;
    pages: string[];
    buy: { url: string; label: string } | null;
  }[];
  stickers: {
    id: string;
    title: string;
    cover: string | null;
    buy: { url: string; label: string } | null;
  }[];
}

interface Props {
  data: BichittosCreatureData[];
}

export function BichittosClient({ data }: Props) {
  const t = useTranslations('bichittos');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Ids publicados, na ordem de `data` (já filtrado por isBichittoPublished
  // na page.tsx). O primeiro é o default quando não há ?bichitto= na URL.
  const publishedIds = data.map((c) => c.id);
  const hasAnyBook = data.some((c) => c.books.length > 0);
  const filterIds = hasAnyBook ? [...publishedIds, 'livros'] : publishedIds;
  const [activeFilter, setActiveFilter] = useState(() =>
    resolveInitialBichitto(searchParams.get('bichitto'), filterIds),
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

  // Word dictionary for translating filename-derived character names.
  // Each character image is named like "napcat-dormindo.png" — the manifest
  // stores the cleaned form ("napcat dormindo") and we translate each word
  // here so the label switches with the locale.
  const words = tCommon.raw('words') as Record<string, string>;

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
      for (const book of creature.books) {
        if (!book.pages || book.pages.length === 0) continue;
        out[`book_${creature.id}-${book.id}`] = {
          title: book.title,
          pages: book.pages,
          buy: book.buy,
        };
      }
    }
    return out;
  }, [data]);

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

  const allBooks = data.flatMap((creature) =>
    creature.books.map((b) => ({ ...b, creatureId: creature.id })),
  );

  const filters = [
    { id: 'napcat', label: getCreatureName('napcat', locale as Locale), color: palettes.napcat.colors[3], bgColor: palettes.napcat.dark },
    { id: 'zeco', label: getCreatureName('zeco', locale as Locale), color: palettes.zeco.colors[3], bgColor: palettes.zeco.dark },
    { id: 'taylo', label: getCreatureName('taylo', locale as Locale), color: palettes.taylo.colors[0], bgColor: palettes.taylo.dark },
    { id: 'cheiodebolinha', label: getCreatureName('cheiodebolinha', locale as Locale), color: palettes.cheiodebolinha.colors[2], bgColor: palettes.cheiodebolinha.dark },
    { id: 'miscelania', label: getCreatureName('miscelania', locale as Locale), color: palettes.miscelania.colors[2], bgColor: palettes.miscelania.dark },
  ].filter((f) => isBichittoPublished(f.id));

  const filtersWithBooks = [
    ...filters,
    ...(allBooks.length > 0 ? [{ id: 'livros', label: t('booksTitle') }] : []),
  ];

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
        filters={filtersWithBooks}
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
        const text = getCreatureText(creature.id, locale as Locale);
        const panelStory = getCreaturePanelStory(creature.id, locale as Locale);
        const name = getCreatureName(creature.id, locale as Locale);
        const books = creature.books.map((b) => {
          const hasPages = Boolean(b.pages && b.pages.length > 0);
          return {
            id: `${creature.id}-${b.id}`,
            image: b.cover ?? undefined,
            alt: b.title,
            label: b.title,
            // "soon" só quando NÃO há páginas E NÃO há link de compra. Um livro
            // à venda (só capa + buyUrl) não é "em breve" — mostra o botão.
            soon: !hasPages && !b.buy,
            buy: b.buy ?? undefined,
          };
        });
        const stickers = (creature.stickers ?? []).map((sticker) => ({
          id: `${creature.id}-${sticker.id}`,
          image: sticker.cover ?? undefined,
          alt: sticker.title,
          label: sticker.title,
          soon: !sticker.buy,
          buy: sticker.buy ?? undefined,
        }));

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
                  characters={characterPositions[creature.id] ?? []}
                  gradient={palette.gradient}
                  cardBgOpacity={0.7}
                  bottomShadow
                  bgGradientOverlay={palette.dark}
                  height="2000px"
                  maxHeight="800px"
                  titleColor={colors.titleColor}
                  textColor={colors.textColor}
                  mascot={creature.id === 'zeco' ? zecoMascot : undefined}
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
                        name: translateName(c.name, words),
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
                  {(bichittoVideos[creature.id]?.length ?? 0) > 0 && (
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
                          videos={bichittoVideos[creature.id]!}
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
            {(bichittoVideos[creature.id]?.length ?? 0) > 0 && (
              <Box
                display={{ base: 'block', xl: 'none' }}
                maxW="1200px"
                mx="auto"
                px={{ base: '1.5rem', md: '3rem' }}
                pb={{ base: '1rem', md: '1.5rem' }}
              >
                <BichittoVideoCarousel
                  videos={bichittoVideos[creature.id]!}
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
                <Box display="flex" flexDirection="column" gap={{ base: '1rem', md: '1.5rem' }}>
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

                {stickers.length > 0 && (
                  <Box
                    maxW={{ base: '100%', md: '520px' }}
                    display="flex"
                    alignItems="center"
                    gap={{ base: '1rem', md: '1.25rem' }}
                    p={{ base: '0.85rem', md: '1rem' }}
                    borderRadius="xl"
                    css={{
                      background: 'rgba(0,0,0,0.22)',
                      outline: `1px solid ${boxBorder}`,
                      outlineOffset: '3px',
                    }}
                  >
                    {stickers[0].image && (
                      <Box
                        flexShrink={0}
                        width={{ base: '64px', md: '76px' }}
                        height={{ base: '64px', md: '76px' }}
                        borderRadius="lg"
                        overflow="hidden"
                      >
                        <chakra.img
                          src={stickers[0].image}
                          alt={stickers[0].alt}
                          width="100%"
                          height="100%"
                          objectFit="cover"
                        />
                      </Box>
                    )}
                    <Box minW={0} flex="1">
                      <Text
                        fontSize="xs"
                        letterSpacing="hero"
                        textTransform="uppercase"
                        color={colors.textColor}
                        mb="0.25rem"
                      >
                        {t('stickersTitle')}
                      </Text>
                      <Text
                        fontSize={{ base: 'md', md: 'lg' }}
                        color={colors.textColor}
                        mb="0.7rem"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                      >
                        {stickers[0].label}
                      </Text>
                      {stickers[0].buy && (
                        <chakra.a
                          href={stickers[0].buy.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          display="inline-flex"
                          alignItems="center"
                          gap="0.35rem"
                          color={colors.textColor}
                          fontSize="xs"
                          fontWeight="semibold"
                          letterSpacing="normal"
                          textTransform="uppercase"
                          textDecoration="none"
                        >
                          <Apple size={16} aria-hidden="true" />
                          {stickers[0].buy.label}
                        </chakra.a>
                      )}
                    </Box>
                  </Box>
                )}
                </Box>

                {/* Box do LIVRO (capa + título + botão) */}
                {books.length > 0 && books[0] && (
                  <BookPanel
                    title={t('booksTitle')}
                    book={books[0]}
                    borderColor={boxBorder}
                    textColor={colors.textColor}
                    onRead={(bookId) =>
                      handleBookClick(creature.id, bookId.slice(creature.id.length + 1))
                    }
                  />
                )}
              </Grid>
            </Box>
          </CreatureSection>
        );
      })}

      {allBooks.length > 0 && activeFilter === 'livros' && (
        <CreatureSection
          id="livros"
          gradient={palettes.livros.gradientBg}
          accentColor={palettes.livros.colors[0]}
          bgImage={palettes.livros.bichittos?.bgImage}
          bgOpacity={0.3}
        >
          <CreatureCard
            name={t('booksTitle')}
            color1={palettes.livros.dark}
            color2={palettes.livros.dark}
          >
            {getBooksText(locale as Locale).map((paragraph, i, arr) => (
              <Box key={i} as={i === arr.length - 1 ? 'strong' : 'p'} display="block" fontWeight={i === arr.length - 1 ? 'bold' : 'inherit'} mb={i < arr.length - 1 ? '1rem' : 0}>
                {paragraph}
              </Box>
            ))}
          </CreatureCard>
          {/* ── Camada inferior — mesma receita do DSMainCard (fundo +
              overlay + sombra de elevação em cima/embaixo), sem o resto da
              complexidade (personagens/mascote), já que aqui só precisamos
              do grid de livros por cima. Cores vêm de palettes.livros (tema),
              separada de palettes.bichittos (usada no HeroSection do topo). ── */}
          <Box
            position="relative"
            width="100%"
            minH={{ base: 'auto', md: '400px' }}
            mt={{ base: '3rem', md: '2.5rem' }}
            overflow="hidden"
            boxShadow="0 20px 50px rgba(0,0,0,0.35), 0 -20px 50px rgba(0,0,0,0.35), 0 8px 20px rgba(0,0,0,0.25), 0 -8px 20px rgba(0,0,0,0.25)"
          >
            <Box
              data-testid="livros-bg"
              position="absolute"
              inset={0}
              zIndex={0}
              background={palettes.livros.bichittos?.panelBg}
            />
            <Box
              data-testid="livros-bg-overlay"
              position="absolute"
              inset={0}
              zIndex={0}
              pointerEvents="none"
              css={{
                background: `linear-gradient(to bottom, transparent 0%, ${palettes.livros.dark}22 60%, ${palettes.livros.dark}88 100%)`,
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
            />
            <Box position="relative" zIndex={1} py="2rem">
              <BookShelf
                title={t('booksTitle')}
                arrowColor={palettes.livros.colors[0]}
                books={allBooks.map((b) => ({
                  book: {
                    id: `${b.creatureId}-${b.id}`,
                    image: b.cover ?? undefined,
                    alt: b.title,
                    label: b.title,
                    soon: !(b.pages && b.pages.length > 0) && !b.buy,
                    buy: b.buy ?? undefined,
                  },
                  // TODO(design): cor por livro ainda não decidida — usando
                  // palettes.livros.colors[0] como neutro legível sobre o
                  // fundo escuro desta seção. Ajustar no tema (ou trocar por
                  // uma cor por criatura) quando a paleta for definida.
                  borderColor: palettes.livros.colors[0],
                  textColor: palettes.livros.colors[0],
                  onRead: (bookId) => handleBookClick(b.creatureId, bookId.slice(b.creatureId.length + 1)),
                }))}
              />
            </Box>
          </Box>
        </CreatureSection>
      )}
    </>
  );
}
