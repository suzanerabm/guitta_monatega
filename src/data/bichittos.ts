// src/data/bichittos.ts
// Content-level data for the Bichittos page: character positions inside each
// DSMainCard scene and the Zeco mascot configuration. This is NOT theme data
// (it describes which images go where), so it lives under `data/`, not `theme/`.

import type { Character, Mascot } from '@/components/DSMainCard/DSMainCard';
import type { CreatureId } from '@/theme/palettes';

export const characterPositions: Record<CreatureId, Character[]> = {
  napcat: [
    { image: '/imgs/bichittos/napcat/napcat-sonequinha.png', x: 55, y: 0, size: 360, zIndex: 2,
      md: { size: 340 }, xl: { x: 58, size: 560 }, xxl: { x: 55, size: 650 } },
    { image: '/imgs/bichittos/napcat/violeta.png', x: 82, y: 0, size: 350, zIndex: 1,
      md: { size: 330 }, xl: { x: 78, size: 550 }, xxl: { x: 78, size: 625 } },
  ],
  zeco: [
    { image: '/imgs/bichittos/zeco/01_zeco_comendo_picole.png', x: 55, y: 0, size: 400, zIndex: 3,
      md: { size: 375 }, xl: { x: 58, size: 625 }, xxl: { x: 55, size: 725 } },
    { image: '/imgs/bichittos/zeco/02_Rui_Merengue_comendo_compota.png', x: 85, y: 0, size: 280, zIndex: 1,
      md: { size: 265 }, xl: { x: 80, size: 440 }, xxl: { x: 80, size: 500 } },
  ],
  taylo: [
    { image: '/imgs/bichittos/taylo/01_taylo.png', x: 80, y: 0, size: 400, zIndex: 3,
      md: { size: 375 }, xl: { x: 75, size: 625 }, xxl: { x: 80, size: 725 } },
    { image: '/imgs/bichittos/taylo/02_pitu.png', x: 55, y: 0, size: 200, zIndex: 2, mobileY: 90,
      md: { size: 190 }, xl: { x: 58, size: 315 }, xxl: { x: 55, size: 365 } },
  ],
  miscelania: [
    // { image: '/imgs/bichittos/miscelania/malmo.png', x: 5, y: 0, size: 100, zIndex: 1 },
    // Ratinhos extras — só no 3xl+
   
  ],
  cheiodebolinha: [
    { image: '/imgs/bichittos/cheiodebolinha/querie_dancando.gif', x: 55, y: 0, size: 100, zIndex: 2, mobileY: 85, mobileScale: 0.55,
      md: { size: 95 }, xl: { x: 58, size: 125 }, xxl: { x: 55, size: 125 } },
    { image: '/imgs/bichittos/cheiodebolinha/Cheio_Bolinha_voando.png', x: 60, y: 30, size: 200, zIndex: 1, mobileY: 100, mobileScale: 0.7,
      md: { size: 275 }, xl: { x: 57, size: 325 }, xxl: { x: 63, size: 475 }, animation: 'floatDeep 4s ease-in-out infinite' },
    // Ratinhos extras — só no 3xl+
    { image: '/imgs/bichittos/cheiodebolinha/querie_bravo.gif', x: 70, y: 0, size: 100, zIndex: 2, minBreakpoint: 'xxl' },
    { image: '/imgs/bichittos/cheiodebolinha/querie_love.gif', x: 80, y: 0, size: 100, zIndex: 2, minBreakpoint: 'xxl' },
    { image: '/imgs/bichittos/cheiodebolinha/querie_piscando.gif', x: 83, y: 0, size: 100, zIndex: 2, minBreakpoint: 'xxl' },
    { image: '/imgs/bichittos/cheiodebolinha/querie_triste.gif', x: 88, y: 0, size: 100, zIndex: 2, minBreakpoint: 'xxl' },
  ],
};

export const zecoMascot: Mascot = {
  image: '/imgs/bichittos/zeco/03_ninha_apaixonada.png',
  size: 100,
  offsetX: 15,
  offsetY: -70,
  mobileScale: 0.5,
  mobileOffsetY: -30,
};

/** Um clipe de vídeo de um bichitto (carrossel "1 por vez" na página). */
export interface BichittoVideo {
  /** Caminho do .mp4 (relativo a /public). O .webm irmão é oferecido sozinho. */
  src: string;
  /** Imagem de capa mostrada até o vídeo tocar. */
  poster: string;
  /** Rótulo curto do clipe. */
  label: string;
}

/**
 * Vídeos por bichitto. Só aparecem na página os bichittos que têm itens aqui
 * (hoje só o Zeco). Adicione entradas conforme novos vídeos forem criados.
 */
export const bichittoVideos: Partial<Record<CreatureId, BichittoVideo[]>> = {
  zeco: [
    {
      src: '/imgs/bichittos/zeco/zeco_jogando_bolinha.mp4',
      poster: '/imgs/bichittos/zeco/zeco_jogando_bolinha_poster.jpg',
      label: 'Jogando bolinha',
    },
    {
      src: '/imgs/bichittos/zeco/zeco_jogando_ioio.mp4',
      poster: '/imgs/bichittos/zeco/zeco_jogando_ioio_poster.jpg',
      label: 'Jogando ioiô',
    },
  ],
};
