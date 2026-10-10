'use client';

import { Box } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { HomeBanner } from '@/components/HomeBanner';
import {
  KammaraPlanetCard,
  type KammaraPlanetCardProps,
} from '@/components/KammaraPlanetCard';
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
}

/** Kammara hero with four compact variants of the canonical planet card. */
export function KammaraBannerWithPlanets({
  href,
  label,
  title,
  description,
  planetLabel,
  planets,
}: KammaraBannerWithPlanetsProps) {
  const router = useRouter();

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
        display="grid"
        gridTemplateColumns="repeat(4, 1fr)"
        aspectRatio="3 / 1"
        width="homeBannerCardsWidth"
        marginX="auto"
      >
        {planets.map((planet) => (
          <KammaraPlanetCard
            key={planet.id}
            {...planet}
            category={planetLabel}
            variant="compact"
            onSelect={(id) => router.push(`${href}?planet=${id}`)}
          />
        ))}
      </Box>
    </Box>
  );
}
