'use client';

import { useMemo, useRef, useState } from 'react';
import { Box, Flex, Text, chakra } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { HomeBanner } from '@/components/HomeBanner';
import {
  KammaraPlanetCard,
  type KammaraPlanetCardProps,
} from '@/components/KammaraPlanetCard';
import type { MosaicClip } from '@/components/KammaraDropsMosaic';
import { palettes } from '@/theme/palettes';

type CompactPlanet = Pick<
  KammaraPlanetCardProps,
  | 'id'
  | 'name'
  | 'summary'
  | 'image'
  | 'crestGlyph'
  | 'color'
  | 'darkColor'
  | 'badges'
>;

interface KammaraBannerWithPlanetsProps {
  href: string;
  label: string;
  title: string;
  description: string;
  planetLabel: string;
  planets: CompactPlanet[];
  drops: MosaicClip[];
}

/** Kammara hero with four compact variants of the canonical planet card. */
export function KammaraBannerWithPlanets({
  href,
  label,
  title,
  description,
  planetLabel,
  planets,
  drops,
}: KammaraBannerWithPlanetsProps) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const dropsByPlanet = useMemo(
    () =>
      Object.fromEntries(
        planets.map((planet) => [
          planet.id,
          drops.filter((drop) => drop.worldId === planet.id),
        ]),
      ),
    [drops, planets],
  );
  const pageCount = Math.min(
    ...planets.map((planet) => dropsByPlanet[planet.id]?.length ?? 0),
  );

  const changePage = (direction: -1 | 1) => {
    if (pageCount < 2) return;
    setPage((current) => (current + direction + pageCount) % pageCount);
  };

  return (
    <Box
      as="section"
      overflow="hidden"
      background={palettes.kammara.gradient}
      paddingBottom="homeBannerCardsInset"
    >
      <HomeBanner
        href={href}
        label={label}
        title={title}
        description={description}
        variant="kammara"
        showBackground={false}
        height={{ base: '20vh', md: '23vh' }}
        minHeight={{ base: '110px', md: '160px' }}
      />

      <Box
        width="homeBannerCardsWidth"
        marginX="auto"
        padding="homePlanetFrameOffset"
        onTouchStart={(event) => {
          const touch = event.touches[0];
          touchStart.current = { x: touch.clientX, y: touch.clientY };
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          const touch = event.changedTouches[0];
          touchStart.current = null;
          if (!start || !touch) return;
          const deltaX = touch.clientX - start.x;
          const deltaY = touch.clientY - start.y;
          if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
            changePage(deltaX < 0 ? 1 : -1);
          }
        }}
      >
        <Box
          display="grid"
          gridTemplateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
          aspectRatio={{ base: '1 / 1', md: '3 / 1' }}
          borderRadius="homePlanetCompact"
          overflow="hidden"
        >
          {planets.map((planet) => {
            const drop = dropsByPlanet[planet.id]?.[page];
            return (
              <KammaraPlanetCard
                key={`${planet.id}-${drop?.video ?? page}`}
                {...planet}
                dropVideo={drop?.video}
                dropPoster={drop?.poster}
                category={planetLabel}
                variant="compact"
                onSelect={(id) => router.push(`${href}?planet=${id}`)}
              />
            );
          })}
        </Box>
      </Box>

      {pageCount > 1 && (
        <Flex
          width="homeBannerCardsWidth"
          marginX="auto"
          paddingTop="sm"
          align="center"
          justify="center"
          gap="md"
        >
          <chakra.button
            type="button"
            aria-label="Drops anteriores"
            onClick={() => changePage(-1)}
            fontFamily="glyph"
            fontSize="glyphH3"
            color="textOverlayBright"
          >
            ⊷
          </chakra.button>
          <Text
            m={0}
            textStyle="heading"
            fontSize="xs"
            color="bannerLabel"
            letterSpacing="wide"
          >
            {page + 1} / {pageCount}
          </Text>
          <chakra.button
            type="button"
            aria-label="Próximos drops"
            onClick={() => changePage(1)}
            fontFamily="glyph"
            fontSize="glyphH3"
            color="textOverlayBright"
          >
            ⊶
          </chakra.button>
        </Flex>
      )}
    </Box>
  );
}
