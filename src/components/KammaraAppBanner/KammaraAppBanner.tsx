import Image from 'next/image';
import { Apple, Bot } from 'lucide-react';
import { Box, Flex, Heading, Text, chakra } from '@chakra-ui/react';

function renderInlineEmphasis(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={index}>{part.slice(2, -2)}</strong>
    ) : (
      part
    ),
  );
}

export interface KammaraAppBannerStore {
  id: 'apple' | 'android';
  label: string;
  url: string;
}

export interface KammaraAppBannerProps {
  worldName: string;
  eyebrow: string;
  title: string;
  description: string[];
  image: string;
  iconImage?: string;
  crestGlyph: string;
  color: string;
  darkColor: string;
  stores: KammaraAppBannerStore[];
  'data-testid'?: string;
}

/** Variant C fiel, sem a roleta, adaptado somente para o convite do app. */
export function KammaraAppBanner({
  worldName,
  eyebrow,
  title,
  description,
  image,
  iconImage,
  crestGlyph,
  color,
  darkColor,
  stores,
  'data-testid': testId,
}: KammaraAppBannerProps) {
  const textColor = 'var(--chakra-colors-text-overlay-bright)';
  const mutedText = 'var(--chakra-colors-banner-label)';
  const backgroundSrc = image.trim();
  const iconSrc = iconImage?.trim() || null;

  return (
    <Box
      data-testid={testId ?? 'kammara-app-banner'}
      aria-label={title}
      position="relative"
      width="100%"
      marginBottom="10px"
      borderRadius="32px"
      overflow="visible"
    >
      <Box
        position="relative"
        width="100%"
        height={{ base: 'auto', lg: '380px', xl: '420px' }}
        borderRadius="32px"
        overflow="hidden"
        css={{
          border: `1px solid ${color}40`,
          outline: `2px solid ${color}`,
          outlineOffset: '6px',
          boxShadow: `0 20px 60px ${color}50, 0 4px 16px ${color}30, inset 0 1px 0 rgba(255,255,255,0.15)`,
        }}
      >
        {backgroundSrc && (
          <Image src={backgroundSrc} alt="" fill sizes="(max-width: 767px) 100vw, 94vw" style={{ objectFit: 'cover', display: 'block' }} />
        )}

        <Box position="absolute" inset={0} aria-hidden="true" css={{ background: `linear-gradient(90deg, ${darkColor}e8 0%, ${darkColor}c2 28%, ${darkColor}80 48%, ${darkColor}35 58%, ${darkColor}12 70%, ${darkColor}05 100%)` }} />
        <Box position="absolute" inset={0} aria-hidden="true" css={{ background: `linear-gradient(180deg, ${darkColor}4d 0%, transparent 46%, ${darkColor}66 100%)` }} />

        <Box
          position="absolute"
          top="1rem"
          left="-2rem"
          aria-hidden="true"
          pointerEvents="none"
          css={{ fontFamily: 'var(--chakra-fonts-glyph)', fontSize: '12rem', lineHeight: 1, color: `${color}14`, userSelect: 'none' }}
        >
          {crestGlyph}
        </Box>

        <Flex
          position={{ base: 'relative', lg: 'absolute' }}
          top={{ lg: '2.5rem' }}
          left={{ lg: '2.8rem' }}
          direction="column"
          align="flex-start"
          gap="xs"
          maxW={{ base: '100%', lg: '48%' }}
          padding={{ base: '1.5rem 1rem 0', md: '2rem 2rem 0', lg: 0 }}
          zIndex={3}
        >
          <Flex align="center" gap="lg">
            {iconSrc && (
              <Box
                position="relative"
                flexShrink={0}
                width={{ base: '56px', md: '68px' }}
                height={{ base: '56px', md: '68px' }}
                borderRadius="20px"
                overflow="hidden"
                css={{ boxShadow: `0 0 24px ${color}60` }}
              >
                <Image src={iconSrc} alt="" fill sizes="68px" />
              </Box>
            )}
            <Box>
              <Text textStyle="heading" fontSize="xs" letterSpacing="hero" textTransform="uppercase" color={color} m={0} opacity={0.9} css={{ textShadow: `0 2px 8px ${color}` }}>
                {eyebrow.toUpperCase()}
              </Text>
              <Heading
                as="h2"
                textStyle="heading"
                fontSize={{ base: '2xl', md: '3xl', xl: '2.6rem' }}
                lineHeight={1}
                color={color}
                letterSpacing="heroTitle"
                m={0}
                css={{ textShadow: `0 0 28px ${color}, 0 0 12px ${color}40`, textWrap: 'balance', wordBreak: 'break-word' }}
              >
                {title.toUpperCase()}
              </Heading>
              <Text textStyle="label" color={color} m={0} opacity={0.95} css={{ textShadow: `0 2px 8px ${color}` }}>
                {worldName}
              </Text>
            </Box>
          </Flex>
          <Flex
            align="center"
            gap="sm"
            width="200px"
            mt="xs"
            aria-label="Aplicativo Kammara"
            pointerEvents="none"
            css={{ fontFamily: 'var(--chakra-fonts-glyph)', fontSize: '1rem', color: `${color}cc`, letterSpacing: '0.3em', textShadow: `0 0 12px ${color}` }}
          >
            <Box flex={1} height="1px" css={{ background: `linear-gradient(90deg, ${color}80, transparent)` }} />
            <span style={{ fontSize: '1.3rem' }}>⊙</span>
            <Box flex={1} height="1px" css={{ background: `linear-gradient(90deg, transparent, ${color}80)` }} />
          </Flex>
        </Flex>

        <Flex
          position={{ base: 'relative', lg: 'absolute' }}
          top={{ lg: '50%' }}
          right={{ lg: '2rem' }}
          transform={{ lg: 'translateY(-50%)' }}
          width={{ base: 'auto', lg: '60%' }}
          maxW="710px"
          margin={{ base: '1.5rem 1rem', md: '2rem', lg: 0 }}
          direction="column"
          justify="center"
          gap="md"
          padding={{ base: 'md', md: '1rem 1.2rem' }}
          borderRadius="20px"
          zIndex={3}
          css={{ background: `linear-gradient(160deg, ${darkColor}cc 0%, ${darkColor}99 60%, ${darkColor}cc 100%)`, border: `1px solid ${color}50`, boxShadow: `0 10px 32px rgba(0,0,0,0.6), 0 0 28px ${color}25, inset 0 1px 0 rgba(255,255,255,0.08)`, backdropFilter: 'blur(10px)' }}
        >
          <Box
            css={{
              fontFamily: 'var(--chakra-fonts-body)',
              fontSize: '0.88rem',
              lineHeight: 1.65,
              fontWeight: 300,
              color: textColor,
              '& h3': {
                fontFamily: 'var(--chakra-fonts-heading)',
                fontSize: '0.62rem',
                fontWeight: 600,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color,
                marginTop: '1.1rem',
                marginBottom: '0.3rem',
              },
              '& h3:first-of-type': { marginTop: 0 },
              '& p': { marginBottom: '0.7rem' },
            }}
          >
            {description.map((paragraph, index) => {
              const emphasized = paragraph.match(/^\*\*(.+)\*\*$/);
              return emphasized ? (
                <h3 key={index}>{emphasized[1]}</h3>
              ) : (
                <p key={index}>{renderInlineEmphasis(paragraph)}</p>
              );
            })}
          </Box>

          <Flex gap="lg" flexWrap="wrap">
            {stores.map((store) => {
              const StoreIcon = store.id === 'apple' ? Apple : Bot;
              const content = (
                <>
                  <StoreIcon size={16} aria-hidden="true" />
                  <span>{store.label}</span>
                </>
              );
              const css = { border: `1px solid ${color}80`, outline: `1px solid ${color}40`, outlineOffset: '3px', background: `${color}15`, textDecoration: 'none' };
              const props = {
                display: 'inline-flex',
                width: { base: '100%', sm: '180px' },
                height: '48px',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'md',
                paddingX: 'lg',
                borderRadius: '20px',
                color,
                fontSize: 'xs',
                fontWeight: 'semibold',
                letterSpacing: 'normal',
                textTransform: 'uppercase' as const,
              };
              return store.url ? (
                <chakra.a key={store.id} href={store.url} target="_blank" rel="noopener noreferrer" aria-label={`${store.label} — ${worldName}`} {...props} css={css}>{content}</chakra.a>
              ) : (
                <chakra.span key={store.id} aria-label={`${store.label} — em breve`} aria-disabled="true" opacity={0.6} {...props} css={css}>{content}</chakra.span>
              );
            })}
          </Flex>
        </Flex>

        <Flex
          position={{ base: 'relative', lg: 'absolute' }}
          left={0}
          right={0}
          bottom={0}
          justify="space-between"
          align="center"
          padding="0.4rem 1.5rem"
          css={{ borderTop: `1px solid ${color}40`, background: `linear-gradient(0deg, ${darkColor}dd, ${darkColor}66)`, fontFamily: 'var(--chakra-fonts-glyph)', fontSize: '0.9rem', letterSpacing: '0.3em' }}
          color={mutedText}
        >
          <span aria-label="Kammara">⊹ ⊙ ⊹</span>
          <Text fontSize="xs" letterSpacing="hero" textTransform="uppercase" color={mutedText} m={0}>Kammara</Text>
        </Flex>
      </Box>
    </Box>
  );
}
