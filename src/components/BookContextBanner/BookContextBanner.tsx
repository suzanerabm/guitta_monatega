import { Box, Heading, Image, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { bookPageLayout } from '@/theme/bookPages';

interface BookContextBannerProps {
  href: string;
  eyebrow: string;
  title: string;
  backgroundImage: string;
  overlay: string;
  decorations: string[];
  accentColor: string;
}

export function BookContextBanner({
  href,
  eyebrow,
  title,
  backgroundImage,
  overlay,
  decorations,
  accentColor,
}: BookContextBannerProps) {
  return (
    <NextLink href={href} style={{ textDecoration: 'none' }}>
      <Box
        as="section"
        aria-label={title}
        position="relative"
        height={bookPageLayout.contextBannerHeight}
        overflow="hidden"
        backgroundImage={`${overlay}, url(${backgroundImage})`}
        backgroundSize="cover"
        backgroundPosition={{ base: '58% center', md: 'center' }}
        borderTopWidth={bookPageLayout.accentBorderWidth}
        borderTopStyle="solid"
        borderTopColor={accentColor}
        display="flex"
        alignItems="center"
        px={{ base: 'xl', md: '5xl' }}
      >
        <Box position="relative" zIndex={2} maxW={{ base: '68%', md: '52%' }}>
          <Text
            fontSize="xs"
            letterSpacing="widest"
            textTransform="uppercase"
            color="textOverlay"
            mb="sm"
          >
            {eyebrow}
          </Text>
          <Heading as="h2" textStyle="heading" fontSize={{ base: '3xl', md: 'h1' }} lineHeight={1.02} color="white">
            {title}
          </Heading>
        </Box>
        <Box
          aria-hidden="true"
          position="absolute"
          inset={0}
          display="flex"
          justifyContent="flex-end"
          alignItems="flex-end"
          gap={{ base: 'xs', md: 'lg' }}
          px={{ base: 'xs', md: '3xl' }}
          pointerEvents="none"
        >
          {decorations.map((decoration) => (
            <Image
              key={decoration}
              src={decoration}
              alt=""
              height={bookPageLayout.contextCharacterHeight}
              width="auto"
              maxW={{ base: '42%', md: '30%' }}
              objectFit="contain"
              objectPosition="bottom"
              filter="drop-shadow(0 12px 18px rgba(0,0,0,0.28))"
            />
          ))}
        </Box>
      </Box>
    </NextLink>
  );
}
