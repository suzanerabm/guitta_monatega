import { Box } from '@chakra-ui/react';
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
  /** Section eyebrow shown on every card (e.g. "Livros"). */
  title: string;
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
  title,
  books,
  arrowColor,
  arrowVariant = 'plain',
  readLabel,
  comingSoonLabel,
  'data-testid': testId,
}: BookShelfProps) {
  return (
    <HorizontalCardStrip arrowColor={arrowColor} arrowVariant={arrowVariant} data-testid={testId}>
      {books.map((entry) => (
        <Box key={entry.book.id} width={{ base: '80vw', sm: '340px' }} maxW="420px">
          <BookPanel
            title={title}
            book={entry.book}
            borderColor={entry.borderColor}
            textColor={entry.textColor}
            readLabel={readLabel}
            comingSoonLabel={comingSoonLabel}
            onRead={entry.onRead}
          />
        </Box>
      ))}
    </HorizontalCardStrip>
  );
}
