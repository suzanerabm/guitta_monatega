'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Box, Text, Heading } from '@chakra-ui/react';
import type { Character } from '@/data/characters/types';
import { getLocalizedName, getLocalizedSpecies, getLocalizedBio, type Locale } from '@/lib/characters';

export interface CharacterInfoPanelProps {
  /** Character to display. When null/undefined, the panel is hidden. */
  character: Character | null | undefined;
  /** Active locale for i18n text. */
  locale: Locale;
  /**
   * Element the panel anchors to. The panel is rendered via a portal to
   * document.body and positioned in viewport coordinates (position: fixed)
   * directly below this element. Required — without it the panel can't
   * know where to render.
   */
  anchorEl: HTMLElement | null;
  /**
   * Called when the user dismisses the panel via the close button.
   * When provided, a small X is rendered in the top-right corner.
   */
  onClose?: () => void;
}

interface AnchorRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * CharacterInfoPanel — info card rendered in a portal, anchored below a
 * character card in the CharacterStrip. Uses `position: fixed` with
 * viewport-space coordinates so it escapes any ancestor with overflow:hidden
 * (the strip's track, the mask container, the DSMainCard stripSide wrapper).
 *
 * Recomputes position on window resize and on scroll. Hidden when
 * `character` or `anchorEl` is null.
 */
export function CharacterInfoPanel({
  character,
  locale,
  anchorEl,
  onClose,
}: CharacterInfoPanelProps) {
  const [rect, setRect] = useState<AnchorRect | null>(null);

  useEffect(() => {
    if (!anchorEl) {
      setRect(null);
      return;
    }
    const measure = () => {
      const r = anchorEl.getBoundingClientRect();
      setRect({ left: r.left, top: r.top, width: r.width, height: r.height });
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [anchorEl]);

  if (!character || !rect) return null;
  if (typeof document === 'undefined') return null;

  const name = getLocalizedName(character, locale);
  const species = getLocalizedSpecies(character, locale);
  const bio = getLocalizedBio(character, locale);

  const GAP = 12; // px gap between card bottom and panel top
  const centerX = rect.left + rect.width / 2;
  const topY = rect.top + rect.height + GAP;

  return createPortal(
    <Box
      position="fixed"
      top={`${topY}px`}
      left={`${centerX}px`}
      transform="translateX(-50%)"
      width={{ base: '220px', md: '280px' }}
      maxW="90vw"
      bg="rgba(0,0,0,0.3)"
      backdropFilter="blur(8px)"
      borderRadius="16px"
      outline="2px solid"
      outlineColor="outlineMid"
      outlineOffset="3px"
      boxShadow="dsPanel"
      zIndex={2000}
      animation="fadeIn 0.2s ease"
      // Prevent clicks inside the panel from reaching the document mousedown
      // listener (which closes the panel on outside click).
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <Box
        padding={{ base: '0.9rem 1rem', md: '1rem 1.2rem' }}
        maxH="min(70vh, 500px)"
        overflowY="auto"
        css={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          // Soft fade at the top and bottom edges — mirrors DSTextPanel
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}
      >
        <Heading
          as="h4"
          fontSize="md"
          fontWeight="bold"
          color="white"
          pr="1.5rem"
          mb="0.3rem"
          lineHeight={1.2}
        >
          {name}
        </Heading>
        <Text
          textStyle="label"
          color="textOverlayDim"
          mb="0.5rem"
        >
          {species}
        </Text>
        {bio && (
          <Text
            fontSize="sm"
            fontWeight="light"
            color="textOverlay"
            lineHeight={1.5}
          >
            {bio}
          </Text>
        )}
      </Box>
    </Box>,
    document.body
  );
}
