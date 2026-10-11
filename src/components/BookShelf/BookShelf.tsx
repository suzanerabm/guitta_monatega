'use client';

import { Box } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import { HorizontalCardStrip, type HorizontalCardStripProps } from '@/components/HorizontalCardStrip';
import { BookPanel, type BookPanelBook } from '@/components/BookPanel';
import { OutlineActionLink } from '@/components/OutlineActionLink';

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
  /** Color used for arrows at the beginning/end of the shelf. */
  disabledArrowColor?: string;
  /** Overlay navigation without taking horizontal space from the cards. */
  overlayArrows?: boolean;
  /** Horizontal offset for overlaid navigation arrows. */
  overlayArrowOffset?: string;
  /** Padding applied inside the scrollable card track. */
  cardPadding?: HorizontalCardStripProps['cardPadding'];
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
  /** Place the view-all action beside the host section title on desktop. */
  viewAllPlacement?: 'shelf' | 'section-title';
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
  disabledArrowColor,
  overlayArrows = false,
  overlayArrowOffset,
  cardPadding,
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
  viewAllPlacement = 'shelf',
  'data-testid': testId,
}: BookShelfProps) {
  return (
    <Box>
      {viewAllHref && viewAllLabel && (
        <Box
          display="flex"
          justifyContent="flex-end"
          position={viewAllPlacement === 'section-title' ? { base: 'static', md: 'absolute' } : 'static'}
          top={viewAllPlacement === 'section-title' ? { base: 'auto', md: 0 } : undefined}
          right={viewAllPlacement === 'section-title' ? { base: 'auto', md: 0 } : undefined}
          mb={viewAllPlacement === 'section-title' ? { base: 'lg', md: 0 } : 'lg'}
          pr={{ base: 'lg', md: 0 }}
        >
          <OutlineActionLink href={viewAllHref} color={viewAllColor}>
            {viewAllLabel}
          </OutlineActionLink>
        </Box>
      )}
      <HorizontalCardStrip
        arrowColor={arrowColor}
        disabledArrowColor={disabledArrowColor}
        overlayArrows={overlayArrows}
        overlayArrowOffset={overlayArrowOffset}
        cardPadding={cardPadding}
        arrowVariant={arrowVariant}
        data-testid={testId}
      >
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
