import { Box, Text, chakra } from '@chakra-ui/react';

// Fixed height at every breakpoint so cards in a shelf stay uniform — no
// card grows taller than its neighbours when its title runs long or it
// has no cover at all. Mirrors KammaraEventCard's CARD_HEIGHT pattern.
const CARD_HEIGHT: Record<string, string> = {
  base: '620px',
  md: '680px',
};

export interface BookPanelBook {
  id: string;
  image?: string | null;
  alt: string;
  label: string;
  soon?: boolean;
  buy?: { url: string; label: string } | null;
}

interface BookPanelProps {
  /** Section eyebrow above the cover (e.g. "Livros"). */
  title: string;
  book: BookPanelBook;
  /** Border/outline accent color. */
  borderColor: string;
  /** Text color for title + button. */
  textColor: string;
  /** Label for the "read" button when there's no buy link (default: "Ler história ✦"). */
  readLabel?: string;
  /** Label for the disabled "buy" button when the book is visible but has no `buy` link yet (default: "Em breve"). */
  comingSoonLabel?: string;
  /** Called when the reader button is clicked (no buy link, has pages). */
  onRead?: (bookId: string) => void;
  'data-testid'?: string;
}

/**
 * BookPanel — a single-book showcase panel: dark card, cover art, title, and
 * a pill button. The button is "buy" (external link, when `book.buy` is
 * set), "coming soon" (same pill, disabled, when the book is visible but
 * has no buy link yet), or "read" (opens the in-site page reader, only when
 * there's nothing to buy AND no pending buy link — i.e. `book.soon` is
 * false and `book.buy` is absent). Shared by Bichittos and Kammara so the
 * look (and future changes to it) stays in one place.
 */
export function BookPanel({
  title,
  book,
  borderColor,
  textColor,
  readLabel = 'Ler história ✦',
  comingSoonLabel = 'Em breve',
  onRead,
  'data-testid': testId,
}: BookPanelProps) {
  return (
    <Box
      data-testid={testId ?? 'book-panel'}
      borderRadius="20px"
      p={{ base: '1.5rem', md: '2rem' }}
      height={CARD_HEIGHT}
      display="flex"
      flexDirection="column"
      css={{
        background: 'rgba(0,0,0,0.28)',
        outline: `2px solid ${borderColor}`,
        outlineOffset: '6px',
      }}
    >
      <Text
        textStyle="heading"
        fontSize="xs"
        letterSpacing="hero"
        textTransform="uppercase"
        color={textColor}
        mb="1rem"
        flexShrink={0}
      >
        {title}
      </Text>
      {book.image && (
        <Box flex="0 1 auto" minHeight={0} mb="1rem" textAlign="center">
          <chakra.img
            src={book.image}
            alt={book.alt}
            maxWidth="100%"
            maxHeight="100%"
            borderRadius="12px"
            css={{
              outline: `2px solid ${borderColor}`,
              outlineOffset: '4px',
              display: 'inline-block',
            }}
          />
        </Box>
      )}
      <Text
        textStyle="heading"
        fontSize={{ base: 'lg', md: 'xl' }}
        color={textColor}
        mb="1rem"
        flex="1"
        css={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {book.label}
      </Text>
      {book.buy ? (
        // Livro à venda (só capa + link): botão leva pra loja.
        <chakra.a
          href={book.buy.url}
          target="_blank"
          rel="noopener noreferrer"
          css={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            outline: `2px solid ${borderColor}`,
            outlineOffset: '3px',
            borderRadius: '999px',
            padding: '0.5rem 1.4rem',
            color: textColor,
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            background: 'transparent',
            textDecoration: 'none',
            transition: 'transform 0.15s ease, opacity 0.15s ease',
          }}
        >
          {book.buy.label} ↗
        </chakra.a>
      ) : book.soon ? (
        // Livro visível, mas sem link de compra ainda: mesmo visual do
        // botão de compra, só que desabilitado.
        <chakra.span
          aria-disabled="true"
          css={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            outline: `2px solid ${borderColor}`,
            outlineOffset: '3px',
            borderRadius: '999px',
            padding: '0.5rem 1.4rem',
            color: textColor,
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            opacity: 0.6,
            background: 'transparent',
          }}
        >
          {comingSoonLabel}
        </chakra.span>
      ) : (
        <chakra.button
          type="button"
          onClick={() => onRead?.(book.id)}
          css={{
            display: 'inline-block',
            outline: `2px solid ${borderColor}`,
            outlineOffset: '3px',
            borderRadius: '999px',
            padding: '0.5rem 1.4rem',
            color: textColor,
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            background: 'transparent',
          }}
        >
          {readLabel}
        </chakra.button>
      )}
    </Box>
  );
}
