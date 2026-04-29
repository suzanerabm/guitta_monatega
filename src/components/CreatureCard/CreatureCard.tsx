import { Box, Flex, Heading } from '@chakra-ui/react';
import type { ReactNode, CSSProperties } from 'react';

interface CreatureCardProps {
  name: string;
  bannerImage?: string;
  color1?: string;
  color2?: string;
  adornment?: ReactNode;
  children: ReactNode;
  banner?: ReactNode;
  strip?: ReactNode;
  'data-testid'?: string;
}

export function CreatureCard({
  name,
  bannerImage,
  color1,
  color2,
  adornment,
  children,
  banner,
  strip,
  'data-testid': testId,
}: CreatureCardProps) {
  const nameStyle: CSSProperties | undefined = color1 ? { color: color1 } : undefined;
  const textStyle: CSSProperties | undefined = color2 ? { color: color2 } : undefined;

  return (
    <>
      <Box
        data-creature
        data-testid={testId}
        maxW="1200px"
        mx="auto"
        px={{ base: '1.5rem', md: '3rem' }}
        pt={{ base: '1.5rem', md: '5rem' }}
        pb={{ base: '1rem', md: '2rem' }}
      >
        <Flex gap="0.4rem" align="stretch">
          {adornment && (
            <Box flexShrink={0} display="flex" alignItems="flex-start" pt="0.3rem">
              {adornment}
            </Box>
          )}
          <Box>
            <Heading
              as="h1"
              fontSize={{ base: '1.5rem', md: 'h2' }}
              fontWeight="bold"
              letterSpacing="tight"
              mb="1rem"
              style={nameStyle}
            >
              {name}
            </Heading>
            <Box
              fontSize={{ base: '0.9rem', md: 'lg' }}
              lineHeight={1.7}
              fontWeight="light"
              maxW="600px"
              style={textStyle}
            >
              {children}
            </Box>
          </Box>
        </Flex>
      </Box>
      {banner
        ? banner
        : bannerImage && (
            <Box
              data-testid="creature-banner"
              width="100vw"
              ml="calc(-50vw + 50%)"
              h={{ base: '35vh', md: '1400px' }}
              maxH="80vh"
              minH={{ base: '250px', md: undefined }}
              position="relative"
              overflow="hidden"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mt="2.5rem"
              backgroundImage={`url('${bannerImage}')`}
              backgroundPosition="center"
              backgroundSize="cover"
              backgroundRepeat="no-repeat"
            >
              {strip}
            </Box>
          )}
    </>
  );
}
