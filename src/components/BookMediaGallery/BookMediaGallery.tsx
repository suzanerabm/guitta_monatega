'use client';

import { useState } from 'react';
import { Box, Button, Image, Text, chakra } from '@chakra-ui/react';
import { Play } from 'lucide-react';
import type { BookMedia } from '@/lib/bookCatalog';
import { bookPageLayout } from '@/theme/bookPages';

interface BookMediaGalleryProps {
  cover: string;
  bookTitle: string;
  items: BookMedia[];
  accentColor: string;
  frameColor: string;
  coverLabel: string;
  galleryLabel: string;
  videoFallback: string;
}

export function BookMediaGallery({
  cover,
  bookTitle,
  items,
  accentColor,
  frameColor,
  coverLabel,
  galleryLabel,
  videoFallback,
}: BookMediaGalleryProps) {
  const coverItem: BookMedia = {
    id: 'cover',
    type: 'image',
    src: cover,
    alt: `${coverLabel}: ${bookTitle}`,
  };
  const media = [coverItem, ...items];
  const [selectedId, setSelectedId] = useState(coverItem.id);
  const selected = media.find((item) => item.id === selectedId) ?? coverItem;

  return (
    <Box width="100%" minW="0">
      <Box
        overflow="hidden"
        borderRadius={bookPageLayout.detailCoverRadius}
        background="white"
        aspectRatio={bookPageLayout.detailMediaAspectRatio}
      >
        {selected.type === 'video' ? (
          <chakra.video
            key={selected.src}
            controls
            playsInline
            preload="metadata"
            poster={selected.poster ?? cover}
            width="100%"
            height="100%"
            objectFit="contain"
            aria-label={selected.alt}
          >
            {selected.src.endsWith('.mp4') && (
              <source
                src={selected.src.replace(/\.mp4$/, '.webm')}
                type="video/webm"
              />
            )}
            <source src={selected.src} />
            {videoFallback}
          </chakra.video>
        ) : (
          <Image
            key={selected.src}
            src={selected.src}
            alt={selected.alt}
            width="100%"
            height="100%"
            objectFit="contain"
            decoding="async"
          />
        )}
      </Box>

      {selected.caption && (
        <Text
          fontSize="xs"
          color="inkMuted"
          lineHeight="bookCardCompact"
          mt="sm"
        >
          {selected.caption}
        </Text>
      )}

      {items.length > 0 && (
        <Box
          aria-label={galleryLabel}
          display="flex"
          gap="sm"
          overflowX="auto"
          pt="md"
          pb="sm"
        >
          {media.map((item) => {
            const selectedItem = item.id === selected.id;
            const thumbnail = item.type === 'video' ? item.poster ?? cover : item.src;

            return (
              <Button
                key={item.id}
                type="button"
                aria-pressed={selectedItem}
                aria-label={item.alt}
                onClick={() => setSelectedId(item.id)}
                position="relative"
                flex="0 0 auto"
                width="bookMediaThumbnail"
                minWidth="bookMediaThumbnail"
                height="bookMediaThumbnail"
                p="2xs"
                overflow="hidden"
                background="white"
                border="1px solid"
                borderColor={selectedItem ? accentColor : frameColor}
                borderRadius="bookMediaThumbnail"
                boxShadow={selectedItem ? 'card' : 'none'}
                transitionProperty="border-color, opacity"
                transitionDuration="default"
                _hover={{ opacity: 0.78 }}
              >
                <Image
                  src={thumbnail}
                  alt=""
                  aria-hidden="true"
                  width="100%"
                  height="100%"
                  objectFit="cover"
                  borderRadius="bookMediaThumbnailInner"
                />
                {item.type === 'video' && (
                  <Box
                    position="absolute"
                    inset={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    background="bgOverlay"
                    aria-hidden="true"
                  >
                    <Play size={bookPageLayout.detailMediaPlayIconSize} />
                  </Box>
                )}
              </Button>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
