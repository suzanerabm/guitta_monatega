import { Box } from '@chakra-ui/react';
import { BookCatalogCard } from '@/components/BookCatalogCard';
import { HorizontalCardStrip } from '@/components/HorizontalCardStrip';
import {
  formatBookPrice,
  getBookFormats,
  getLowestBookPrice,
  isBookComingSoon,
  type BookFormat,
  type BookLocale,
  type CatalogBook,
} from '@/lib/bookCatalog';
import { bookPageVisuals } from '@/theme/bookPages';

interface BookCatalogCarouselProps {
  books: CatalogBook[];
  locale: BookLocale;
  detailsLabel: string;
  fromPriceLabel: string;
  comingSoonLabel: string;
  formatLabels: Record<BookFormat, string>;
  collectionLabels: Record<CatalogBook['collection'], string>;
}

export function BookCatalogCarousel({
  books,
  locale,
  detailsLabel,
  fromPriceLabel,
  comingSoonLabel,
  formatLabels,
  collectionLabels,
}: BookCatalogCarouselProps) {
  return (
    <Box>
      <HorizontalCardStrip arrowColor="ink" arrowVariant="plain" cardPadding={{ base: 'base', md: 'sm' }}>
        {books.map((book) => {
          const visual = bookPageVisuals[book.visualKey];
          const price = getLowestBookPrice(book);
          return (
            <Box key={book.slug} width={{ base: '78vw', sm: '340px', lg: '360px' }} height="100%">
              <BookCatalogCard
                href={`/${locale}/books/${book.slug}`}
                title={book.title}
                collection={collectionLabels[book.collection]}
                cover={book.cover}
                detailsLabel={detailsLabel}
                accentColor={visual.accent}
                badgeLabel={isBookComingSoon(book) ? comingSoonLabel : undefined}
                editionLabels={getBookFormats(book).map((format) => formatLabels[format])}
                priceLabel={price ? `${fromPriceLabel} ${formatBookPrice(price, locale)}` : undefined}
              />
            </Box>
          );
        })}
      </HorizontalCardStrip>
    </Box>
  );
}
