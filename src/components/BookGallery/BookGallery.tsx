import { Box, Heading } from '@chakra-ui/react';
import { SoonBadge } from '@/components/SoonBadge';

export interface BookCover {
  id: string;
  image?: string;
  alt: string;
  label: string;
  soon?: boolean;
}

interface BookGalleryProps {
  title: string;
  books: BookCover[];
  soonLabel?: string;
  onBookClick?: (bookId: string) => void;
  /**
   * Visual tone for the gallery chrome. "default" shows a muted title and
   * a white label bar (used on light pages). "overlay" tints the title and
   * label bar with white-on-dark translucency — used when rendered on top
   * of a dark/colored creature-section background (Astro parity).
   */
  tone?: 'default' | 'overlay';
  'data-testid'?: string;
}

function gridColumns(count: number) {
  if (count <= 0) return '1fr';
  if (count === 1) return '1fr';
  if (count === 2) return 'repeat(2, 1fr)';
  if (count === 3) return { base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' };
  if (count === 4) return { base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' };
  return 'repeat(auto-fill, minmax(180px, 1fr))';
}

function gridMaxW(count: number) {
  if (count === 1) return { base: '100%', md: '280px' };
  if (count === 2) return '560px';
  return '100%';
}

export function BookGallery({
  title,
  books,
  soonLabel = 'soon',
  onBookClick,
  tone = 'default',
  'data-testid': testId,
}: BookGalleryProps) {
  const count = books.length;
  const overlay = tone === 'overlay';
  // Astro parity: inside .creature-section, the title is rgba(255,255,255,0.4)
  // and the label bar becomes dark-overlay + white text.
  const titleColor = overlay ? 'rgba(255,255,255,0.4)' : 'fgMuted';
  const labelBg = overlay ? 'bgOverlay' : 'bg';
  const labelFg = overlay ? 'textOverlay' : 'fgSoft';

  return (
    <Box
      data-creature
      data-testid={testId}
      maxW="1000px"
      mx="auto"
      mt="2rem"
      mb="3rem"
      px={{ base: '1.5rem', md: '3rem' }}
    >
      <Heading
        as="h4"
        textStyle="heading"
        fontSize="h4"
        letterSpacing="wider"
        textTransform="uppercase"
        color={titleColor}
        mb="1.2rem"
      >
        {title}
      </Heading>
      <Box
        display="grid"
        gap="1rem"
        gridTemplateColumns={gridColumns(count)}
        maxW={gridMaxW(count)}
      >
        {books.map((book) => {
          const clickable = !book.soon && Boolean(onBookClick);
          return (
            <Box
              key={book.id}
              data-testid={`book-${book.id}`}
              data-book={book.soon ? undefined : book.id}
              borderRadius="6px"
              overflow="hidden"
              boxShadow="sm"
              cursor={book.soon ? 'default' : 'pointer'}
              transition="transform 0.3s ease, box-shadow 0.3s ease"
              _hover={
                book.soon
                  ? undefined
                  : { transform: 'translateY(-4px)', boxShadow: 'lg' }
              }
              onClick={clickable ? () => onBookClick?.(book.id) : undefined}
            >
              <Box
                position="relative"
                aspectRatio={{ base: 3 / 2, md: 4 / 3 }}
                overflow="hidden"
              >
                {book.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={book.image}
                    alt={book.alt}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <Box
                    data-testid={`book-${book.id}-placeholder`}
                    width="100%"
                    height="100%"
                    bg="borderSoft"
                  />
                )}
                {book.soon && <SoonBadge label={soonLabel} overlay />}
              </Box>
              <Box
                padding="0.6rem"
                textAlign="center"
                fontSize="base"
                color={labelFg}
                fontWeight="regular"
                bg={labelBg}
              >
                {book.label}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
