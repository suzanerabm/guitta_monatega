import { Box, Text } from '@chakra-ui/react';

interface CharacterCardProps {
  name: string;
  image: string;
  gradient?: string;
  cardSize?: number;
  noFloat?: boolean;
  transparent?: boolean;
  noBorder?: boolean;
  noHoverScale?: boolean;
  cardBg?: string;
  labelColor?: string;
  /**
   * When true, the card is locked in its "expanded" state (same scale as
   * hover) even if the cursor isn't over it. Used when a card is clicked
   * and the info panel is showing — the visual mirrors hover without
   * depending on pointer state.
   */
  isSelected?: boolean;
  'data-testid'?: string;
}

import { palettes } from '@/theme/palettes';

const DEFAULT_GRADIENT = palettes.bichittos.gradient;

export function CharacterCard({
  name,
  image,
  gradient = DEFAULT_GRADIENT,
  cardSize = 120,
  noFloat = false,
  transparent = false,
  noBorder = false,
  noHoverScale = false,
  cardBg,
  labelColor,
  isSelected = false,
  'data-testid': testId,
}: CharacterCardProps) {
  const wrapperWidth = cardSize + 20;

  // Build a variant marker for tests / styling hooks.
  const variants = [
    transparent && 'transparent',
    noBorder && 'no-border',
    noFloat && 'no-float',
    noHoverScale && 'no-hover-scale',
  ]
    .filter(Boolean)
    .join(' ');

  const showGlow = !transparent && !noBorder;

  // Image wrap props — use literal pixel values directly (no CSS vars)
  // Mobile scales to 0.8x per Astro media query (<=768px)
  const sizePx = `${cardSize}px`;
  const sizePxMobile = `${Math.round(cardSize * 0.8)}px`;
  const wrapperWidthPx = `${wrapperWidth}px`;
  const wrapperWidthPxMobile = `${Math.round(wrapperWidth * 0.8)}px`;
  const bgColor = cardBg || 'white';

  // Determine variant-specific values
  const variantStyles = noBorder
    ? {
        height: 'auto',
        background: 'transparent',
        boxShadow: 'none',
        outline: 'none',
        outlineColor: undefined,
        borderRadius: '8px',
        aspectRatio: '16 / 9',
        transformOrigin: 'top center',
      }
    : transparent
      ? {
          height: sizePx,
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(8px)',
          outline: '2px solid',
          outlineColor: labelColor || 'outlineMid',
          outlineOffset: '3px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: '16px',
          aspectRatio: undefined,
          transformOrigin: undefined,
        }
      : {
          height: sizePx,
          background: bgColor,
          boxShadow: 'cardHover',
          outline: '2px solid',
          outlineColor: 'outlineStrong',
          borderRadius: '16px',
          aspectRatio: undefined,
          transformOrigin: undefined,
        };

  // Hover state
  const hoverStyles = noHoverScale
    ? undefined
    : noBorder
      ? {
          transform: 'scale(1.5)',
          zIndex: 30,
          borderRadius: '12px',
          boxShadow: 'cardHoverBig',
        }
      : transparent
        ? {
            transform: 'scale(1.2)',
            zIndex: 30,
          }
        : { transform: 'scale(1.3)' };

  // Selected state: same visuals as hover but applied unconditionally so
  // the card stays "big" while the info panel is open.
  const selectedBoxStyles = isSelected ? hoverStyles : undefined;

  const nameProps: Record<string, unknown> = {
    textStyle: 'label',
    color: labelColor ?? 'white',
    zIndex: 1,
    textShadow: 'labelText',
    textAlign: 'center',
    transition: 'transform 0.25s ease, opacity 0.25s ease',
    margin: 0,
  };

  if (!noHoverScale) {
    nameProps._groupHover = {
      transform: noBorder ? 'translateY(6rem)' : 'translateY(2rem)',
      zIndex: noBorder ? 40 : 1,
    };
    // Mirror the hover transform when locked as selected.
    if (isSelected) {
      nameProps.transform = noBorder ? 'translateY(6rem)' : 'translateY(2rem)';
      nameProps.zIndex = noBorder ? 40 : 1;
    }
  }

  return (
    <Box
      // Chakra v3 `_groupHover` selector requires the literal `group` class on
      // the parent (not `role="group"`). See preset-base.js groupHover:
      // ".group:is(:hover, [data-hover]) &"
      className="group"
      role="group"
      data-testid={testId}
      data-variant={variants || undefined}
      data-selected={isSelected || undefined}
      flexShrink={0}
      width={{ base: wrapperWidthPxMobile, md: wrapperWidthPx }}
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap="0.5rem"
      position="relative"
      animation={isSelected || noFloat ? undefined : 'cardFloat 3s ease-in-out infinite'}
      zIndex={isSelected ? 20 : undefined}
      _hover={{ zIndex: 10 }}
    >
      {showGlow && (
        <Box
          aria-hidden
          position="absolute"
          top="5px"
          left="5px"
          right="5px"
          bottom="15px"
          borderRadius="16px"
          filter="blur(20px)"
          opacity={0.6}
          zIndex={0}
          background={gradient}
        />
      )}
      <Box
        width={{ base: sizePxMobile, md: sizePx }}
        height={
          variantStyles.height === 'auto'
            ? 'auto'
            : { base: sizePxMobile, md: sizePx }
        }
        borderRadius={
          noBorder
            ? variantStyles.borderRadius
            : { base: '12px', md: variantStyles.borderRadius }
        }
        overflow="hidden"
        background={variantStyles.background}
        position="relative"
        zIndex={1}
        transition="transform 0.25s ease"
        boxShadow={variantStyles.boxShadow}
        outline={variantStyles.outline}
        outlineColor={variantStyles.outlineColor}
        outlineOffset="3px"
        aspectRatio={variantStyles.aspectRatio}
        transformOrigin={variantStyles.transformOrigin}
        _groupHover={hoverStyles}
        {...(selectedBoxStyles ?? {})}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={name}
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            padding: noBorder ? '0' : '8px',
            objectFit: noBorder ? 'cover' : 'contain',
          }}
        />
      </Box>
      <Text as="h4" {...nameProps}>
        {name}
      </Text>
    </Box>
  );
}
