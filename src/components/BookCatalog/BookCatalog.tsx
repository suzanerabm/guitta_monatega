'use client';

import { useMemo, useState } from 'react';
import { Box, Button } from '@chakra-ui/react';
import { BookCatalogCard } from '@/components/BookCatalogCard';
import {
  BOOK_FORMAT_ORDER,
  formatBookPrice,
  getBookFormats,
  getLowestBookPrice,
  type BookFormat,
  type CatalogBook,
} from '@/lib/books';
import { bookPageVisuals } from '@/theme/bookPages';

interface BookCatalogLabels {
  filterLabel: string;
  allFormats: string;
  fromPrice: string;
  details: string;
  collections: Record<CatalogBook['collection'], string>;
  formats: Record<BookFormat, string>;
}

interface BookCatalogProps {
  books: CatalogBook[];
  locale: 'pt' | 'en';
  labels: BookCatalogLabels;
}

export function BookCatalog({ books, locale, labels }: BookCatalogProps) {
  const [activeFormat, setActiveFormat] = useState<BookFormat | 'all'>('all');
  const availableFormats = useMemo(
    () => BOOK_FORMAT_ORDER.filter((format) => books.some((book) => book.editions.some((edition) => edition.format === format))),
    [books],
  );
  const visibleBooks = activeFormat === 'all'
    ? books
    : books.filter((book) => book.editions.some((edition) => edition.format === activeFormat));

  return (
    <Box>
      <Box
        as="nav"
        aria-label={labels.filterLabel}
        maxW="1200px"
        mx="auto"
        px={{ base: 'lg', md: '3xl' }}
        pb={{ base: 'xl', md: '2xl' }}
        display="flex"
        flexWrap="wrap"
        gap="sm"
      >
        {(['all', ...availableFormats] as const).map((format) => {
          const active = activeFormat === format;
          return (
            <Button
              key={format}
              type="button"
              aria-pressed={active}
              onClick={() => setActiveFormat(format)}
              bg={active ? 'ink' : 'transparent'}
              color={active ? 'white' : 'inkSoft'}
              border="1px solid"
              borderColor={active ? 'ink' : 'border'}
              px="lg"
              py="md"
              fontSize="sm"
              fontWeight="semibold"
              letterSpacing="wide"
              textTransform="uppercase"
              transitionProperty="opacity"
              transitionDuration="default"
              _hover={{ opacity: 0.72 }}
            >
              {format === 'all' ? labels.allFormats : labels.formats[format]}
            </Button>
          );
        })}
      </Box>

      <Box
        as="section"
        maxW="1200px"
        mx="auto"
        px={{ base: 'lg', md: '3xl' }}
        pb={{ base: '4xl', md: '6xl' }}
        display="grid"
        gridTemplateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
        gap={{ base: 'xl', md: '2xl' }}
      >
        {visibleBooks.map((book) => {
          const visual = bookPageVisuals[book.visualKey];
          const formats = getBookFormats(book);
          const lowestPrice = getLowestBookPrice(book);
          const formattedPrice = lowestPrice ? formatBookPrice(lowestPrice, locale) : null;

          return (
            <BookCatalogCard
              key={book.slug}
              href={`/${locale}/books/${book.slug}`}
              title={book.title}
              collection={labels.collections[book.collection]}
              cover={book.cover}
              detailsLabel={labels.details}
              accentColor={visual.accent}
              decoration={visual.decorations[0]?.src}
              editionLabels={formats.map((format) => labels.formats[format])}
              priceLabel={formattedPrice ? `${labels.fromPrice} ${formattedPrice}` : undefined}
            />
          );
        })}
      </Box>
    </Box>
  );
}
