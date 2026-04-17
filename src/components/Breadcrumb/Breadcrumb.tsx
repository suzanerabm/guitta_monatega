'use client';
import { Box, Flex, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useState, useEffect } from 'react';
import { useChromeTint } from '@/components/ChromeTint';
import { useScrollHeader } from '@/hooks/useScrollHeader';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  homePath?: string;
  backLabel?: string;
  useGlyphs?: boolean;
}

export function Breadcrumb({
  items,
  homePath = '/',
  backLabel = 'voltar',
  useGlyphs = false,
}: BreadcrumbProps) {
  const [headerHeight, setHeaderHeight] = useState(60);
  const { tintColor } = useChromeTint();
  const { isHidden } = useScrollHeader(80);

  // Measure header height dynamically so the breadcrumb sits flush below it
  useEffect(() => {
    const measure = () => {
      const header = document.querySelector('header');
      if (header) {
        setHeaderHeight(header.getBoundingClientRect().height);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    const header = document.querySelector('header');
    if (header) observer.observe(header);
    window.addEventListener('scroll', measure, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', measure);
    };
  }, []);

  const linkStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    color: 'inherit',
    textDecoration: 'none',
    transition: 'opacity 0.2s ease',
  } as const;

  return (
    <Box
      as="nav"
      aria-label="breadcrumb"
      position="fixed"
      top={`${headerHeight}px`}
      left={0}
      right={0}
      zIndex={99}
      bg={tintColor || 'overlayLight'}
      backdropFilter="blur(14px)"
      px={{ base: '1.5rem', md: '3rem' }}
      py="0.05rem"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      fontSize="0.72rem"
      letterSpacing="0.1em"
      textTransform="lowercase"
      color={tintColor ? 'rgba(255,255,255,0.6)' : 'inkMuted'}
      transform={isHidden ? 'translateY(-200%)' : 'translateY(0)'}
      opacity={isHidden ? 0 : 1}
      pointerEvents={isHidden ? 'none' : 'auto'}
      transition="background 0.4s ease, color 0.4s ease, transform 0.3s ease, opacity 0.3s ease, top 0.3s ease"
    >
      {/* Left: home > current */}
      <Flex align="center" gap="0.35rem">
        <NextLink href={homePath} style={linkStyle}>
          {useGlyphs ? (
            <Box as="span" display="inline-flex" alignItems="center" fontFamily="glyph" lineHeight={1} verticalAlign="middle">
              <Box as="span" fontSize="glyphH1">⊶</Box>
              <Box as="span" fontSize="glyphH2">⊙</Box>
              <Box as="span" fontSize="glyphH1">⊷</Box>
            </Box>
          ) : (
            <span>home</span>
          )}
        </NextLink>
        {items.map((item, i) => (
          <Flex key={i} align="center" gap="0.35rem">
            <Box as="span" opacity={0.35} marginBottom={useGlyphs ? '5px' : '0'}>›</Box>
            {item.href ? (
              <NextLink href={item.href} style={linkStyle}>
                {item.label}
              </NextLink>
            ) : (
              <Text as="span" color="inkSoft" marginBottom={useGlyphs ? '5px' : '0'}>
                {item.label}
              </Text>
            )}
          </Flex>
        ))}
      </Flex>

      {/* Right: back */}
      <NextLink
        href={homePath}
        style={linkStyle}
        title={backLabel}
      >
        {useGlyphs ? (
          <Box
            as="span"
            display="inline-flex"
            alignItems="center"
            fontFamily="glyph"
            fontSize="glyphH1"
            lineHeight={1}
            verticalAlign="middle"
          >
            ⊷
          </Box>
        ) : (
          <span>{backLabel}</span>
        )}
      </NextLink>
    </Box>
  );
}
