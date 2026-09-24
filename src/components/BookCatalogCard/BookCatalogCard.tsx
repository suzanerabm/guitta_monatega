import { Box, Heading, Image, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { bookPageLayout } from '@/theme/bookPages';

interface BookCatalogCardProps {
  href: string;
  title: string;
  collection: string;
  cover: string | null;
  detailsLabel: string;
  accentColor: string;
  decoration?: string;
}

export function BookCatalogCard({
  href,
  title,
  collection,
  cover,
  detailsLabel,
  accentColor,
  decoration,
}: BookCatalogCardProps) {
  return (
    <Box
      as="article"
      bg="offWhite"
      border="1px solid"
      borderColor="border"
      borderTopWidth={bookPageLayout.accentBorderWidth}
      borderTopStyle="solid"
      borderTopColor={accentColor}
      boxShadow="card"
      display="flex"
      flexDirection="column"
      height="100%"
    >
      <NextLink href={href} aria-label={`${detailsLabel}: ${title}`}>
        <Box bg="surface" aspectRatio={bookPageLayout.coverAspectRatio} overflow="hidden">
          {cover && (
            <Image
              src={cover}
              alt={title}
              width="100%"
              height="100%"
              objectFit="contain"
              loading="lazy"
              decoding="async"
            />
          )}
        </Box>
      </NextLink>
      <Box p={{ base: 'lg', md: 'xl' }} display="flex" flexDirection="column" flex="1" position="relative" overflow="hidden">
        {decoration && (
          <Image
            src={decoration}
            alt=""
            aria-hidden="true"
            position="absolute"
            right="md"
            bottom="md"
            width="4xl"
            height="4xl"
            objectFit="contain"
            opacity={0.12}
            pointerEvents="none"
          />
        )}
        <Text
          fontSize="xs"
          letterSpacing="wider"
          textTransform="uppercase"
          color="inkMuted"
          mb="sm"
        >
          {collection}
        </Text>
        <Heading as="h2" textStyle="heading" fontSize="xl" color="ink" mb="lg">
          {title}
        </Heading>
        <Box mt="auto" position="relative" zIndex={1}>
          <NextLink href={href} style={{ textDecoration: 'underline' }}>
            <Text as="span" fontSize="sm" color="ink" letterSpacing="wide">
              {detailsLabel}
            </Text>
          </NextLink>
        </Box>
      </Box>
    </Box>
  );
}
