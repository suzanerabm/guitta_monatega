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
  editionLabels?: string[];
  priceLabel?: string;
}

export function BookCatalogCard({
  href,
  title,
  collection,
  cover,
  detailsLabel,
  accentColor,
  editionLabels = [],
  priceLabel,
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
      <Box p={{ base: 'lg', md: 'xl' }} display="flex" flexDirection="column" flex="1">
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
        {priceLabel && (
          <Text fontSize="lg" color="ink" fontWeight="semibold" mb="sm">
            {priceLabel}
          </Text>
        )}
        {editionLabels.length > 0 && (
          <Text fontSize="sm" color="inkMuted" lineHeight={1.6} mb="lg">
            {editionLabels.join(' · ')}
          </Text>
        )}
        <Box mt="auto">
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
