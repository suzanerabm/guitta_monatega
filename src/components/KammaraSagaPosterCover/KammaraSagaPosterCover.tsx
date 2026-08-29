'use client';
import { Box } from '@chakra-ui/react';
import {
  KammaraSagaPoster,
  type KammaraSagaPosterProps,
  type PosterHero,
} from '@/components/KammaraSagaPoster';

export type KammaraSagaPosterCoverProps = KammaraSagaPosterProps;

// Heróis da capa: MESMAS posições/tamanhos/glow do DEFAULT_HEROES do pôster,
// só com as artes em alta resolução (public/imgs/kammara/_capa/, ~2000px).
// Trocar apenas o `image` mantém tudo no lugar. Vale só pra capa; o componente
// original continua com as imagens pequenas.
const COVER_HEROES: PosterHero[] = [
  { image: '/imgs/kammara/_capa/orvian-v2.png', alt: 'Orvian', side: 'left', x: 0, bottom: 35.0, height: 42, glow: '#5a9ee0', brightness: 0.8, z: 3 },
  { image: '/imgs/kammara/_capa/selka-rin.png', alt: 'SELKA RIN', side: 'right', x: -2.8, bottom: 18.9, height: 42.4, glow: '#b8a9e8', z: 5 },
  { image: '/imgs/kammara/_capa/kael-torin.png', alt: 'KAEL TORIN', side: 'right', x: 17.2, bottom: 33.3, height: 28.9, glow: '#e0b87e', brightness: 0.85, z: 4 },
  { image: '/imgs/kammara/_capa/luma-val.png', alt: 'LUMA VAL', side: 'left', x: 1, bottom: 10, height: 24.8, glow: '#7ee0c0', z: 5 },
  { image: '/imgs/kammara/_capa/lumesha.png', alt: 'Lumesha', side: 'right', x: 0.8, bottom: 13, height: 16, glow: '#e07e9e', z: 5 },
  { image: '/imgs/kammara/_capa/erurin.png', alt: 'EruRin', side: 'center', x: 1, bottom: 9.3, height: 35, glow: '#b8a9e8', z: 7 },
];

// Lún'kai da capa — orbes de pó de fada prontos (PNG com brilho + partículas),
// não as imagens dos personagens: eles só BRILHAM. Brisa (verde/ciano) junto do
// EruRin; Flor-Lume (rosa) junto da Lumesha. Renderizados com mix-blend-mode
// `screen` pra o brilho somar na cena. `left`/`top`/`w` em % da capa.
interface CoverOrb { image: string; left: number; top: number; w: number; }
const COVER_ORBS: CoverOrb[] = [
  { image: '/imgs/kammara/_capa/lunkai-brisa.png', left: 55, top: 57, w: 13 },     // Brisa — no EruRin (centro-baixo)
  { image: '/imgs/kammara/_capa/lunkai-florlume.png', left: 74, top: 72, w: 11 },  // Flor-Lume — na Lumesha (dir. baixo)
];

/**
 * KammaraSagaPosterCover — variante 1:1,6 (capa de EPUB) do KammaraSagaPoster.
 *
 * Reusa o poster inteiro; só troca a moldura de 2:3 para 1000/1600 (mais alta).
 * Os heróis mantêm tamanho — o espaço vertical extra vira respiro no topo.
 * O poster interno preenche 100% do container do cover.
 */
export function KammaraSagaPosterCover({
  'data-testid': testId,
  frozen = true,
  heroes = COVER_HEROES,
  ...posterProps
}: KammaraSagaPosterCoverProps) {
  return (
    <Box
      data-testid={testId ?? 'kammara-saga-poster-cover'}
      position="relative"
      width="100%"
      style={{ aspectRatio: '1000 / 1600' }}
    >
      {/* O poster tem aspectRatio 360/540 e maxW=420px próprios. Aqui ele
          precisa preencher a moldura 1:1,6 inteira: forçamos width/height 100%,
          soltamos o maxW e anulamos o aspectRatio para o Box do poster esticar
          até 1000×1600. Os heróis são <img width:auto> — NÃO distorcem; só a
          moldura fica mais alta, e o espaço extra vira respiro no topo. */}
      <Box
        position="absolute"
        inset={0}
        css={{
          '& > [data-testid="kammara-saga-poster"]': {
            width: '100%',
            height: '100%',
            maxWidth: 'none',
            aspectRatio: 'auto',
            // Capa de livro tem cantos retos (o pôster do site é arredondado).
            borderRadius: 0,
          },
          // Só na capa: aumenta o wordmark do título. O componente original NÃO
          // muda. O bloco título+subtítulo é o div com dois <span> irmãos que
          // NÃO contém [aria-label] (esse é o rodapé). Título = primeiro span,
          // subtítulo = segundo span. Só a capa aplica isso.
          '& [data-testid="kammara-saga-poster"] div:has(> span + span):not(:has([aria-label])) > span:first-child':
            {
              fontSize: '8rem', // KAMMARA — +25%
              lineHeight: 1,
            },
          '& [data-testid="kammara-saga-poster"] div:has(> span + span):not(:has([aria-label])) > span:last-child':
            {
              fontSize: '1rem', // A·S·A·G·A — +25%
            },
          // KAMMARA (topo): é o único <p> fora do rodapé (o rodapé tem aria-label).
          // Mesmo peso do título SAGA ORF-V (bold).
          '& [data-testid="kammara-saga-poster"] > p': {
            fontSize: '4.2rem',
            fontWeight: 700,
            letterSpacing: '1.2rem',
            opacity: 1,
          },
          // Rodapé: o bloco tem [aria-label] no glifo ⊹⊙⊹. Aumenta o glifo e o
          // texto (footerLabel) juntos, só na capa.
          '& [data-testid="kammara-saga-poster"] div:has(> [aria-label])': {
            fontSize: '1.1rem', // glifo ⊹ ⊙ ⊹
          },
          '& [data-testid="kammara-saga-poster"] div:has(> [aria-label]) p': {
            fontSize: '1rem', // texto do rodapé (footerLabel)
          },
        }}
      >
        {/* lunkais=[] desliga o pó de fada CSS do pôster — na capa usamos os
            orbes prontos abaixo. */}
        <KammaraSagaPoster
          frozen={frozen}
          heroes={heroes}
          lunkais={[]}
          topLabel="KAMMARA"
          title="SAGA ORF-V"
          subtitle="VOLUME 1"
          {...posterProps}
        />
      </Box>

      {/* "UNIVERSO" — rótulo pequeno acima do KAMMARA do topo. Desenhado pela
          capa (o topLabel do pôster já é o KAMMARA). Mesma fonte/estilo do
          topo, só menor e um pouco acima. */}
      <Box
        position="absolute"
        top="2.5%"
        left={0}
        right={0}
        textAlign="center"
        zIndex={9}
        css={{
          fontFamily: 'var(--chakra-fonts-body)',
          fontSize: '0.9rem',
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          color: 'var(--chakra-colors-text-overlay-bright, #f5f5f5)',
          opacity: 0.85,
        }}
      >
        Universo
      </Box>

      {/* Orbes de pó de fada (Brisa + Flor-Lume) por cima da cena, somando luz
          com blend `screen`. Puramente decorativos. */}
      {COVER_ORBS.map((orb, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={orb.image}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: `${orb.left}%`,
            top: `${orb.top}%`,
            width: `${orb.w}%`,
            transform: 'translate(-50%, -50%)',
            mixBlendMode: 'screen',
            pointerEvents: 'none',
            zIndex: 8,
          }}
        />
      ))}
    </Box>
  );
}
