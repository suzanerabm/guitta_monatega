'use client';
import { useState } from 'react';
import { Box, Text } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';

export interface DSCardRevealSlot {
  /** Content rendered in neutral state (the normal banner). */
  content: React.ReactNode;
  /** Title shown on the spine when this slot is covered by the sibling. */
  title: string;
  /** Background color of the spine when this slot is covered. */
  spineBg?: string;
  /** Text color of the spine when this slot is covered. */
  spineColor?: string;
}

export interface DSCardExpandSlot {
  /** Content rendered by this slot. Receives no special props. */
  content: React.ReactNode;
}

export interface DSCardProps extends BoxProps {
  /**
   * Two-slot reveal layout with the book-spine effect. In neutral state both
   * slots are 50/50. Hovering a slot makes it expand fully, leaving the other
   * as a narrow rotated spine.
   *
   * When this prop is set, `children` is ignored.
   */
  reveal?: {
    left: DSCardRevealSlot;
    right: DSCardRevealSlot;
  };
  /**
   * Two-slot gentle expand layout. In neutral state both slots are 50/50.
   * Hovering a slot grows it by a small amount (default 10%) toward the
   * opposite side — the sibling shrinks proportionally but stays fully
   * visible. Used for the subtle cinematic feeling on the home banners.
   *
   * When this prop is set, `children` and `reveal` are ignored.
   */
  expand?: {
    left: DSCardExpandSlot;
    right: DSCardExpandSlot;
    /**
     * Expansion amount as a fraction (0.10 = 10% extra flex). Defaults to 0.10.
     */
    amount?: number;
  };
}

/** Fixed width of the spine (the book-edge visible when a slot is covered). */
const SPINE_WIDTH = { base: '40px', md: '60px' };

/**
 * DSCard — transparent base container for composing design-system layouts.
 *
 * Modes:
 * 1. **Plain**: neutral shell with zero chrome. Pass BoxProps + children.
 * 2. **Reveal**: two slots with a book-spine reveal-on-hover.
 * 3. **Expand**: two slots with a gentle 10% grow-on-hover.
 *
 * Unlike DSMainCard (gradient, shadow, split sides) this is intentionally
 * neutral so it can be composed in different contexts.
 */
export function DSCard({ reveal, expand, children, ...rest }: DSCardProps) {
  const [hovered, setHovered] = useState<'left' | 'right' | null>(null);

  // ---- Expand mode (gentle 10% grow) ----
  if (expand) {
    const amount = expand.amount ?? 0.1;
    const isLeftHover = hovered === 'left';
    const isRightHover = hovered === 'right';
    const leftFlex = isLeftHover ? 1 + amount : isRightHover ? 1 - amount : 1;
    const rightFlex = isRightHover ? 1 + amount : isLeftHover ? 1 - amount : 1;

    // overflow visible so slot content can escape (ex: character poking out
    // of a banner on hover). The slot's own HomeBanner still clips its own
    // background via its internal overflow.
    return (
      <Box
        position="relative"
        display="flex"
        width="100%"
        overflow="visible"
        {...rest}
      >
        <Box
          position="relative"
          flex={`${leftFlex} 1 0`}
          overflow="visible"
          transition="flex 0.5s cubic-bezier(0.22, 0.61, 0.36, 1)"
          onMouseEnter={() => setHovered('left')}
          onMouseLeave={() => setHovered((h) => (h === 'left' ? null : h))}
          zIndex={isLeftHover ? 2 : 1}
        >
          {expand.left.content}
        </Box>
        <Box
          position="relative"
          flex={`${rightFlex} 1 0`}
          overflow="visible"
          transition="flex 0.5s cubic-bezier(0.22, 0.61, 0.36, 1)"
          onMouseEnter={() => setHovered('right')}
          onMouseLeave={() => setHovered((h) => (h === 'right' ? null : h))}
          zIndex={isRightHover ? 2 : 1}
        >
          {expand.right.content}
        </Box>
      </Box>
    );
  }

  // ---- Reveal mode (book spine cover-on-hover) ----
  if (reveal) {
    // Flex ratios per state. Neutral = 50/50. Hover one side → it grows,
    // the other shrinks to a narrow spine.
    const isLeftHover = hovered === 'left';
    const isRightHover = hovered === 'right';
    const leftFlex = isLeftHover ? 1 : isRightHover ? 0 : 1;
    const rightFlex = isRightHover ? 1 : isLeftHover ? 0 : 1;

    return (
      <Box
        position="relative"
        display="flex"
        width="100%"
        overflow="hidden"
        {...rest}
      >
        {/* LEFT slot */}
        <Box
          position="relative"
          flex={`${leftFlex} 1 0`}
          minW={isRightHover ? SPINE_WIDTH : 0}
          overflow="hidden"
          transition="flex 0.6s cubic-bezier(0.22, 0.61, 0.36, 1), min-width 0.6s cubic-bezier(0.22, 0.61, 0.36, 1)"
          onMouseEnter={() => setHovered('left')}
          onMouseLeave={() => setHovered((h) => (h === 'left' ? null : h))}
          zIndex={isLeftHover ? 2 : 1}
        >
          <Box
            opacity={isRightHover ? 0 : 1}
            transition="opacity 0.3s ease"
            height="100%"
            pointerEvents={isRightHover ? 'none' : 'auto'}
          >
            {reveal.left.content}
          </Box>
          <Box
            position="absolute"
            inset={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg={reveal.left.spineBg ?? 'black'}
            opacity={isRightHover ? 1 : 0}
            transition="opacity 0.4s ease 0.1s"
            pointerEvents="none"
            py="3xl"
          >
            <Text
              css={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              textStyle="heading"
              fontSize="h2"
              letterSpacing="heroTitle"
              textTransform="uppercase"
              color={reveal.left.spineColor ?? 'white'}
              whiteSpace="nowrap"
            >
              {reveal.left.title}
            </Text>
          </Box>
        </Box>

        {/* RIGHT slot */}
        <Box
          position="relative"
          flex={`${rightFlex} 1 0`}
          minW={isLeftHover ? SPINE_WIDTH : 0}
          overflow="hidden"
          transition="flex 0.6s cubic-bezier(0.22, 0.61, 0.36, 1), min-width 0.6s cubic-bezier(0.22, 0.61, 0.36, 1)"
          onMouseEnter={() => setHovered('right')}
          onMouseLeave={() => setHovered((h) => (h === 'right' ? null : h))}
          zIndex={isRightHover ? 2 : 1}
        >
          <Box
            opacity={isLeftHover ? 0 : 1}
            transition="opacity 0.3s ease"
            height="100%"
            pointerEvents={isLeftHover ? 'none' : 'auto'}
          >
            {reveal.right.content}
          </Box>
          <Box
            position="absolute"
            inset={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg={reveal.right.spineBg ?? 'black'}
            opacity={isLeftHover ? 1 : 0}
            transition="opacity 0.4s ease 0.1s"
            pointerEvents="none"
            py="3xl"
          >
            <Text
              css={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              textStyle="heading"
              fontSize="h2"
              letterSpacing="heroTitle"
              textTransform="uppercase"
              color={reveal.right.spineColor ?? 'white'}
              whiteSpace="nowrap"
            >
              {reveal.right.title}
            </Text>
          </Box>
        </Box>
      </Box>
    );
  }

  // ---- Plain mode ----
  return <Box {...rest}>{children}</Box>;
}
