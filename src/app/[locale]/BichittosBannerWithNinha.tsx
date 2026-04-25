'use client';
import { useState } from 'react';
import { Box } from '@chakra-ui/react';
import { HomeBanner } from '@/components/HomeBanner';
import { palettes } from '@/theme/palettes';

interface BichittosBannerWithNinhaProps {
  href: string;
  label: string;
  title: string;
  description: string;
}

/**
 * Home banner for Bichittos with the cinematic Zeco + Ninha reveal.
 *
 * - Zeco: hidden (opacity 0) in neutral; fades in on hover, stays visible
 *   while hover is active.
 * - Ninha: flies in on the first hover and lands on top of the title;
 *   stays landed forever after (even when hover leaves).
 */
export function BichittosBannerWithNinha({
  href,
  label,
  title,
  description,
}: BichittosBannerWithNinhaProps) {
  const [hover, setHover] = useState(false);
  // Mobile: primeiro tap ativa o efeito, segundo tap navega.
  // Controlamos via `tapActive` e interceptamos o click do Link.
  const [tapActive, setTapActive] = useState(false);

  const isActive = hover || tapActive;

  // Intercepta o clique: no mobile, se ainda não foi ativado, previne a
  // navegação e ativa o efeito. Segundo toque navega normalmente.
  // Desktop (com hover) nunca entra nessa lógica porque o click é direto.
  const handleClick = (e: React.MouseEvent) => {
    if (typeof window === 'undefined') return;
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (isTouch && !tapActive) {
      e.preventDefault();
      setTapActive(true);
    }
  };

  return (
    <Box
      className="group"
      data-active={isActive ? 'true' : undefined}
      position="relative"
      height="100%"
      display="flex"
      alignItems="flex-end"
      justifyContent="flex-end"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={handleClick}
      css={{
        // Quando ativo (hover no desktop ou primeiro tap no mobile),
        // o topo do textblock (legenda de cima) ancora em top 5% do banner.
        '&[data-active="true"] [data-textblock]': {
          justifyContent: 'flex-start',
          paddingTop: '5%',
        },
        // Só o fundo gradient do banner fica transparente quando ativo —
        // texto e labels ficam 100% opacos.
        '& [data-bannerbg]': {
          transition: 'opacity 0.5s ease',
        },
        '&[data-active="true"] [data-bannerbg]': {
          opacity: 0.4,
        },
        // Imagem de fundo (invernocena) aparece quando ativo.
        '&[data-active="true"] [data-bgscene]': {
          opacity: 1,
        },
        // Personagens escondidos (Zeco, Napcat, Rui, Ninha) usam
        // _groupHover no desktop; no mobile, o data-active também ativa.
        '&[data-active="true"] [data-hidden-char]': {
          opacity: 1,
        },
      }}
    >
      {/* Camada de imagem (invernocena) — atrás do banner. Invisível no
          neutro, aparece no hover junto com o banner virando transparente. */}
      <Box
        data-bgscene
        position="absolute"
        inset={0}
        zIndex={0}
        backgroundImage="url('/imgs/banners/invernocena.png')"
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
        opacity={0}
        transition="opacity 0.5s ease"
        pointerEvents="none"
      />
      {/* HomeBanner normal — só o .banner-bg interno fica transparente no
          hover (regra no css do wrapper). Texto/labels ficam intactos. */}
      <Box position="absolute" inset={0} zIndex={1}>
        <HomeBanner
          href={href}
          label={label}
          title={title}
          description={description}
          variant="bichittos"
          height={{ base: '60vh', md: '85vh' }}
          minHeight={{ base: '340px', md: '595px' }}
          titleColor={isActive ? palettes.zeco.colors[0] : undefined}
          labelColor={isActive ? palettes.zeco.colors[0] : undefined}
          descriptionColor={isActive ? palettes.zeco.colors[0] : undefined}
        />
      </Box>

      {/* Zeco escondido: invisível no neutro, aparece no hover/ativo. */}
      <Box
        data-hidden-char
        position="relative"
        height={{ base: '30%', md: '55%' }}
        width="auto"
        pointerEvents="none"
        transform="translateX(27%)"
        transformOrigin="bottom right"
        opacity={0}
        transition="opacity 0.4s ease"
        _groupHover={{
          opacity: 1,
        }}
        zIndex={999}
      >
        <Box
          as="img"
          src="/imgs/bichittos/zeco/zeco_escondido.png"
          alt=""
          aria-hidden
          height="100%"
          width="auto"
          display="block"
          mb="0"
          transform="scaleX(-1)"
        />
      </Box>

      {/* Napcat soneca — mesmo padrão do Rui: altura em %, width auto,
          só fade in no hover. zIndex 0 pra ficar atrás do gradient do
          banner (transparente no hover).
          Posição: mobile canto esquerdo inferior (10%/30%), desktop canto
          superior direito (top 15% / right 2%). */}
      <Box
        data-hidden-char
        position="absolute"
        top={{ base: 'auto', md: '15%' }}
        bottom={{ base: '40%', md: 'auto' }}
        left={{ base: '10%', md: 'auto' }}
        right={{ base: 'auto', md: '2%' }}
        height={{ base: '15%', md: '18%' }}
        width="auto"
        pointerEvents="none"
        opacity={0}
        transition="opacity 0.4s ease"
        _groupHover={{
          opacity: 1,
        }}
        zIndex={0}
      >
        <Box
          as="img"
          src="/imgs/bichittos/napcat/napcat_soneca.png"
          alt=""
          aria-hidden
          height="100%"
          width="auto"
          display="block"
        />
      </Box>

      {/* Rui Merengue jogando bolinha — lado esquerdo do banner.
          Invisível no neutro, aparece no hover. */}
      <Box
        data-hidden-char
        position="absolute"
        bottom="20px"
        left="4%"
        height={{ base: '18%', md: '30%' }}
        width="auto"
        pointerEvents="none"
        opacity={0}
        transition="opacity 0.4s ease"
        _groupHover={{
          opacity: 1,
        }}
        zIndex={400}
      >
        <Box
          as="img"
          src="/imgs/bichittos/zeco/Rui_Merengue_joga_bolinha.png"
          alt=""
          aria-hidden
          height="100%"
          width="auto"
          display="block"
        />
      </Box>

      {/* Ninha: aparece pousada no topo do título enquanto o banner está
          em hover, e some quando sai (igual Zeco e Napcat). */}
      <Box
        data-hidden-char
        position="absolute"
        top="calc(27%)"
        left="55%"
        height={{ base: '10%', md: '14%' }}
        width="auto"
        pointerEvents="none"
        transformOrigin="center"
        zIndex={0}
        transform="translate(-40%, -40%)"
        opacity={0}
        transition="opacity 0.4s ease"
        _groupHover={{
          opacity: 1,
        }}
      >
        <Box
          as="img"
          src="/imgs/bichittos/zeco/ninha_apaixonada.png"
          alt=""
          aria-hidden
          height="90%"
          width="auto"
          display="block"
        />
      </Box>
    </Box>
  );
}
