'use client';
import { Box, Flex } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useChromeTint } from '@/components/ChromeTint';

interface FooterProps {
  aboutPath: string;
  aboutLabel: string;
}

export function Footer({ aboutPath, aboutLabel }: FooterProps) {
  const { tintColor } = useChromeTint();

  const bg = tintColor ? tintColor : 'headerBg';
  const textColor = tintColor ? 'textOverlayStrong' : 'fg';

  return (
    <Box
      as="footer"
      py={{ base: '2rem', md: 'xl' }}
      px="lg"
      bg={bg}
      color={textColor}
      transition="background 0.4s ease, color 0.4s ease"
    >
      <Flex direction="column" align="center" gap="lg">
        <Box w="30px" h="1px" bg={tintColor ? 'textOverlayStrong' : 'borderColor'} />
        <NextLink
          href={aboutPath}
          style={{
            fontSize: '0.75rem',
            fontWeight: 300,
            letterSpacing: '0.1em',
            textTransform: 'lowercase',
            color: 'inherit',
            transition: 'all 0.2s ease',
            textDecoration: 'none',
          }}
        >
          {aboutLabel}
        </NextLink>
      </Flex>
    </Box>
  );
}
