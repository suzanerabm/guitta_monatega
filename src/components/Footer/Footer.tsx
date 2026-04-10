import { Box, Flex } from '@chakra-ui/react';
import NextLink from 'next/link';

interface FooterProps {
  aboutPath: string;
  aboutLabel: string;
}

export function Footer({ aboutPath, aboutLabel }: FooterProps) {
  return (
    <Box as="footer" py={{ base: '2rem', md: 'xl' }} px="lg">
      <Flex direction="column" align="center" gap="lg">
        <Box w="30px" h="1px" bg="borderColor" />
        <NextLink
          href={aboutPath}
          style={{
            fontSize: '0.75rem',
            fontWeight: 300,
            letterSpacing: '0.1em',
            textTransform: 'lowercase',
            color: 'var(--chakra-colors-fgMuted)',
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
