import { Box } from '@chakra-ui/react';
import type { ReactNode, CSSProperties } from 'react';

interface DSTextPanelProps {
  titleColor?: string;
  subtitleColor?: string;
  textColor?: string;
  children: ReactNode;
  /**
   * When true, the panel fills its parent's height even on mobile.
   * Used by DSMainCard `stripSide` variant where the wrapper has a fixed
   * 350px mobile height and the panel needs to expand inside it.
   */
  fillParent?: boolean;
  /**
   * Kammara variant: dark translucent background + backdrop blur, larger
   * h2 (2rem) and body font (1rem). Matches Astro's
   * `.ds-card-strip-side .ds-text-panel/.ds-text-scroll` overrides.
   */
  kammaraStyle?: boolean;
  'data-testid'?: string;
}

export function DSTextPanel({
  titleColor = 'var(--chakra-colors-textOverlayBright)',
  subtitleColor,
  textColor = 'var(--chakra-colors-textOverlay)',
  children,
  fillParent = false,
  kammaraStyle = false,
  'data-testid': testId,
}: DSTextPanelProps) {
  const cssVars = {
    '--ds-title-color': titleColor,
    '--ds-subtitle-color': subtitleColor || titleColor,
    '--ds-text-color': textColor,
  } as CSSProperties;

  return (
    <Box
      data-testid={testId}
      className="ds-text-panel"
      width="100%"
      height="100%"
      borderRadius="16px"
      overflow="hidden"
      bg={kammaraStyle ? 'rgba(0,0,0,0.3)' : 'transparent'}
      backdropFilter={kammaraStyle ? 'blur(8px)' : undefined}
      outline="2px solid"
      outlineColor="outlineMid"
      outlineOffset="3px"
      boxShadow="dsPanel"
      css={{
        // Mobile: collapse to content-driven height (unless fillParent)
        '@media (max-width: 48em)': {
          height: fillParent ? '100%' : 'auto',
        },
      }}
    >
      <Box
        className="ds-text-scroll"
        style={cssVars}
        width="100%"
        height="100%"
        overflowY="auto"
        padding={{ base: '1.5rem 2rem', md: '2rem 1.5rem', '2xl': '2.5rem 2rem' }}
        fontFamily="body"
        fontSize={{ base: '0.8rem', md: kammaraStyle ? '1rem' : 'md', '2xl': 'lg' }}
        lineHeight={{ base: 1.5, md: kammaraStyle ? 1.65 : 1.7 }}
        fontWeight="light"
        css={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          // Desktop: top/bottom mask gradient. Mobile: no mask (visible scroll)
          '@media (min-width: 48em)': {
            maskImage:
              'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
          },
          '&::-webkit-scrollbar': { display: 'none' },
          '& h2': {
            fontSize: kammaraStyle ? '2rem' : '1.3rem',
            fontWeight: 700,
            marginBottom: '0.8rem',
            color: 'var(--ds-title-color)',
          },
          '& h3': {
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginTop: '1.2rem',
            marginBottom: '0.3rem',
            color: 'var(--ds-subtitle-color)',
          },
          '& p': {
            marginBottom: '0.8rem',
            color: 'var(--ds-text-color)',
          },
          // Mobile (<= 768px) overrides
          '@media (max-width: 48em)': {
            height: fillParent ? '100%' : 'auto',
            overflowY: fillParent ? 'auto' : 'visible',
            ...(fillParent
              ? {
                  maskImage:
                    'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
                  WebkitMaskImage:
                    'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
                }
              : {}),
            '& h2': { fontSize: '1rem', marginBottom: '0.5rem' },
            '& h3': { fontSize: '0.65rem', marginBottom: '0.3rem' },
            '& p': { marginBottom: '0.5rem' },
          },
          // XL screens (>= 1920px)
          '@media (min-width: 120em)': {
            '& h2': { fontSize: 'clamp(2rem, 4vw, 3rem)' },
            '& h3': { fontSize: '1.3rem' },
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
