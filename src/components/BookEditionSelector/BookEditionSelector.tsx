'use client';

import { useState } from 'react';
import { Box, Button, Link, Text } from '@chakra-ui/react';
import { BookFacts, type BookFactsLabels } from '@/components/BookFacts';
import {
  formatBookPrice,
  isBookPromotionValid,
  type BookEdition,
  type BookFormat,
  type BookLocale,
} from '@/lib/bookCatalog';
import { bookPageLayout } from '@/theme/bookPages';

interface BookEditionSelectorProps {
  editions: BookEdition[];
  alternateEditions?: BookEdition[];
  bookTitle: string;
  locale: BookLocale;
  accentColor: string;
  frameColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  formatLabels: Record<BookFormat, string>;
  editionFormatLabel: string;
  digitalFormatLabel: string;
  factsLabels: BookFactsLabels;
  buyLabel: string;
  amazonBuyLabel: string;
  amazonVersionLabels?: Record<BookLocale, string>;
  preorderLabel: string;
  preorderEmailHint: string;
  preorderEmailSubject: string;
  preorderEmailBody: string;
  soonLabel: string;
}

function fillEmailTemplate(
  template: string,
  values: Record<'title' | 'format', string>,
) {
  return template
    .replaceAll('{title}', values.title)
    .replaceAll('{format}', values.format);
}

