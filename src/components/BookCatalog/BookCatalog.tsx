'use client';

import { useMemo, useState } from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import { BookPanel } from '@/components/BookPanel';
import { FilterBar } from '@/components/FilterBar';
import {
  BOOK_FORMAT_ORDER,
  isBookComingSoon,
  type BookFormat,
  type CatalogBook,
} from '@/lib/bookCatalog';
import { bookPageLayout } from '@/theme/bookPages';
import { homeBooksGallery } from '@/theme/artSections';

interface BookCatalogLabels {
  title: string;
  intro: string;
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
    () => availableFormats.map((format) => ({
      id: format,
      label: labels.formats[format],
      color: homeBooksGallery.accentColor,
    })),
    [availableFormats, labels.formats],
  );
  const visibleBooks = activeFormat === 'all'
    ? books
    : books.filter((book) => book.editions.some((edition) => edition.format === activeFormat));

  return (
    <Box pt={bookPageLayout.catalogChromeClearance}>
      <FilterBar
        filters={filters}
        allLabel={labels.allFormats}
        ariaLabel={labels.filterLabel}
        active={activeFormat}
        onFilter={(format) => setActiveFormat(format as BookFormat | 'all')}
      />

      <Box as="section" background={homeBooksGallery.background} py={{ base: '3rem', md: '4rem' }}>
        <Box maxW="1200px" mx="auto" px={{ base: 'base', md: '3xl' }}>
          <Heading
            as="h1"
            textStyle="heading"
            fontSize="2xl"
            letterSpacing="tight"
            m="0"
            mb="tight"
            color={homeBooksGallery.accentColor}
          >
            {labels.title}
          </Heading>
          <Text
            fontFamily="body"
            fontSize="sm"
            letterSpacing="wide"
            textTransform="uppercase"
            m="0 0 2rem"
            color={homeBooksGallery.accentSoftColor}
          >
            {labels.intro}
          </Text>

          <Box
            display="grid"
            gridTemplateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
            gap={{ base: 'xl', md: '2xl' }}
            justifyItems="center"
          >
            {visibleBooks.map((book) => (
              <Box key={book.slug} width="100%" maxW={bookPageLayout.catalogCardMaxWidth}>
                <BookPanel
                  book={{
                    id: book.slug,
                    image: book.cover,
                    alt: book.title,
                    label: book.title,
                    soon: isBookComingSoon(book),
                    details: {
                      url: `/${locale}/books/${book.slug}`,
                      label: labels.details,
                    },
                  }}
                  borderColor={homeBooksGallery.panelBorderColor}
                  textColor={homeBooksGallery.accentColor}
                  background={homeBooksGallery.panelBackground}
                  height={bookPageLayout.homeShelfCardHeight}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
