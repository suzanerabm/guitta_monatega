import { Box, Heading, Image, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { GradientLine } from '@/components/GradientLine';
import { bookPageLayout } from '@/theme/bookPages';

interface BookCatalogCardProps {
  href: string;
  title: string;
  collection: string;
  cover: string | null;
  detailsLabel: string;
  accentColor: string;
  badgeLabel?: string;
  editionLabels?: string[];
  priceLabel?: string;
}

export function BookCatalogCard({
  href, title, collection, cover, detailsLabel, accentColor,
  badgeLabel, editionLabels = [], priceLabel,
}: BookCatalogCardProps) {
  return (
    <NextLink
      href={href}
      aria-label={`${detailsLabel}: ${title}`}
      style={{ color: 'inherit', display: 'block', height: '100%', textDecoration: 'none' }}
    >
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
        <Box bg="surface" aspectRatio={bookPageLayout.coverAspectRatio} overflow="hidden" position="relative">
          {cover && (
            <Image src={cover} alt={title} width="100%" height="100%" objectFit="contain" loading="lazy" decoding="async" />
          )}
          {badgeLabel && (
            <Text
              position="absolute"
              top={0}
              right={0}
              bg={accentColor}
              color="ink"
              px="md"
              py="sm"
              fontSize="xs"
              fontWeight="semibold"
              letterSpacing="wider"
              textTransform="uppercase"
            >
              {badgeLabel}
            </Text>
          )}
        </Box>
        <Box p={{ base: 'lg', md: 'xl' }} display="flex" flexDirection="column" flex="1">
          <Text
            fontSize="xs"
            letterSpacing="wider"
            textTransform="uppercase"
            color="inkMuted"
            lineHeight={1}
            mb={0}
          >
            {collection}
          </Text>
          <Heading as="h2" textStyle="heading" fontSize="bookCardTitle" color="ink" mb="lg">
            {title}
          </Heading>
          {priceLabel && (
            <Box mb="sm">
              <GradientLine color={accentColor} width={bookPageLayout.cardPriceLineWidth} />
              <Text fontSize="lg" color="ink" fontWeight="semibold" mt="md">
                {priceLabel}
              </Text>
            </Box>
          )}
          {editionLabels.length > 0 && (
            <Text fontSize="sm" color="inkMuted" lineHeight={1.6}>
              {editionLabels.join(' · ')}
            </Text>
          )}
        </Box>
      </Box>
    </NextLink>
  );
}
