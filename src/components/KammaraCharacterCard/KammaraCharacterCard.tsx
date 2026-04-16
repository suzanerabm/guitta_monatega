'use client';
import { Box, Flex, Heading, Image, Text } from '@chakra-ui/react';
import { useState } from 'react';

// Shared with the rest of the Kammara card family — keep in sync.
export const CARD_PADDING_X = '1.8rem';

export interface KammaraCharacterAttribute {
  /** Semantic Kalún glyph for this attribute. */
  glyph: string;
  /** Short uppercase label (e.g. "Protocolo", "Alinhamento"). */
  label: string;
  /** The value shown on the right (e.g. "AURYN", "Neutro"). */
  value: string;
}

export interface KammaraCharacterCardProps {
  /** Character's full name. */
  name: string;
  /** Species / race (e.g. "Shal'ún", "Bunniets", "ElePHPants"). */
  species: string;
  /** Short bio — 2-3 sentences that fit the card. */
  bio: string;
  /** Transparent PNG of the character. Displayed centered over the body. */
  image: string;
  /** Alt for the image. */
  imageAlt?: string;
  /** Name of the world this character belongs to (e.g. "LUNN'P1", "TripleC"). */
  worldName: string;
  /** Kalún crest glyph of the character's home world. Shown as watermark + badge. */
  worldCrestGlyph: string;
  /** Accent color of the world (usually palette.colors[0]). */
  color: string;
  /** Dark base color of the world (palette.dark). */
  darkColor: string;
  /** Mid-tone color for the gradient (falls back to darkColor). */
  midColor?: string;
  /**
   * Optional attributes — think "character stats" for a future game.
   * Today it's a simple list of (glyph, label, value) rows; tomorrow this
   * can grow into proper RPG stats (HP, ATK, abilities…) without changing
   * the card's layout.
   */
  attributes?: KammaraCharacterAttribute[];
  /**
   * Transparent PNG showing the character's back — where the dorsal
   * glyph is visible in the artwork itself. Providing this alone turns
   * the card into a flippable card.
   *
   * The dorsal glyph is a personal brasão unique to each character
   * (NOT part of the Kalún semantic alphabet) — it lives in the image,
   * not as a text string. Use `dorsalMeaning` to narrate what it means.
   */
  backImage?: string;
  /** Narrative explanation of what the dorsal glyph means for this character. */
  dorsalMeaning?: string;
  'data-testid'?: string;
}

/**
 * KammaraCharacterCard — portrait-format card for a Kammara character.
 *
 * Layout:
 *   ┌─────────────────────────┐
 *   │ [worldCrest]  [WORLD]   │  ← top badge: world identity
 *   │  ─────────────────────  │
 *   │   [character image]     │  ← centered portrait, watermark behind
 *   │                         │
 *   │ ESPÉCIE · Shal'ún       │  ← species tag
 *   │ NOME DO PERSONAGEM      │  ← hero name
 *   │ ─────                   │
 *   │ Breve bio em 2-3 linhas │  ← short description
 *   │  ─────────────────────  │
 *   │ ⊹ ⊙ ⊹  KAMMARA · WORLD  │  ← footer
 *   └─────────────────────────┘
 *
 * Visually consistent with KammaraCard / KammaraCardSubsystem / KammaraCardRegion:
 * same gradient background, outline, boxShadow, crest watermark behind.
 * Difference: portrait aspect, centered character image, no tabs / roulette.
 */
