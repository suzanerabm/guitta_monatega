'use client';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Box, Flex, Text, chakra } from '@chakra-ui/react';
import { useModal } from '@/components/Modal';
import { KammaraWatermark } from '@/components/KammaraWatermark';
import { LazyVideo } from '@/components/LazyVideo';

export interface KammaraDrop {
  /** Video src (.mp4). The .webm sibling is offered automatically. */
  video: string;
  /** Poster image (shown while the video loads). */
  poster: string;
  /** Caption shown in the card footer. */
  label: string;
}

export interface KammaraDropsStripProps {
  /** Small clips to show — one card each. */
  drops: KammaraDrop[];
  /** World display name shown in each card header (e.g. "ORF-V"). */
  worldName: string;
  /** Crest glyph of the world (breadcrumb + watermark). */
  crestGlyph: string;
  /** Accent color (palette.colors[0] of the world). */
  color: string;
  /** Cor da moldura (border + outline). Default: `color`. */
  borderColor?: string;
  /** Cor do título + glifo + linha + contador do cabeçalho. Default: `color`. */
  titleColor?: string;
  /** Mid color for the card gradient. Falls back to darkColor. */
  midColor?: string;
  /** Dark base color (palette.dark). */
  darkColor: string;
  /** Section heading (e.g. "Drops · ORF-V"). */
  sectionTitle?: string;
  /** Modal hero subtitle — the world description, same as the scene modal. */
  modalSubtitle?: string;
  /** Text color for the Kammara modal (palette.text), same as the scene modal. */
  modalTextColor?: string;
  'data-testid'?: string;
}

const KEYFRAMES = `
@keyframes kds-in {
  from { opacity: 0; transform: translateY(14px) scale(0.97); }
  to   { opacity: 1; transform: none; }
}`;

/**
 * KammaraDropsStrip — a premium horizontal strip of "small clips" (short
 * looping videos) for a world. Each clip is a full card in the Kammara card
 * idiom: a kalún breadcrumb + world name header, a 16:9 video framed with
 * even margins, and a footer caption styled like the DSTextPanel subtitle.
 *
 * Clicking a card opens it in the shared ModalKammara (large, with controls,
 * no zoom) — the same modal the scenes use, via the gallery's `videos[]`.
 */
