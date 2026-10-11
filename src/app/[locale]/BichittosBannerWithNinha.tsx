'use client';

import { useRef, useState } from 'react';
import { Box, Flex, Image, Text, chakra } from '@chakra-ui/react';
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
    titleColor:
      palettes.napcat.bichittos?.name ?? palettes.napcat.colors[2],
    background: palettes.napcat.gradientBg,
    scene: palettes.napcat.bichittos?.bgImage,
    scenePosition: 'center',
    sceneFallback: palettes.napcat.dark,
    slides: [mediaUrl('/imgs/bichittos/napcat/napcat-burp.gif')],
  },
  {
    id: 'zeco',
    label: 'Zeco',
    color: palettes.zeco.bichittos?.accent ?? palettes.zeco.colors[0],
    titleColor: palettes.zeco.bichittos?.name ?? palettes.zeco.dark,
    background: palettes.zeco.gradientBg,
    scene: palettes.zeco.bichittos?.bgImage,
    scenePosition: 'center',
    sceneFallback: palettes.zeco.dark,
    slides: [
      mediaUrl('/imgs/bichittos/zeco/01_zeco_piscando.png'),
      mediaUrl('/imgs/bichittos/zeco/01_zeco_feliz.png'),
      mediaUrl('/imgs/bichittos/zeco/01_zeco_jump.png'),
      mediaUrl('/imgs/bichittos/zeco/01_zeco_tropecou.png'),
    ],
  },
  {
    id: 'taylo',
    label: 'Taylo',
    color: palettes.taylo.bichittos?.accent ?? palettes.taylo.colors[0],
    titleColor: palettes.taylo.bichittos?.name ?? palettes.taylo.colors[0],
    background: palettes.taylo.gradientBg,
    scene: palettes.taylo.bichittos?.bgImage,
    scenePosition: '0% center',
    sceneFallback: palettes.taylo.dark,
    slides: [
      mediaUrl('/imgs/bichittos/taylo/os_dois.png'),
      mediaUrl('/imgs/bichittos/taylo/pitu_chorando.png'),
      mediaUrl('/imgs/bichittos/taylo/tayllo_agachado.png'),
      mediaUrl('/imgs/bichittos/taylo/tayllo_em_pe.png'),
    ],
  },
  {
    id: 'cheiodebolinha',
    label: 'Bobbin',
    color:
      palettes.cheiodebolinha.bichittos?.accent ??
      palettes.cheiodebolinha.colors[0],
    titleColor:
      palettes.cheiodebolinha.bichittos?.name ??
      palettes.cheiodebolinha.colors[2],
    background: palettes.cheiodebolinha.gradientBg,
    scene: palettes.cheiodebolinha.bichittos?.bgImage,
    scenePosition: 'center',
    sceneFallback: palettes.cheiodebolinha.dark,
    slides: [
      mediaUrl('/imgs/bichittos/cheiodebolinha/Cheio_Bolinha.gif'),
      mediaUrl('/imgs/bichittos/cheiodebolinha/Querie.gif'),
      mediaUrl('/imgs/bichittos/cheiodebolinha/querie_dancando.gif'),
      mediaUrl('/imgs/bichittos/cheiodebolinha/querie_feliz.gif'),
    ],
  },
] as const;

/** Orange Bichittos hero with a compact four-character card strip. */
export function BichittosBannerWithNinha({
  href,
  label,
  title,
  description,
}: BichittosBannerWithNinhaProps) {
  const [page, setPage] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const pageCount = Math.max(
    ...characterCards.map((character) => character.slides.length),
  );

  const changePage = (direction: -1 | 1) => {
    setPage((current) => (current + direction + pageCount) % pageCount);
  };

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
        {characterCards.map((character) => {
          const slide = character.slides[page % character.slides.length];
          return (
            <Box
              key={`${character.id}-${slide}`}
              asChild
              position="relative"
              overflow="hidden"
              cursor="pointer"
              focusRing="inside"
              focusRingColor="ink"
              css={{
                backgroundColor: character.sceneFallback,
                backgroundImage: character.scene
                  ? `url(${character.scene})`
                  : character.background,
                backgroundPosition: character.scenePosition,
                backgroundSize: 'cover',
              }}
              _hover={{
                '& img': { transform: 'scale(1.06)' },
              }}
            >
              <NextLink
                href={`${href}?bichitto=${character.id}`}
                aria-label={`${title}: ${character.label}`}
              >
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  height="homeBichittosTitleBandHeight"
                  zIndex={2}
                  pointerEvents="none"
                  css={{
                    background: character.background,
                    maskImage: 'linear-gradient(180deg, black, transparent)',
                  }}
                />
                <Text
                  position="absolute"
                  top="homeBichittosTitleTop"
                  left="homeBichittosTitleInset"
                  right="sm"
                  zIndex={3}
                  m={0}
                  textStyle="heading"
                  fontSize="homeBichittosCardTitle"
                  fontWeight="semibold"
                  letterSpacing="tight"
                  lineHeight={1}
                  textAlign="left"
                  color={character.titleColor}
                  css={{ textShadow: 'var(--chakra-shadows-label-text)' }}
                >
                  {character.label}
                </Text>
              <Image
                src={slide}
                alt=""
                aria-hidden
                position="absolute"
                left="homeBichittosMediaInset"
                bottom={0}
                width="homeBichittosMediaSize"
                height="homeBichittosMediaSize"
                objectFit="contain"
                objectPosition="center bottom"
                display="block"
                transitionProperty="transform"
                transitionDuration="slow"
                _motionReduce={{ transition: 'none' }}
              />
                <Box
                  position="absolute"
                  inset={0}
                  zIndex={1}
                  pointerEvents="none"
                  background="homeBichittosMediaWash"
                  aria-hidden="true"
                />
              </NextLink>
            </Box>
          );
        })}
      </ConnectedCardFrame>

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
            aria-label="Animações anteriores"
            onClick={() => changePage(-1)}
            fontFamily="body"
            fontSize="h3"
            fontWeight="light"
            color="textOverlayBright"
          >
            ‹
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
            aria-label="Próximas animações"
            onClick={() => changePage(1)}
            fontFamily="body"
            fontSize="h3"
            fontWeight="light"
            color="textOverlayBright"
          >
            ›
          </chakra.button>
        </Flex>
      )}
    </Box>
  );
}
