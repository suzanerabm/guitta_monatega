import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { palettes, type PaletteName } from '@/theme/palettes';

type WorldPaletteName = Extract<
  PaletteName,
  'lunnp1' | 'eni4' | 'triplec' | 'orfv' | 'z1' | 'gotto' | 'digg' | 'memphis'
>;

interface WorldCardProps {
  tag: string;
  name: string;
  id?: string;
  paletteName: WorldPaletteName;
  showDivider?: boolean;
  stripLayout?: 'banner' | 'side';
  children: ReactNode;
  strip?: ReactNode;
  'data-testid'?: string;
}

function WorldText({
  tag,
  name,
  children,
  flex,
}: {
  tag: string;
  name: string;
  children: ReactNode;
  flex?: string | number;
}) {
  return (
    <Box
      data-world
      maxW="1000px"
      mx="auto"
      px={{ base: '1.5rem', md: '3rem' }}
      pt={{ base: '3rem', md: '5rem' }}
      pb={{ base: '1.5rem', md: '2rem' }}
      flex={flex}
      minW={0}
    >
      <Text
        as="span"
        display="block"
        fontSize="label"
        letterSpacing="wider"
        textTransform="uppercase"
        color="fgMuted"
        mb="0.5rem"
      >
        {tag}
      </Text>
      <Heading
        as="h2"
        fontSize="h2"
        fontWeight="bold"
        color="white"
        letterSpacing="tight"
        mb="0.8rem"
      >
        {name}
      </Heading>
      <Box
        fontSize="lg"
        lineHeight={1.7}
        color="fgSoft"
        fontWeight="light"
        maxW="600px"
      >
        {children}
      </Box>
    </Box>
  );
}

export function WorldCard({
  tag,
  name,
  id,
  paletteName,
  showDivider = true,
  stripLayout = 'banner',
  children,
  strip,
  'data-testid': testId,
}: WorldCardProps) {
  const gradient = palettes[paletteName].gradient;
  const sectionWorldAttr = id ? { 'data-section-world': id } : {};

  return (
    <Box data-testid={testId} data-strip-layout={stripLayout} {...sectionWorldAttr}>
      {stripLayout === 'side' ? (
        <>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align="center"
            maxW="1200px"
            mx="auto"
            gap="2rem"
          >
            <WorldText tag={tag} name={name} flex={1}>
              {children}
            </WorldText>
            <Box
              flex={{ base: 'none', md: '0 0 50%' }}
              width={{ base: '100%', md: 'auto' }}
              position="relative"
              overflow="hidden"
              display="flex"
              alignItems="center"
            >
              {strip}
            </Box>
          </Flex>
          <Box
            width="100vw"
            ml="calc(-50vw + 50%)"
            h="200px"
            mt="2rem"
            background={gradient}
          />
        </>
      ) : (
        <>
          <WorldText tag={tag} name={name}>
            {children}
          </WorldText>
          <Box
            width="100vw"
            ml="calc(-50vw + 50%)"
            h={{ base: '35vh', md: '50vh' }}
            minH={{ base: '250px', md: '350px' }}
            position="relative"
            overflow="hidden"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mt="2.5rem"
            background={gradient}
          >
            {strip}
          </Box>
        </>
      )}
      {showDivider && (
        <Box
          data-testid="world-divider"
          width="40px"
          h="1px"
          bg="darkBorder"
          mx="auto"
          my="4rem"
        />
      )}
    </Box>
  );
}