export function KammaraDropsStrip({
  drops,
  worldName,
  crestGlyph,
  color,
  borderColor,
  titleColor,
  midColor,
  darkColor,
  sectionTitle,
  modalSubtitle,
  modalTextColor,
  'data-testid': testId,
}: KammaraDropsStripProps) {
  const mid = midColor ?? darkColor;
  const bd = borderColor ?? color;
  const tc = titleColor ?? color;
  const fallbackId = useId();
  const id = `kammara-drops-${fallbackId}`;
  const scrollRef = useRef<HTMLDivElement>(null);
  const { registerGallery, openKammaraGallery } = useModal();

  // Track scroll position so the arrows dim/disable at the ends.
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      setCanPrev(el.scrollLeft > 2);
      setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [drops.length]);

  // Register the modal gallery: posters as images, captions as labels, and
  // the videos parallel array so the modal plays each clip.
  useEffect(() => {
    registerGallery(
      id,
      drops.map((d) => d.poster),
      drops.map((d) => d.label),
      drops.map((d) => d.video),
    );
  }, [id, drops, registerGallery]);

  const handleClick = useCallback(
    (index: number) => {
      openKammaraGallery({
        galleryId: id,
        startIndex: index,
        color,
        darkColor,
        crestGlyph,
        // Same as the scene modal: the world name is the hero title, the
        // world description is the hero text, and the per-clip caption comes
        // from the gallery `labels`.
        heroTitle: worldName,
        heroText: modalSubtitle,
        textColor: modalTextColor,
      });
    },
    [id, openKammaraGallery, color, darkColor, crestGlyph, worldName, modalSubtitle, modalTextColor],
  );

  const handleArrow = (dir: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy?.({ left: dir * 380, behavior: 'smooth' });
  };

  const arrowBtn = (enabled: boolean) =>
    ({
      flexShrink: 0,
      zIndex: 10,
      background: 'none',
      border: 'none',
      padding: '0.5rem',
      display: { base: 'none', md: 'flex' },
      alignItems: 'center',
      justifyContent: 'center',
      cursor: enabled ? 'pointer' : 'default',
      color: enabled ? color : 'glyphDisabled',
      opacity: enabled ? 1 : 0.4,
      fontFamily: 'glyph',
      fontSize: 'glyphH1',
      lineHeight: 1,
      transition: 'opacity 0.2s ease, transform 0.2s ease, color 0.2s ease',
      _hover: enabled ? { opacity: 0.7, transform: 'scale(1.15)' } : {},
    }) as const;

  if (drops.length === 0) return null;

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* ── Mobile (base → md): plain swipe strip, no frame/title ──
          Same call as KammaraCharacterGallery: on a phone the HUD frame just
          steals width (and the cards end up overflowing it), so we drop the
          frame entirely and let the user flick through a snap scroller. */}
      <Box
        display={{ base: 'block', md: 'none' }}
        data-testid={testId ? `${testId}-mobile` : 'kammara-drops-strip-mobile'}
        width="100%"
        css={{
          overflowX: 'auto',
          // Keep horizontal swipes inside the slider — see desktop block.
          overscrollBehaviorX: 'contain',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          // One clip per screen, full-width like the home mosaic. Even 16px
          // gutters, snap-padding matched both sides so each clip lands flush.
          padding: '8px 16px',
          scrollPaddingLeft: '16px',
          scrollPaddingRight: '16px',
        }}
      >
        <Box display="flex" css={{ gap: '16px', width: 'max-content' }}>
          {/* Mobile: just the clip (no HUD frame/header/footer) — same clean
              full-width tile as the home mosaic, so it's easy to see on a phone. */}
          {drops.map((drop, i) => (
            <chakra.button
              key={`${drop.video}-${i}`}
              type="button"
              onClick={() => handleClick(i)}
              aria-label={drop.label}
              position="relative"
              flexShrink={0}
              // Largura = o MENOR entre "quase a tela" (retrato) e "o que cabe
              // na altura mantendo 16/9" (paisagem). Em retrato a 1ª opção vence
              // (sobra altura); ao girar, a altura fica curta e a 2ª vence — o
              // tile encolhe junto e o vídeo NÃO esmaga. min() resolve nos dois
              // sem detectar orientação. 90vh deixa respiro pro menu/barras.
              width="min(calc(100vw - 32px), calc(90vh * 16 / 9))"
              maxW="calc(100vw - 32px)"
              aspectRatio="16 / 9"
              borderRadius="14px"
              overflow="hidden"
              cursor="pointer"
              css={{
                scrollSnapAlign: 'start',
                boxShadow: `inset 0 0 0 1px ${color}40, 0 8px 24px rgba(0,0,0,0.35)`,
              }}
            >
              <LazyVideo src={drop.video} poster={drop.poster} alt={drop.label} fit="cover" playOn="visible" />
              <KammaraWatermark crestGlyph={crestGlyph} worldName={worldName} size="card" />
            </chakra.button>
          ))}
        </Box>
      </Box>

      {/* ── Desktop (md+): the full HUD frame with title + arrows ── */}
      <Box
        display={{ base: 'none', md: 'block' }}
        data-testid={testId ?? 'kammara-drops-strip'}
        position="relative"
        width="100%"
        borderRadius="24px"
        paddingX={{ base: 'md', md: 'lg' }}
        paddingY={{ base: 'lg', md: 'xl' }}
        css={{
          // Frame HUD like the character gallery — same translucent gradient
          // (more transparent than the cards) + accent border + outline.
          background: `linear-gradient(160deg, ${darkColor}33 0%, ${darkColor}26 50%, ${darkColor}33 100%)`,
          border: `1px solid ${bd}40`,
          outline: `1px solid ${bd}80`,
          outlineOffset: '4px',
          boxShadow: `0 20px 60px ${color}30, 0 4px 16px ${color}20, inset 0 1px 0 rgba(255,255,255,0.08)`,
        }}
      >

      {/* Angular HUD corner decorations (TL, TR, BL, BR) */}
      {[
        { top: '-4px', left: '-4px', borderTop: '2px', borderLeft: '2px' },
        { top: '-4px', right: '-4px', borderTop: '2px', borderRight: '2px' },
        { bottom: '-4px', left: '-4px', borderBottom: '2px', borderLeft: '2px' },
        { bottom: '-4px', right: '-4px', borderBottom: '2px', borderRight: '2px' },
      ].map((pos, i) => (
        <Box
          key={i}
          position="absolute"
          width="18px"
          height="18px"
          pointerEvents="none"
          aria-hidden="true"
          css={{
            top: pos.top,
            left: pos.left,
            right: pos.right,
            bottom: pos.bottom,
            borderTopWidth: pos.borderTop,
            borderLeftWidth: pos.borderLeft,
            borderRightWidth: pos.borderRight,
            borderBottomWidth: pos.borderBottom,
            borderStyle: 'solid',
            borderColor: bd,
            boxShadow: `0 0 8px ${bd}80`,
          }}
        />
      ))}

      <Flex direction="column" position="relative" zIndex={1} gap={{ base: 'md', md: 'lg' }}>
        {/* ── Header inside the frame: crest + title left, count right ── */}
        <Flex align="center" justify="space-between" gap="sm" css={{ borderBottom: `1px solid ${tc}40`, paddingBottom: '0.8rem' }}>
          <Flex align="center" gap="sm" minW={0}>
            <Box as="span" fontFamily="glyph" fontSize="glyphH3" lineHeight={1} color={tc} aria-hidden="true" css={{ whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>
              {crestGlyph}
            </Box>
            {sectionTitle && (
              <Text fontSize="xs" letterSpacing="hero" textTransform="uppercase" fontWeight="bold" color={tc} m={0} opacity={0.9} css={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {sectionTitle}
              </Text>
            )}
          </Flex>
          <Text fontSize="xs" letterSpacing="wide" fontWeight="semibold" color={tc} m={0} opacity={0.7} css={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
            {drops.length}
          </Text>
        </Flex>

        {/* ── Cards row — no edge mask, so the first card shows whole ── */}
        <Flex align="center">
          <chakra.button {...arrowBtn(canPrev)} type="button" aria-label="Previous" disabled={!canPrev} onClick={() => handleArrow(-1)} mr="0.5rem">
            ⊷
          </chakra.button>

          <Box
            ref={scrollRef}
            flex={1}
            minWidth={0}
            css={{
              overflowX: 'auto',
              // Keep horizontal swipes inside the slider: without this, a swipe
              // past the end triggers the browser's back/forward gesture (404 /
              // jumps home). See specs/2026-06-21-performance-*.
              overscrollBehaviorX: 'contain',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {/* Vertical padding gives the cards room to lift + scale on hover
                without being clipped by the scroller's overflow. The 16px side
                gutters (matching KammaraCharacterGallery) keep the first/last
                card off the edge so their hover outline never gets cut. */}
            <Flex gap="26px" padding="18px 16px 22px" width="max-content" align="stretch">
              {drops.map((drop, i) => (
                <DropCard
                  key={`${drop.video}-${i}`}
                  drop={drop}
                  index={i}
                  worldName={worldName}
                  crestGlyph={crestGlyph}
                  color={color}
                  borderColor={bd}
                  mid={mid}
                  darkColor={darkColor}
                  onClick={() => handleClick(i)}
                  playOn="visible"
                />
              ))}
            </Flex>
          </Box>

          <chakra.button {...arrowBtn(canNext)} type="button" aria-label="Next" disabled={!canNext} onClick={() => handleArrow(1)} ml="0.5rem">
            ⊶
          </chakra.button>
        </Flex>
      </Flex>
      </Box>
    </>
  );
}

interface DropCardProps {
  drop: KammaraDrop;
  index: number;
  worldName: string;
  crestGlyph: string;
  color: string;
  borderColor?: string;
  mid: string;
  darkColor: string;
  onClick: () => void;
  /** How the clip starts playing — 'hover' on desktop, 'visible' on mobile. */
  playOn: 'hover' | 'visible';
}

function DropCard({ drop, index, worldName, crestGlyph, color, borderColor, mid, darkColor, onClick, playOn }: DropCardProps) {
  const bd = borderColor ?? color;
  return (
    <chakra.button
      type="button"
      onClick={onClick}
      data-testid={`drop-card-${index}`}
      flexShrink={0}
      width={{ base: '84vw', md: '560px', xl: '660px', '2xl': '760px' }}
      maxW={{ base: '500px', md: 'none' }}
      position="relative"
      overflow="hidden"
      borderRadius="28px"
      textAlign="left"
      css={{
        // Same background recipe as KammaraCharacterCard (160deg, b3 alpha,
        // darkColor → mid → darkColor) so the Drops cards match the character
        // cards. `mid` falls back to darkColor when no midColor is passed.
        background: `linear-gradient(160deg, ${darkColor}b3 0%, ${mid}b3 45%, ${darkColor}b3 100%)`,
        border: `1px solid ${bd}40`,
        outline: `2px solid ${bd}`,
        outlineOffset: '5px',
        boxShadow: `0 20px 60px ${color}50, 0 4px 16px ${color}30, inset 0 1px 0 rgba(255,255,255,0.15)`,
        cursor: 'pointer',
        transition: 'transform 0.35s cubic-bezier(.2,.8,.2,1), box-shadow 0.35s ease',
        animation: `kds-in 0.5s ease-out ${Math.min(index, 6) * 80}ms both`,
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        '&:hover': {
          transform: 'translateY(-6px) scale(1.02)',
          boxShadow: `0 30px 80px ${color}66, 0 0 50px ${color}50`,
        },
        '&:hover .kds-play': { opacity: 1 },
      }}
    >
      {/* ── Header: kalún breadcrumb + world name, with glyph watermark ── */}
      <Flex
        position="relative"
        align="center"
        justify="space-between"
        padding="0.9rem 2rem 0.8rem"
        overflow="hidden"
        css={{ borderBottom: `1px solid ${color}33` }}
      >
        <Flex
          position="absolute"
          inset={0}
          align="center"
          justify="center"
          gap="1.4rem"
          pointerEvents="none"
          aria-hidden="true"
          css={{ fontFamily: 'var(--chakra-fonts-glyph)', fontSize: '2.6rem', color: `${color}1f`, lineHeight: 1 }}
        >
          <span>⊹</span><span>{crestGlyph}</span><span>⊷</span><span>{crestGlyph}</span><span>⊹</span>
        </Flex>

        <Flex
          position="relative"
          align="center"
          gap="6px"
          css={{ fontFamily: 'var(--chakra-fonts-glyph)', color: `${color}cc`, letterSpacing: '0.14em', fontSize: '15px' }}
        >
          <Box width="22px" height="1px" css={{ background: `linear-gradient(90deg, transparent, ${color}80)` }} />
          <span>⊷ {crestGlyph} ⊶</span>
          <Box width="22px" height="1px" css={{ background: `linear-gradient(90deg, ${color}80, transparent)` }} />
        </Flex>

        <Text
          position="relative"
          m={0}
          fontSize="xs"
          letterSpacing="hero"
          textTransform="uppercase"
          fontWeight="bold"
          color={color}
          css={{ textShadow: `0 0 12px ${color}55` }}
        >
          {worldName}
        </Text>
      </Flex>

      {/* ── Video: 16:9, even margins on all sides ── */}
      <Box
        position="relative"
        margin="1.1rem 2rem"
        borderRadius="14px"
        overflow="hidden"
        css={{
          aspectRatio: '16 / 9',
          // Inset ring drawn OVER the video (the <video> covers a plain
          // border), plus an outer drop shadow for depth.
          boxShadow: `inset 0 0 0 1px ${color}40, 0 8px 24px rgba(0,0,0,0.35)`,
        }}
      >
        {/* Lazy: poster until its trigger fires (hover on desktop, visibility
            on mobile where there's no hover). See LazyVideo. */}
        <LazyVideo src={drop.video} poster={drop.poster} alt={drop.label} fit="cover" playOn={playOn} />

        {/* Origin stamp over the clip — see KammaraWatermark. */}
        <KammaraWatermark crestGlyph={crestGlyph} worldName={worldName} size="card" />
        <Box
          className="kds-play"
          position="absolute"
          top="8px"
          right="8px"
          width="30px"
          height="30px"
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="12px"
          color="textOverlayBright"
          opacity={0}
          pointerEvents="none"
          css={{ background: `${darkColor}cc`, border: `1px solid ${color}`, transition: 'opacity 0.3s ease' }}
        >
          ▶
        </Box>
      </Box>

      {/* ── Footer: caption (DSTextPanel subtitle style) + glyph ── */}
      <Flex align="center" justify="space-between" padding="0.2rem 2rem 0.9rem">
        <Text
          as="span"
          m={0}
          color={color}
          css={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}
        >
          {drop.label}
        </Text>
        <Box as="span" css={{ fontFamily: 'var(--chakra-fonts-glyph)', color: `${color}aa`, letterSpacing: '0.3em', fontSize: '13px' }}>
          ⊹ {crestGlyph} ⊹
        </Box>
      </Flex>
    </chakra.button>
  );
}
