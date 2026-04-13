'use client';
import { Box, Flex } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useScrollHeader } from '@/hooks/useScrollHeader';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useChromeTint } from '@/components/ChromeTint';

interface HeaderProps {
  homePath: string;
  transparent?: boolean;
}

export function Header({ homePath, transparent = false }: HeaderProps) {
  const { isCompact, isHidden } = useScrollHeader(80);
  const { tintColor } = useChromeTint();

  // Tint takes precedence over transparent/headerBg
  const bg = tintColor
    ? tintColor
    : transparent && !isCompact
      ? 'transparent'
      : 'headerBg';

  // When tint is active, the text should be light translucent
  // (matching the filter bar buttons in tint mode)
  const textColor = tintColor ? 'textOverlayStrong' : 'fg';

  return (
    <Box
      as="header"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={100}
      bg={bg}
      backdropFilter={transparent && !isCompact ? 'none' : 'blur(14px)'}
      color={textColor}
      transform={isHidden ? 'translateY(-100%)' : 'translateY(0)'}
      transition="background 0.4s ease, color 0.4s ease, transform 0.3s ease, all 0.3s ease"
      px={{ base: 'lg', md: 'xl' }}
      py={isCompact ? '0.6rem' : { base: '1.2rem', md: 'md' }}
    >
      <Flex justify="space-between" align="center">
        <Box
          fontSize={isCompact ? 'base' : { base: 'base', md: 'xl' }}
          fontWeight="light"
          letterSpacing="wider"
          textTransform="lowercase"
          color="inherit"
          transition="all 0.2s ease"
        >
          <NextLink href={homePath} style={{ color: 'inherit', textDecoration: 'none' }}>
            <Box as="strong" fontWeight="medium">guitta</Box>{' '}monatega
          </NextLink>
        </Box>
        <LanguageToggle />
      </Flex>
    </Box>
  );
}
