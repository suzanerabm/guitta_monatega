import { Box, Flex, Text, Heading } from '@chakra-ui/react';

type HeroVariant = 'page' | 'home';

interface HeroSectionProps {
  label: string;
  title: string;
  description?: string;
  /**
   * Optional secondary label rendered *below* the title with the same
   * typography as the top label. Used on the Art page ("- since 1974 -").
   */
  labelBottom?: string;
  /**
   * Optional token override for the title font size. Defaults to `h1`.
   * Use one of the tokens defined in `theme/tokens.ts` (e.g. `heroArt`).
   */
  titleSize?: string;
  background?: string;
  /** Optional cover/background image painted over the `background` color. */
  backgroundImage?: string;
  textColor?: string;
  labelColor?: string;
  minHeight?: string;
  children?: React.ReactNode;
  /**
   * Visual variant.
   * - `page` (default): label on top, uppercase bold title, full-bleed background, fadeIn staggered.
   * - `home`: no background, lowercase thin title above the label. The first word of the title
   *   is emphasized with semibold weight (matches the landing hero "guitta monatega").
   */
  variant?: HeroVariant;
}

export function HeroSection({
  label,
  title,
  description,
  labelBottom,
  titleSize,
  background,
  backgroundImage,
  textColor,
  labelColor,
  minHeight,
  children,
  variant = 'page',
}: HeroSectionProps) {
  if (variant === 'home') {
    // First word is emphasized (e.g. "guitta" in "guitta monatega").
    const [firstWord, ...rest] = title.split(' ');
    const remainder = rest.join(' ');

    return (
      <Flex
        as="section"
        direction="column"
        align="center"
        justify="center"
        minHeight={minHeight ?? '28vh'}
        gap={{ base: 'sm', md: 'base', lg: '1.5rem' }}
        pt={{ base: '4xl', md: '4xl', lg: '2xl' }}
        pb={{ base: 'xl', md: 'xl', lg: '2xl' }}
        textAlign="center"
      >
        <Heading
          as="h1"
          fontFamily="heading"
          fontSize="heroHome"
          fontWeight="thin"
          letterSpacing="wide"
          textTransform="lowercase"
          color={textColor ?? 'ink'}
          lineHeight={1}
          animation="fadeIn 1.2s ease 0.2s both"
        >
          <Box as="strong" fontWeight="semibold">
            {firstWord}
          </Box>
          {remainder ? ` ${remainder}` : null}
        </Heading>
        <Text
          as="span"
          display="block"
          fontSize="heroHomeLabel"
          letterSpacing="wider"
          textTransform="uppercase"
          color={labelColor ?? 'inkMuted'}
          animation="fadeIn 1s ease 0.6s both"
        >
          {label}
        </Text>
        {description && (
          <Text
            as="p"
            color={textColor ?? 'ink'}
            opacity={0.75}
            fontSize={{ base: 'sm', md: 'base', lg: 'md' }}
            fontWeight="light"
            lineHeight={1.5}
            maxW="450px"
            animation="fadeIn 1s ease 0.8s both"
          >
            {description}
          </Text>
        )}
        {children}
      </Flex>
    );
  }

  return (
    <Flex
      as="section"
      direction="column"
      align="center"
      justify="center"
      gap="0"
      bg={background}
      // Cover image is a dynamic, per-page value (the book cover), so it's set
      // inline rather than via a token — painted over the `bg` color.
      style={
        backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }
          : undefined
      }
      minH={minHeight ?? '15vh'}
      pt="5xl"
      pb={{ base: 'xl', md: '4xl' }}
      px={{ base: 'lg', md: '3xl' }}
      position="relative"
      overflow="hidden"
    >
      {children}
      <Text
        as="span"
        color={labelColor ?? 'heroDefaultLabel'}
        fontSize="heroLabel"
        fontWeight="regular"
        letterSpacing="hero"
        textTransform="uppercase"
        zIndex={1}
        opacity={0}
        animation="fadeIn 0.8s ease 0.1s forwards"
        mb="0"
      >
        {label}
      </Text>
      <Heading
        as="h1"
        textStyle="heading"
        color={textColor ?? 'heroDefaultText'}
        fontSize={titleSize ?? 'h1'}
        letterSpacing="heroTitle"
        textTransform="uppercase"
        textAlign="center"
        lineHeight={1.05}
        zIndex={1}
        opacity={0}
        animation="fadeIn 1s ease 0.2s forwards"
      >
        {title}
      </Heading>
      {labelBottom && (
        <Text
          as="span"
          color={labelColor ?? 'heroDefaultLabel'}
          fontSize="heroLabel"
          fontWeight="regular"
          letterSpacing="hero"
          textTransform="uppercase"
          zIndex={1}
          opacity={0}
          animation="fadeIn 0.8s ease 0.3s forwards"
          mt="0"
        >
          {labelBottom}
        </Text>
      )}
      {description && (
        <Text
          as="p"
          color={textColor ?? 'heroDefaultText'}
          opacity={0.75}
          fontSize={{ base: 'sm', md: 'md' }}
          fontWeight="light"
          lineHeight={1.5}
          textAlign="center"
          maxW="450px"
          zIndex={1}
          animation="fadeIn 1s ease 0.4s forwards"
          mt="0"
        >
          {description}
        </Text>
      )}
    </Flex>
  );
}
