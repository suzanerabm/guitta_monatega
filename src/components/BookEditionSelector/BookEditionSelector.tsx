'use client';

import { useState } from 'react';
import { Box, Button, Link, Text } from '@chakra-ui/react';
import { BookFacts, type BookFactsLabels } from '@/components/BookFacts';
import {
  formatBookPrice,
  type BookEdition,
  type BookFormat,
  type BookLocale,
} from '@/lib/bookCatalog';
import { bookPageLayout } from '@/theme/bookPages';

interface BookEditionSelectorProps {
  editions: BookEdition[];
  bookTitle: string;
  locale: BookLocale;
  accentColor: string;
  frameColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  formatLabels: Record<BookFormat, string>;
  factsLabels: BookFactsLabels;
  buyLabel: string;
  amazonBuyLabel: string;
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
  bookTitle,
  locale,
  accentColor,
  frameColor = 'white',
  textColor = 'ink',
  mutedTextColor = 'inkMuted',
  formatLabels,
  factsLabels,
  buyLabel,
  amazonBuyLabel,
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
  const isAmazon = selectedEdition.retailer?.toLowerCase().includes('amazon') ?? false;
  const isPreorder = selectedEdition.purchaseChannel === 'preorder';
  const templateValues = {
    title: bookTitle,
    format: formatLabels[selectedEdition.format],
  };
  const preorderUrl = isPreorder
    ? `mailto:hello@guittamonategastudio.com?subject=${encodeURIComponent(
        fillEmailTemplate(preorderEmailSubject, templateValues),
      )}&body=${encodeURIComponent(fillEmailTemplate(preorderEmailBody, templateValues))}`
    : null;
  const purchaseUrl = selectedEdition.url ?? preorderUrl;

  return (
    <Box width="100%" minW="0">
      <Box
        role="group"
        display="grid"
        gridTemplateColumns={{ base: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }}
        alignItems="start"
        gap="sm"
      >
        {editions.map((edition) => {
          const selected = edition.id === selectedEdition.id;
          return (
            <Button
              key={edition.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setSelectedId(edition.id)}
              height="auto"
              p="lg"
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
                {formatLabels[edition.format]}
              </Text>
              {edition.price && (
                <Text as="span" fontSize="lg" fontWeight="semibold">
                  {formatBookPrice(edition.price, locale)}
                </Text>
              )}
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
        <Text textStyle="heading" fontSize="xl" color={textColor}>
          {formatLabels[selectedEdition.format]}
        </Text>
        {selectedEdition.price && (
          <Text fontSize="2xl" color={textColor} fontWeight="semibold" mt="xs">
            {formatBookPrice(selectedEdition.price, locale)}
          </Text>
        )}
        {selectedEdition.retailer && (
          <Text fontSize="sm" color={mutedTextColor} mt="sm">
            {selectedEdition.retailer}
          </Text>
        )}

        {purchaseUrl ? (
          <>
            <Link
              href={purchaseUrl}
              target={isPreorder ? undefined : '_blank'}
              rel={isPreorder ? undefined : 'noopener noreferrer'}
              display="block"
              width="100%"
              bg={textColor}
              color="white"
              border="1px solid"
              borderColor={frameColor}
              borderRadius="full"
              px="xl"
              py="md"
              mt="xl"
              fontSize="sm"
              fontWeight="semibold"
              letterSpacing="wide"
              textTransform="uppercase"
              textAlign="center"
            >
              {isPreorder ? preorderLabel : isAmazon ? amazonBuyLabel : buyLabel}
            </Link>
            {isPreorder && (
              <Text fontSize="xs" color={mutedTextColor} mt="sm" textAlign="center">
                {preorderEmailHint}
              </Text>
            )}
          </>
        ) : (
          <Text fontSize="sm" color={mutedTextColor} mt="xl">
            {soonLabel}
          </Text>
        )}

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
