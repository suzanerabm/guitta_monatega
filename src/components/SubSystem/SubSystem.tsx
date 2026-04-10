import { Box, Flex, Heading } from '@chakra-ui/react';
import type { CSSProperties } from 'react';

export interface SubSystemCard {
  title: string;
  image?: string;
  imageAlt?: string;
  texts: string[];
}

interface SubSystemProps {
  cards: SubSystemCard[];
  titleColor?: string;
  subtitleColor?: string;
  textColor?: string;
  gradient?: string;
  sectionTitle?: string;
  'data-testid'?: string;
}

export function SubSystem({
  cards,
  titleColor = 'textOverlayBright',
  subtitleColor,
  textColor = 'textOverlay',
  gradient,
  sectionTitle,
  'data-testid': testId,
}: SubSystemProps) {
  return (
    <Box data-testid={testId}>
      {sectionTitle && (
        <Heading
          as="h2"
          fontFamily="body"
          fontSize="section"
          letterSpacing="wider"
          textTransform="uppercase"
          fontWeight="semibold"
          padding="0 2rem"
          margin="5em 0 0.5rem"
          color={titleColor}
        >
          {sectionTitle}
        </Heading>
      )}
      <Flex
        flexWrap="wrap"
        justifyContent="center"
        gap="1.5rem"
        padding={{ base: '1rem 1.5rem', md: '0.5rem 2rem 2rem' }}
        width={{ base: '100%', md: '100vw' }}
        marginLeft={{ base: 0, md: 'calc(-50vw + 50%)' }}
        marginBottom="5rem"
      >
        {cards.map((card, idx) => {
          const cssVars = (gradient ? { '--sub-bg': gradient } : {}) as CSSProperties;
          return (
            <Box
              key={`${card.title}-${idx}`}
              data-testid={`subsystem-card-${idx}`}
              style={cssVars}
              flex={{ base: 'none', md: '1 1 calc(33.333% - 1rem)' }}
              minW={{ base: 0, md: '280px' }}
              width={{ base: '100%', md: 'auto' }}
              borderRadius="16px"
              outline="2px solid"
              outlineColor="darkBorder"
              outlineOffset="3px"
              overflow="hidden"
              display="flex"
              flexDirection="column"
              position="relative"
              css={{
                // Mobile: content-driven height
                height: 'auto',
                // Default desktop (>=769px) — 400px
                '@media (min-width: 48em)': {
                  height: '500px',
                },
                // 1900px+ — 550px
                '@media (min-width: 118.75em)': {
                  height: '550px',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  background: 'var(--sub-bg)',
                  opacity: 0.2,
                  zIndex: 0,
                  borderRadius: '16px',
                },
              }}
            >
              <Heading
                as="h6"
                position="relative"
                zIndex={1}
                fontSize="label"
                letterSpacing="wider"
                textTransform="uppercase"
                padding="1.2rem 1.5rem 0.8rem"
                fontWeight="semibold"
                color={subtitleColor || titleColor}
              >
                {card.title}
              </Heading>
              <Flex
                position="relative"
                zIndex={1}
                flexDirection="column"
                flex={1}
                minH={0}
                overflow="hidden"
                css={{
                  // 1900px+ — image goes side-by-side with text
                  '@media (min-width: 118.75em)': {
                    flexDirection: 'row',
                  },
                }}
              >
                {card.image && (
                  <Box
                    flex="none"
                    overflow="hidden"
                    css={{
                      height: '200px',
                      '@media (min-width: 118.75em)': {
                        flex: '0 0 45%',
                        height: 'auto',
                      },
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      data-testid={`subsystem-card-${idx}-image`}
                      src={card.image}
                      alt={card.imageAlt || card.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </Box>
                )}
                <Box
                  flex={1}
                  padding="1rem 1.5rem 1.5rem"
                  fontFamily="body"
                  fontSize="base"
                  lineHeight={1.6}
                  fontWeight="light"
                  overflowY="auto"
                  color={textColor}
                  css={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    maskImage:
                      'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
                    WebkitMaskImage:
                      'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
                    '&::-webkit-scrollbar': { display: 'none' },
                    '& p': { marginBottom: '0.6rem' },
                  }}
                >
                  {card.texts.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </Box>
              </Flex>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
}
