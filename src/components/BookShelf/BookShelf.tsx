'use client';

import { Box } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import NextLink from 'next/link';
import { HorizontalCardStrip } from '@/components/HorizontalCardStrip';
import { BookPanel, type BookPanelBook } from '@/components/BookPanel';

export interface BookShelfEntry {
  book: BookPanelBook;
  /** Border/outline accent color for this specific book's panel. */
  borderColor: string;
  /** Text color for this specific book's panel. */
  textColor: string;
  onRead?: (bookId: string) => void;
}

interface BookShelfProps {
  books: BookShelfEntry[];
  /** Color of the prev/next arrows. Falls back to HorizontalCardStrip's default. */
  arrowColor?: string;
  /**
   * Arrow glyph style — see HorizontalCardStrip. Default 'plain': the
   * glyph font (⊷/⊶) is Kammara's visual language, so only the Kammara
   * "Livros" tab should pass 'glyph'; Bichittos and Art use plain chevrons.
   */
  arrowVariant?: 'glyph' | 'plain';
  /** Label for the "read" button when there's no buy link. */
  readLabel?: string;
  /** Label for the disabled "buy" button when a book has no buy link yet. */
  comingSoonLabel?: string;
  /** Optional card width override for wider host layouts such as the home page. */
  cardWidth?: BoxProps['width'];
  /** Optional maximum card width override. */
  cardMaxWidth?: BoxProps['maxWidth'];
  /** Optional panel height override. */
  cardHeight?: BoxProps['height'];
  /** Whether each card displays its book title. */
  showLabels?: boolean;
  /** Optional background shared by this shelf's panels. */
  panelBackground?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  viewAllColor?: string;
  'data-testid'?: string;
}

/**
 * BookShelf — horizontally-scrollable row of BookPanel cards. One BookPanel
 * already handles a single book; this is the shared container for showing
 * several at once (Kammara, Bichittos "Livros" tab, Art), so a growing
 * catalog (10+ books) scrolls instead of wrapping into a tall grid.
 * Built on HorizontalCardStrip, the same swipeable-strip primitive used
 * elsewhere on the site (scenes, character galleries, drops).
 */
export function BookShelf({
  books,
  arrowColor,
  arrowVariant = 'plain',
  readLabel,
  comingSoonLabel,
  cardWidth = { base: '80vw', sm: '340px' },
  cardMaxWidth = '420px',
  cardHeight,
  showLabels = true,
  panelBackground,
  viewAllHref,
  viewAllLabel,
  viewAllColor = 'ink',
  'data-testid': testId,
}: BookShelfProps) {
  return (
    <Box>
      {viewAllHref && viewAllLabel && (
        <Box display="flex" justifyContent="flex-end" mb="lg" pr={{ base: 'lg', md: 0 }}>
          <NextLink href={viewAllHref} style={{ textDecoration: 'none' }}>
            <Box
              as="span"
              display="inline-flex"
              alignItems="center"
              border="1px solid"
              borderColor={viewAllColor}
              color={viewAllColor}
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
              {viewAllLabel}
            </Box>
          </NextLink>
        </Box>
      )}
      <HorizontalCardStrip arrowColor={arrowColor} arrowVariant={arrowVariant} data-testid={testId}>
        {books.map((entry) => (
          <Box key={entry.book.id} width={cardWidth} maxW={cardMaxWidth}>
            <BookPanel
              book={entry.book}
              borderColor={entry.borderColor}
              textColor={entry.textColor}
              height={cardHeight}
              showLabel={showLabels}
              background={panelBackground}
              readLabel={readLabel}
              comingSoonLabel={comingSoonLabel}
              onRead={entry.onRead}
            />
          </Box>
        ))}
      </HorizontalCardStrip>
    </Box>
  );
}