export function KammaraCharacterCard({
  name,
  species,
  bio,
  image,
  imageAlt,
  worldName,
  worldCrestGlyph,
  color,
  darkColor,
  midColor,
  attributes,
  backImage,
  dorsalMeaning,
  'data-testid': testId,
}: KammaraCharacterCardProps) {
  const body = midColor ?? darkColor;
  // A card becomes flippable as soon as we have the back image. The dorsal
  // glyph + meaning are optional: characters without a known dorsal glyph
  // still get a back face (just their silhouette + a placeholder note).
  const isFlippable = Boolean(backImage);
  const [isFlipped, setIsFlipped] = useState(false);
  const handleFlip = () => {
    if (isFlippable) setIsFlipped((v) => !v);
  };

  // Species is always the first attribute row — keeps the visual pattern
  // consistent with Protocolo, Afinidade, etc.
  const allAttributes: KammaraCharacterAttribute[] = [
    { glyph: '⊙•⊙', label: 'Espécie', value: species },
    ...(attributes ?? []),
  ];

  return (
    <Box
      data-testid={testId ?? 'kammara-character-card'}
      aria-label={name}
      position="relative"
      width="100%"
      height="100%"
      borderRadius="32px"
      overflow="visible"
      onClick={handleFlip}
      cursor={isFlippable ? 'pointer' : 'default'}
      css={{
        // Enable 3D flip animation across the inner face wrapper
        perspective: '1800px',
      }}
    >
      {/* Inner 3D scene — rotates to reveal the back face */}
      <Box
        position="relative"
        width="100%"
        height="100%"
        css={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
      {/* Card body — same gradient/outline family as KammaraCard */}
      <Box
        position="absolute"
        inset={0}
        borderRadius="32px"
        overflow="hidden"
        css={{
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          background: `linear-gradient(160deg, ${darkColor}b3 0%, ${body}b3 45%, ${darkColor}b3 100%)`,
          border: `1px solid ${color}40`,
          outline: `2px solid ${color}`,
          outlineOffset: '6px',
          boxShadow: `0 20px 60px ${color}50, 0 4px 16px ${color}30, inset 0 1px 0 rgba(255,255,255,0.15)`,
        }}
      >
        {/* World crest watermark — giant, faint, centered behind everything */}
        <Box position="absolute" inset={0} pointerEvents="none" overflow="hidden" aria-hidden="true">
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            css={{
              fontFamily: 'var(--chakra-fonts-glyph)',
              fontSize: '22rem',
              lineHeight: 1,
              color: `${color}08`,
              userSelect: 'none',
              whiteSpace: 'nowrap',
              letterSpacing: '0.04em',
            }}
          >
            {worldCrestGlyph}
          </Box>
        </Box>

        {/* Color halo from top */}
        <Box
          position="absolute"
          inset={0}
          pointerEvents="none"
          aria-hidden="true"
          css={{
            background: `radial-gradient(ellipse 70% 45% at 50% 0%, ${color}35, transparent 70%)`,
          }}
        />

        <Flex position="relative" direction="column" width="100%" height="100%">
          {/* ── Top badge: world identity ─────────────── */}
          <Flex
            align="center"
            justify="space-between"
            gap="sm"
            padding={`0.9rem ${CARD_PADDING_X} 0.6rem`}
            flexShrink={0}
          >
            <Box
              as="span"
              fontFamily="glyph"
              fontSize="glyphH3"
              lineHeight={1}
              color={color}
              opacity={0.85}
              css={{ whiteSpace: 'nowrap', letterSpacing: '0.04em' }}
              aria-hidden="true"
            >
              {worldCrestGlyph}
            </Box>
            <Text
              fontSize="xs"
              letterSpacing="hero"
              textTransform="uppercase"
              fontWeight="bold"
              color={color}
              m={0}
              opacity={0.9}
            >
              {worldName}
            </Text>
          </Flex>

          {/* Separator */}
          <Box
            height="1px"
            mx={CARD_PADDING_X}
            flexShrink={0}
            css={{
              background: `linear-gradient(90deg, transparent, ${color}80, transparent)`,
            }}
          />

          {/* ── Character portrait area ───────────────── */}
          <Flex
            flex="1 1 auto"
            align="center"
            justify="center"
            minH={0}
            padding={`${CARD_PADDING_X} ${CARD_PADDING_X} 0`}
            position="relative"
          >
            <Image
              src={image}
              alt={imageAlt ?? name}
              maxWidth="100%"
              maxHeight="100%"
              objectFit="contain"
              css={{
                filter: `drop-shadow(0 12px 24px ${color}40) drop-shadow(0 4px 8px rgba(0,0,0,0.4))`,
              }}
            />
          </Flex>

          {/* ── Identity: name + divider + bio + attributes ─── */}
          <Flex
            direction="column"
            gap="2xs"
            padding={`1rem ${CARD_PADDING_X} 0.8rem`}
            flexShrink={0}
          >
            {/* Character name — hero scale */}
            <Heading
              as="h2"
              fontFamily="body"
              fontSize={name.length > 16 ? { base: '1.4rem', md: '1.7rem' } : { base: '1.8rem', md: '2.2rem' }}
              fontWeight="bold"
              lineHeight={1}
              color={color}
              letterSpacing="heroTitle"
              textAlign="left"
              m={0}
              css={{
                textShadow: `0 0 24px ${color}40`,
                textWrap: 'balance',
                wordBreak: 'break-word',
              }}
            >
              {name}
            </Heading>

            {/* Gradient divider */}
            <Box
              height="1px"
              width="60px"
              mt="2xs"
              mb="2xs"
              css={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
            />

            {/* Bio */}
            <Text
              fontSize="sm"
              fontWeight="light"
              color="textOverlayBright"
              lineHeight={1.5}
              m={0}
            >
              {bio}
            </Text>

            {/* ── Attributes section ─────────────────────
                Seed for future game stats. Today: glyph + label + value rows.
                Tomorrow: can hold HP, abilities, keywords, etc.
                Always includes at least the species row. */}
            {allAttributes.length > 0 && (
              <Flex
                direction="column"
                gap="2xs"
                mt="sm"
                paddingTop="sm"
                css={{
                  borderTop: `1px solid ${color}30`,
                }}
              >
                {allAttributes.map((attr, i) => (
                  <Flex key={i} align="center" gap="sm">
                    {/* Label + glyph grouped on the left */}
                    <Flex align="center" gap="xs" flex="1 1 auto" minW={0}>
                      <Text
                        fontSize="xs"
                        letterSpacing="hero"
                        textTransform="uppercase"
                        fontWeight="semibold"
                        color={color}
                        m={0}
                        opacity={0.8}
                      >
                        {attr.label}
                      </Text>
                      <Box
                        as="span"
                        fontFamily="glyph"
                        fontSize="sm"
                        lineHeight={1}
                        color={color}
                        css={{ whiteSpace: 'nowrap', letterSpacing: '0.04em' }}
                        aria-hidden="true"
                      >
                        {attr.glyph}
                      </Box>
                    </Flex>
                    {/* Value on the right */}
                    <Text
                      fontSize="xs"
                      letterSpacing="hero"
                      textTransform="uppercase"
                      fontWeight="bold"
                      color="textOverlayBright"
                      m={0}
                    >
                      {attr.value}
                    </Text>
                  </Flex>
                ))}
              </Flex>
            )}
          </Flex>

          {/* Footer */}
          <Flex
            flexShrink={0}
            justify="space-between"
            align="center"
            padding="0.4rem 1.5rem"
            css={{
              borderTop: `1px solid ${color}25`,
              background: `linear-gradient(0deg, ${color}10, transparent)`,
              fontFamily: 'var(--chakra-fonts-glyph)',
              fontSize: '0.9rem',
              letterSpacing: '0.3em',
            }}
            color="bannerLabel"
          >
            <span aria-label="Kammara">⊹ ⊙ ⊹</span>
            <Text fontSize="xs" letterSpacing="hero" textTransform="uppercase" color="bannerLabel" m={0}>
              Kammara
            </Text>
          </Flex>

          {/* Flip affordance — tiny hint in the top-right corner that this
              card has a back face. Only appears when the card is flippable. */}
          {isFlippable && (
            <Box
              position="absolute"
              top="0.8rem"
              right="0.8rem"
              zIndex={10}
              fontFamily="glyph"
              fontSize="md"
              lineHeight={1}
              color={color}
              opacity={0.6}
              pointerEvents="none"
              aria-hidden="true"
            >
              ⟲
            </Box>
          )}
        </Flex>
      </Box>

      {/* ── Back face — dorsal glyph + meaning ────────── */}
      {isFlippable && (
        <Box
          position="absolute"
          inset={0}
          borderRadius="32px"
          overflow="hidden"
          css={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: `linear-gradient(160deg, ${darkColor}b3 0%, ${body}b3 45%, ${darkColor}b3 100%)`,
            border: `1px solid ${color}40`,
            outline: `2px solid ${color}`,
            outlineOffset: '6px',
            boxShadow: `0 20px 60px ${color}50, 0 4px 16px ${color}30, inset 0 1px 0 rgba(255,255,255,0.15)`,
          }}
        >
          {/* World crest watermark — keeps the back face consistent with
              the rest of the card family. The dorsal glyph lives in the
              artwork itself (backImage), not as a text glyph. */}
          <Box position="absolute" inset={0} pointerEvents="none" overflow="hidden" aria-hidden="true">
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              css={{
                fontFamily: 'var(--chakra-fonts-glyph)',
                fontSize: '22rem',
                lineHeight: 1,
                color: `${color}08`,
                userSelect: 'none',
                whiteSpace: 'nowrap',
                letterSpacing: '0.04em',
              }}
            >
              {worldCrestGlyph}
            </Box>
          </Box>

          {/* Color halo */}
          <Box
            position="absolute"
            inset={0}
            pointerEvents="none"
            aria-hidden="true"
            css={{
              background: `radial-gradient(ellipse 70% 45% at 50% 0%, ${color}35, transparent 70%)`,
            }}
          />

          <Flex position="relative" direction="column" width="100%" height="100%">
            {/* Top badge — mirrors the front */}
            <Flex
              align="center"
              justify="space-between"
              gap="sm"
              padding={`0.9rem ${CARD_PADDING_X} 0.6rem`}
              flexShrink={0}
            >
              <Text
                fontSize="xs"
                letterSpacing="hero"
                textTransform="uppercase"
                fontWeight="bold"
                color={color}
                m={0}
                opacity={0.9}
              >
                Glifo Dorsal
              </Text>
              <Text
                fontSize="xs"
                letterSpacing="hero"
                textTransform="uppercase"
                fontWeight="semibold"
                color="textOverlayBright"
                m={0}
                opacity={0.8}
              >
                {name}
              </Text>
            </Flex>

            {/* Separator */}
            <Box
              height="1px"
              mx={CARD_PADDING_X}
              flexShrink={0}
              css={{
                background: `linear-gradient(90deg, transparent, ${color}80, transparent)`,
              }}
            />

            {/* Back image (character's back / dorsal view) */}
            <Flex
              flex="1 1 auto"
              align="center"
              justify="center"
              minH={0}
              padding={`${CARD_PADDING_X} ${CARD_PADDING_X} 0`}
              position="relative"
            >
              <Image
                src={backImage}
                alt={`Costas de ${name}`}
                maxWidth="100%"
                maxHeight="100%"
                objectFit="contain"
                css={{
                  filter: `drop-shadow(0 12px 24px ${color}40) drop-shadow(0 4px 8px rgba(0,0,0,0.4))`,
                }}
              />
            </Flex>

            {/* Dorsal meaning — narrative only, no text glyph. The dorsal
                glyph itself is a unique personal brasão visible in the
                back artwork (not part of the Kalún semantic alphabet). */}
            <Flex
              direction="column"
              gap="xs"
              align="center"
              padding={`1rem ${CARD_PADDING_X} 0.8rem`}
              flexShrink={0}
            >
              <Box
                height="1px"
                width="60px"
                css={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
              />
              <Text
                fontSize="sm"
                fontWeight="light"
                color="textOverlayBright"
                lineHeight={1.5}
                textAlign="center"
                m={0}
              >
                {dorsalMeaning ?? 'Glifo dorsal ainda não revelado.'}
              </Text>
            </Flex>

            {/* Footer */}
            <Flex
              flexShrink={0}
              justify="space-between"
              align="center"
              padding="0.4rem 1.5rem"
              css={{
                borderTop: `1px solid ${color}25`,
                background: `linear-gradient(0deg, ${color}10, transparent)`,
                fontFamily: 'var(--chakra-fonts-glyph)',
                fontSize: '0.9rem',
                letterSpacing: '0.3em',
              }}
              color="bannerLabel"
            >
              <span aria-label="Kammara">⊹ ⊙ ⊹</span>
              <Text fontSize="xs" letterSpacing="hero" textTransform="uppercase" color="bannerLabel" m={0}>
                Kammara
              </Text>
            </Flex>
          </Flex>

          {/* Flip-back affordance */}
          <Box
            position="absolute"
            top="0.8rem"
            right="0.8rem"
            zIndex={10}
            fontFamily="glyph"
            fontSize="md"
            lineHeight={1}
            color={color}
            opacity={0.6}
            pointerEvents="none"
            aria-hidden="true"
          >
            ⟳
          </Box>
        </Box>
      )}
      </Box>
    </Box>
  );
}
