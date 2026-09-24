'use client';

import { useMemo, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { BookCatalogCard } from '@/components/BookCatalogCard';
import { FilterBar } from '@/components/FilterBar';
import {
  BOOK_FORMAT_ORDER,
  formatBookPrice,
  getBookFormats,
  getLowestBookPrice,
  isBookComingSoon,
  type BookFormat,
  type CatalogBook,
} from '@/lib/books';
import { bookPageVisuals } from '@/theme/bookPages';

interface BookCatalogLabels {
  filterLabel: string;
  allFormats: string;
  fromPrice: string;
  details: string;
  comingSoon: string;
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
  const filters = useMemo(
    () => availableFormats.map((format) => ({ id: format, label: labels.formats[format] })),
    [availableFormats, labels.formats],
  );
  const visibleBooks = activeFormat === 'all'
    ? books
    : books.filter((book) => book.editions.some((edition) => edition.format === activeFormat));

  return (
    <Box>
      <FilterBar
        filters={filters}
        allLabel={labels.allFormats}
        ariaLabel={labels.filterLabel}
        active={activeFormat}
        onFilter={(format) => setActiveFormat(format as BookFormat | 'all')}
      />

      <Box
        as="section"
        maxW="1200px"
        mx="auto"
        px={{ base: 'lg', md: '3xl' }}
        py={{ base: '2xl', md: '4xl' }}
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
              badgeLabel={isBookComingSoon(book) ? labels.comingSoon : undefined}
              editionLabels={formats.map((format) => labels.formats[format])}
              priceLabel={formattedPrice ? `${labels.fromPrice} ${formattedPrice}` : undefined}
            />
          );
        })}
      </Box>
    </Box>
  );
}
