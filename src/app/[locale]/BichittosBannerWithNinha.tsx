import { Box, Image } from '@chakra-ui/react';
import NextLink from 'next/link';
import { ConnectedCardFrame } from '@/components/ConnectedCardFrame';
import { HomeBanner } from '@/components/HomeBanner';
import { mediaUrl } from '@/lib/media';
import { palettes } from '@/theme/palettes';

interface BichittosBannerWithNinhaProps {
  href: string;
  label: string;
  title: string;
  description: string;
}

const characterCards = [
  {
    id: 'napcat',
    label: 'Napcat',
    color: palettes.napcat.bichittos?.accent ?? palettes.napcat.colors[0],
    image: mediaUrl('/imgs/banners/005-napcat-institucional-so-nome-v1.png'),
  },
  {
    id: 'zeco',
    label: 'Zeco',
    color: palettes.zeco.bichittos?.accent ?? palettes.zeco.colors[0],
    image: mediaUrl('/imgs/banners/005-zeco-institucional-so-nome-v1.png'),
  },
  {
    id: 'taylo',
    label: 'Taylo',
    color: palettes.taylo.bichittos?.accent ?? palettes.taylo.colors[0],
    image: mediaUrl('/imgs/banners/005-taylo-institucional-so-nome-v1.png'),
  },
  {
    id: 'cheiodebolinha',
    label: 'Cheio de Bolinha',
    color:
      palettes.cheiodebolinha.bichittos?.accent ??
      palettes.cheiodebolinha.colors[0],
    image: mediaUrl(
      '/imgs/banners/005-cheio-de-bolinha-institucional-nomes-v2.png',
    ),
  },
] as const;

/** Orange Bichittos hero with a compact four-character card strip. */
export function BichittosBannerWithNinha({
  href,
  label,
  title,
  description,
}: BichittosBannerWithNinhaProps) {
  return (
    <Box
      as="section"
      overflow="hidden"
      background={palettes.bichittos.gradient}
      paddingBottom="homeBannerCardsInset"
    >
      <HomeBanner
        href={href}
        label={label}
        title={title}
        description={description}
        variant="bichittos"
        showBackground={false}
        height={{ base: '20vh', md: '23vh' }}
        minHeight={{ base: '110px', md: '160px' }}
      />

      <ConnectedCardFrame
        colors={characterCards.map((character) => character.color)}
        negativeBackground={palettes.bichittos.gradient}
        mobileAspectRatio="3 / 4"
      >
        {characterCards.map((character) => (
          <Box
            key={character.id}
            asChild
            overflow="hidden"
            cursor="pointer"
            focusRing="inside"
            focusRingColor="ink"
            _hover={{
              '& img': { transform: 'scale(1.06)' },
            }}
          >
            <NextLink
              href={`${href}?bichitto=${character.id}`}
              aria-label={`${title}: ${character.label}`}
            >
              <Image
                src={character.image}
                alt=""
                aria-hidden
                width="100%"
                height="100%"
                objectFit="contain"
                display="block"
                transitionProperty="transform"
                transitionDuration="slow"
                _motionReduce={{ transition: 'none' }}
              />
            </NextLink>
          </Box>
        ))}
      </ConnectedCardFrame>
    </Box>
  );
}
