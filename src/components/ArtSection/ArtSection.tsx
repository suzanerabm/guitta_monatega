import { Box, Heading, Text } from '@chakra-ui/react';

interface ArtSectionProps {
  id: string;
  title: string;
  technique: string;
  bg: string;
  titleColor: string;
  techColor: string;
  large?: boolean;
  thumbs: string[];
  hidden?: boolean;
  onThumbClick?: (index: number) => void;
  'data-testid'?: string;
}

export function ArtSection({
  id,
  title,
  technique,
  bg,
  titleColor,
  techColor,
  large = false,
  thumbs,
  hidden = false,
  onThumbClick,
  'data-testid': testId,
}: ArtSectionProps) {
  return (
    <Box
      as="section"
      data-testid={testId}
      data-section-art={id}
      data-hidden={hidden ? 'true' : undefined}
      background={bg}
      padding={hidden ? '0' : '4rem 0'}
      opacity={hidden ? 0 : 1}
      maxHeight={hidden ? '0' : 'none'}
      overflow={hidden ? 'hidden' : undefined}
      transition="opacity 0.5s ease, max-height 0.5s ease"
    >
      <Box maxW="1200px" mx="auto" px={{ base: '1rem', md: '2rem' }}>
        <Heading
          as="h2"
          fontFamily="body"
          fontSize="2xl"
          fontWeight="bold"
          letterSpacing="tight"
          margin="0 0 0.3rem"
          color={titleColor}
        >
          {title}
        </Heading>
        <Text
          fontFamily="body"
          fontSize="sm"
          letterSpacing="wide"
          textTransform="uppercase"
          margin="0 0 2rem"
          color={techColor}
        >
          {technique}
        </Text>
        <Box
          display="grid"
          gap={large ? '8px' : '6px'}
          gridTemplateColumns={
            large
              ? { base: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' }
              : { base: 'repeat(2, 1fr)', md: 'repeat(auto-fill, minmax(220px, 1fr))' }
          }
        >
          {thumbs.map((thumb, idx) => (
            <Box
              key={`${id}-${idx}`}
              cursor="pointer"
              onClick={() => onThumbClick?.(idx)}
              css={{
                '& img': {
                  width: '100%',
                  aspectRatio: '1',
                  objectFit: 'cover',
                  borderRadius: '2px',
                  display: 'block',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                },
                '&:hover img': {
                  transform: 'scale(1.03)',
                  boxShadow: 'var(--chakra-shadows-card)',
                },
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                data-testid={`thumb-${id}-${idx}`}
                data-section={id}
                data-index={idx}
                src={thumb}
                alt={`${title} ${idx + 1}`}
                loading="lazy"
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
