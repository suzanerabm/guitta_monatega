'use client';
import { Box, Flex } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useChromeTint } from '@/components/ChromeTint';

interface FooterProps {
  aboutPath: string;
  aboutLabel: string;
  privacyPath: string;
  privacyLabel: string;
  /** Aviso de direitos autorais (i18n). Mostrado discreto abaixo dos links. */
  copyright?: string;
}

export function Footer({
  aboutPath,
  aboutLabel,
  privacyPath,
  privacyLabel,
  copyright,
}: FooterProps) {
  const { tintColor } = useChromeTint();

  const bg = tintColor ? tintColor : 'headerBg';
  const textColor = tintColor ? 'textOverlayStrong' : 'fg';

  const linkStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    fontWeight: 300,
    letterSpacing: '0.1em',
    textTransform: 'lowercase',
    color: 'inherit',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
  };

  return (
    <Box
      as="footer"
      py={{ base: '2rem', md: 'xl' }}
      px="lg"
      bg={bg}
      color={textColor}
      transition="background 0.4s ease, color 0.4s ease"
    >
      <Flex
        direction="column"
        align="center"
        justify="center"
        gap="md"
        width="100%"
      >
        <Flex gap="lg" align="center" justify="center">
          <NextLink href={aboutPath} style={linkStyle}>
            {aboutLabel}
          </NextLink>
          <Box
            w="2px"
            h="2px"
            borderRadius="full"
            bg={tintColor ? 'textOverlayStrong' : 'borderColor'}
            opacity={0.6}
          />
          <NextLink href={privacyPath} style={linkStyle}>
            {privacyLabel}
          </NextLink>
        </Flex>

        {/* Aviso de direitos autorais — discreto, abaixo dos links. Não impede
            cópia (impossível), mas dá respaldo legal de autoria. */}
        {copyright && (
          <Box
            as="p"
            m={0}
            fontSize="0.7rem"
            fontWeight={300}
            letterSpacing="0.08em"
            opacity={0.55}
            textAlign="center"
          >
            {copyright}
          </Box>
        )}
      </Flex>
    </Box>
  );
}