export function BookEditionSelector({
  editions,
  alternateEditions = [],
  bookTitle,
  locale,
  accentColor,
  frameColor = 'white',
  textColor = 'ink',
  mutedTextColor = 'inkMuted',
  formatLabels,
  editionFormatLabel,
  digitalFormatLabel,
  factsLabels,
  buyLabel,
  amazonBuyLabel,
  amazonVersionLabels,
  preorderLabel,
  preorderEmailHint,
  preorderEmailSubject,
  preorderEmailBody,
  soonLabel,
}: BookEditionSelectorProps) {
  const preferredEdition = editions.find((edition) => edition.format === 'paperback') ?? editions[0];
  const [selectedId, setSelectedId] = useState(preferredEdition?.id);
  const selectedEdition = editions.find((edition) => edition.id === selectedId) ?? preferredEdition;

  if (!selectedEdition) return null;
  const getEditionTitle = (edition: BookEdition) =>
    edition.format === 'hardcover' && edition.label
      ? edition.label
      : formatLabels[edition.format];
  const getEditionFormat = (edition: BookEdition) =>
    edition.format === 'ebook'
      ? digitalFormatLabel
      : edition.facts?.dimensions;
  const getPromotion = (edition: BookEdition) =>
    edition.promotion &&
    isBookPromotionValid(edition.price, edition.promotion.originalPrice)
      ? edition.promotion
      : null;
  const selectedTitle = getEditionTitle(selectedEdition);
  const selectedFormat = getEditionFormat(selectedEdition);
  const selectedLabel = selectedFormat
    ? `${selectedTitle} — ${editionFormatLabel} ${selectedFormat}`
    : selectedTitle;
  const selectedPromotion = getPromotion(selectedEdition);
  const isAmazon = selectedEdition.purchaseChannel === 'amazon';
  const isPreorder = selectedEdition.purchaseChannel === 'preorder';
  const templateValues = {
    title: bookTitle,
    format: selectedLabel,
  };
  const preorderUrl = isPreorder
    ? `mailto:hello@guittamonategastudio.com?subject=${encodeURIComponent(
        fillEmailTemplate(preorderEmailSubject, templateValues),
      )}&body=${encodeURIComponent(fillEmailTemplate(preorderEmailBody, templateValues))}`
    : null;
  const purchaseUrl = selectedEdition.url ?? preorderUrl;
  const alternateLocale: BookLocale = locale === 'pt' ? 'en' : 'pt';
  const alternateAmazonEdition = isAmazon
    ? alternateEditions.find((edition) =>
        edition.purchaseChannel === 'amazon' &&
        Boolean(edition.url) &&
        (selectedEdition.variantId
          ? edition.variantId === selectedEdition.variantId
          : edition.format === selectedEdition.format),
      )
    : undefined;
  const purchaseActions = purchaseUrl
    ? [
        {
          id: `${selectedEdition.id}-${locale}`,
          url: purchaseUrl,
          label: isPreorder
            ? preorderLabel
            : isAmazon
              ? amazonBuyLabel
              : buyLabel,
          subLabel: isAmazon ? amazonVersionLabels?.[locale] : undefined,
          external: !isPreorder,
        },
        ...(alternateAmazonEdition?.url
          ? [{
              id: `${alternateAmazonEdition.id}-${alternateLocale}`,
              url: alternateAmazonEdition.url,
              label: amazonBuyLabel,
              subLabel: amazonVersionLabels?.[alternateLocale],
              external: true,
            }]
          : []),
      ]
    : [];

  return (
    <Box width="100%" minW="0">
      <Box
        role="group"
        display="grid"
        gridTemplateColumns={{
          base: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(3, minmax(0, 1fr))',
          lg: 'repeat(4, minmax(0, 1fr))',
        }}
        alignItems="start"
        gap="base"
      >
        {editions.map((edition) => {
          const selected = edition.id === selectedEdition.id;
          const editionTitle = getEditionTitle(edition);
          const editionFormat = getEditionFormat(edition);
          const promotion = getPromotion(edition);
          return (
            <Button
              key={edition.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setSelectedId(edition.id)}
              height={bookPageLayout.detailEditionOptionHeight}
              width="100%"
              p={{ base: 'lg', lg: 'md' }}
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              justifyContent="flex-start"
              gap="xs"
              bg="white"
              color={textColor}
              border="1px solid"
              borderColor={selected ? accentColor : frameColor}
              borderRadius={bookPageLayout.detailPanelRadius}
              boxShadow={selected ? 'card' : 'none'}
              whiteSpace="normal"
              textAlign="left"
              transitionProperty="border-color, opacity"
              transitionDuration="default"
              _hover={{ opacity: 0.78 }}
              css={{
                outline: `${bookPageLayout.detailOutlineWidth} solid ${frameColor}`,
                outlineOffset: bookPageLayout.detailSelectorOutlineOffset,
              }}
            >
              <Text as="span" fontSize="sm" fontWeight="semibold">
                {editionTitle}
              </Text>
              <Text as="span" fontSize="xs" color={mutedTextColor}>
                {editionFormatLabel}{editionFormat ? ` ${editionFormat}` : ''}
              </Text>
              <Box as="span" mt="auto" width="100%">
                {promotion && (
                  <Text
                    as="span"
                    display="block"
                    fontSize="xs"
                    color={accentColor}
                    fontWeight="semibold"
                    mb="2xs"
                  >
                    {promotion.name}
                  </Text>
                )}
                <Box as="span" display="flex" alignItems="baseline" flexWrap="wrap" gap="sm">
                  {promotion && (
                    <Text
                      as="span"
                      fontSize="sm"
                      color={mutedTextColor}
                      textDecoration="line-through"
                    >
                      {formatBookPrice(promotion.originalPrice, locale)}
                    </Text>
                  )}
                  <Text as="span" fontSize="lg" fontWeight="semibold">
                    {edition.price ? formatBookPrice(edition.price, locale) : soonLabel}
                  </Text>
                </Box>
              </Box>
            </Button>
          );
        })}
      </Box>

      <Box
        mt="lg"
        width="100%"
        minW="0"
        boxSizing="border-box"
        border="1px solid"
        borderColor={frameColor}
        borderRadius={bookPageLayout.detailPanelRadius}
        bg="white"
        p={{ base: 'lg', md: 'xl' }}
        css={{
          outline: `${bookPageLayout.detailOutlineWidth} solid ${frameColor}`,
          outlineOffset: bookPageLayout.detailOutlineOffset,
        }}
      >
        <Box
          display="grid"
          gridTemplateColumns={{ base: '1fr', lg: 'minmax(0, 0.8fr) minmax(280px, 1.2fr)' }}
          gap={{ base: 'lg', lg: 'xl' }}
          alignItems="center"
        >
          <Box minW="0">
            <Text textStyle="heading" fontSize="xl" color={textColor}>
              {selectedTitle}
            </Text>
            {selectedPromotion && (
              <Text
                fontSize="xs"
                color={accentColor}
                fontWeight="semibold"
                letterSpacing="wide"
                textTransform="uppercase"
                mt="sm"
              >
                {selectedPromotion.name}
              </Text>
            )}
            {selectedEdition.price && (
              <Box display="flex" alignItems="baseline" flexWrap="wrap" gap="sm" mt="xs">
                {selectedPromotion && (
                  <Text
                    fontSize="lg"
                    color={mutedTextColor}
                    textDecoration="line-through"
                  >
                    {formatBookPrice(selectedPromotion.originalPrice, locale)}
                  </Text>
                )}
                <Text fontSize="2xl" color={textColor} fontWeight="semibold">
                  {formatBookPrice(selectedEdition.price, locale)}
                </Text>
              </Box>
            )}
            {selectedEdition.retailer && (
              <Text fontSize="sm" color={mutedTextColor} mt="sm">
                {selectedEdition.retailer}
              </Text>
            )}
          </Box>

          <Box display="flex" flexDirection="column" gap="sm" minW="0">
            {purchaseActions.length > 0 ? (
              <>
                {purchaseActions.map((action) => (
                  <Link
                    key={action.id}
                    href={action.url}
                    aria-label={`${action.label}${action.subLabel ? ` ${action.subLabel}` : ''}`}
                    target={action.external ? '_blank' : undefined}
                    rel={action.external ? 'noopener noreferrer' : undefined}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    gap="2xs"
                    width="100%"
                    minHeight={bookPageLayout.detailActionHeight}
                    bg={textColor}
                    color="white"
                    border="1px solid"
                    borderColor={frameColor}
                    borderRadius="full"
                    px="lg"
                    py="md"
                    textTransform="uppercase"
                    textAlign="center"
                  >
                    <Text
                      as="span"
                      fontSize="sm"
                      fontWeight="semibold"
                      letterSpacing="wide"
                    >
                      {action.label}
                    </Text>
                    {action.subLabel && (
                      <Text
                        as="span"
                        fontSize="xs"
                        fontWeight="medium"
                        letterSpacing="normal"
                      >
                        {action.subLabel}
                      </Text>
                    )}
                  </Link>
                ))}
                {isPreorder && (
                  <Text fontSize="xs" color={mutedTextColor} textAlign="center">
                    {preorderEmailHint}
                  </Text>
                )}
              </>
            ) : (
              <Text fontSize="sm" color={mutedTextColor}>
                {soonLabel}
              </Text>
            )}
          </Box>
        </Box>

        {selectedEdition.facts && (
          <BookFacts
            facts={selectedEdition.facts}
            accentColor={accentColor}
            textColor={textColor}
            mutedTextColor={mutedTextColor}
            embedded
            labels={factsLabels}
          />
        )}
      </Box>
    </Box>
  );
}
