'use client';

import { useState } from 'react';
import { Box, Button, Link, Text } from '@chakra-ui/react';
import { BookFacts, type BookFactsLabels } from '@/components/BookFacts';
import {
  formatBookPrice,
  type BookEdition,
  type BookFormat,
  type BookLocale,
} from '@/lib/books';

interface BookEditionSelectorProps {
  editions: BookEdition[];
  locale: BookLocale;
  accentColor: string;
  formatLabels: Record<BookFormat, string>;
  factsLabels: BookFactsLabels;
  buyLabel: string;
  amazonBuyLabel: string;
  soonLabel: string;
}

export function BookEditionSelector({
  editions,
  locale,
  accentColor,
  formatLabels,
  factsLabels,
  buyLabel,
  amazonBuyLabel,
  soonLabel,
}: BookEditionSelectorProps) {
  const preferredEdition = editions.find((edition) => edition.format === 'paperback') ?? editions[0];
  const [selectedId, setSelectedId] = useState(preferredEdition?.id);
  const selectedEdition = editions.find((edition) => edition.id === selectedId) ?? preferredEdition;

  if (!selectedEdition) return null;
  const isAmazon = selectedEdition.retailer?.toLowerCase().includes('amazon') ?? false;

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
              bg={selected ? 'surface' : 'transparent'}
              color="ink"
              border="1px solid"
              borderColor={selected ? accentColor : 'border'}
              boxShadow={selected ? 'card' : 'none'}
              whiteSpace="normal"
              textAlign="left"
              transitionProperty="border-color, opacity"
              transitionDuration="default"
              _hover={{ opacity: 0.78 }}
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
        borderColor="border"
        bg="surface"
        p={{ base: 'lg', md: 'xl' }}
      >
        <Text textStyle="heading" fontSize="xl" color="ink">
          {formatLabels[selectedEdition.format]}
        </Text>
        {selectedEdition.price && (
          <Text fontSize="2xl" color="ink" fontWeight="semibold" mt="xs">
            {formatBookPrice(selectedEdition.price, locale)}
          </Text>
        )}
        {selectedEdition.retailer && (
          <Text fontSize="sm" color="inkMuted" mt="sm">
            {selectedEdition.retailer}
          </Text>
        )}

        {selectedEdition.purchaseChannel === 'store' ? (
          <Button
            type="button"
            data-cart-action="add"
            data-edition-id={selectedEdition.id}
            display="block"
            width="100%"
            height="auto"
            bg="ink"
            color="white"
            px="xl"
            py="md"
            mt="xl"
            fontSize="sm"
            fontWeight="semibold"
            letterSpacing="wide"
            textTransform="uppercase"
            textAlign="center"
          >
            {buyLabel}
          </Button>
        ) : selectedEdition.url ? (
          <Link
            href={selectedEdition.url}
            target="_blank"
            rel="noopener noreferrer"
            display="block"
            width="100%"
            bg="ink"
            color="white"
            px="xl"
            py="md"
            mt="xl"
            fontSize="sm"
            fontWeight="semibold"
            letterSpacing="wide"
            textTransform="uppercase"
            textAlign="center"
          >
            {isAmazon ? amazonBuyLabel : buyLabel}
          </Link>
        ) : (
          <Text fontSize="sm" color="inkMuted" mt="xl">
            {soonLabel}
          </Text>
        )}

        {selectedEdition.facts && (
          <BookFacts
            facts={selectedEdition.facts}
            accentColor={accentColor}
            embedded
            labels={factsLabels}
          />
        )}
      </Box>
    </Box>
  );
}
