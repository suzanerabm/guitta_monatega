// src/data/bichittos.ts
// Content-level data for the Bichittos page: character positions inside each
// DSMainCard scene and the Zeco mascot configuration. This is NOT theme data
// (it describes which images go where), so it lives under `data/`, not `theme/`.

import type { Character, Mascot } from '@/components/DSMainCard/DSMainCard';
import type { CreatureId } from '@/theme/creatures';

export const characterPositions: Record<CreatureId, Character[]> = {
  napcat: [
    { image: '/imgs/characters/napcat/napcat-sonequinha.png', x: 55, y: 0, size: 360, zIndex: 2,
      md: { size: 270 }, xl: { x: 58, size: 450 }, xxl: { x: 55, size: 520 } },
    { image: '/imgs/characters/napcat/violeta.png', x: 82, y: 0, size: 350, zIndex: 1,
      md: { size: 265 }, xl: { x: 78, size: 440 }, xxl: { x: 78, size: 500 } },
  ],
  zeco: [
    { image: '/imgs/characters/zeco/01_zeco_comendo_picole.png', x: 55, y: 0, size: 400, zIndex: 3,
      md: { size: 300 }, xl: { x: 58, size: 500 }, xxl: { x: 55, size: 580 } },
    { image: '/imgs/characters/zeco/02_Rui_Merengue_comendo_compota.png', x: 85, y: 0, size: 280, zIndex: 1,
      md: { size: 210 }, xl: { x: 80, size: 350 }, xxl: { x: 80, size: 400 } },
  ],
  taylo: [
    { image: '/imgs/characters/taylo/01_taylo.png', x: 80, y: 0, size: 400, zIndex: 3,
      md: { size: 300 }, xl: { x: 75, size: 500 }, xxl: { x: 80, size: 580 } },
    { image: '/imgs/characters/taylo/02_pitu.png', x: 55, y: 0, size: 200, zIndex: 2, mobileY: 90,
      md: { size: 150 }, xl: { x: 58, size: 250 }, xxl: { x: 55, size: 290 } },
  ],
  miscelania: [
    { image: '/imgs/characters/miscelania/malmo.png', x: 5, y: 0, size: 100, zIndex: 1 },
    // Ratinhos extras — só no 3xl+
   
  ],
  cheiodebolinha: [
    { image: '/imgs/characters/cheiodebolinha/querie_dancando.gif', x: 55, y: 0, size: 100, zIndex: 2, mobileY: 85, mobileScale: 0.55,
      md: { size: 75 }, xl: { x: 58, size: 100 }, xxl: { x: 55, size: 100 } },
    { image: '/imgs/characters/cheiodebolinha/Cheio_Bolinha_voando.png', x: 75, y: 30, size: 200, zIndex: 1, mobileY: 100, mobileScale: 0.7,
      md: { size: 220 }, xl: { x: 72, size: 260 }, xxl: { x: 78, size: 380 }, animation: 'floatDeep 4s ease-in-out infinite' },
    // Ratinhos extras — só no 3xl+
    { image: '/imgs/characters/cheiodebolinha/querie_bravo.gif', x: 70, y: 0, size: 100, zIndex: 2, minBreakpoint: 'xxl' },
    { image: '/imgs/characters/cheiodebolinha/querie_love.gif', x: 80, y: 0, size: 100, zIndex: 2, minBreakpoint: 'xxl' },
    { image: '/imgs/characters/cheiodebolinha/querie_piscando.gif', x: 83, y: 0, size: 100, zIndex: 2, minBreakpoint: 'xxl' },
    { image: '/imgs/characters/cheiodebolinha/querie_triste.gif', x: 88, y: 0, size: 100, zIndex: 2, minBreakpoint: 'xxl' },
  ],
};

export const zecoMascot: Mascot = {
  image: '/imgs/characters/zeco/03_ninha_apaixonada.png',
  size: 100,
  offsetX: 15,
  offsetY: -70,
  mobileScale: 0.5,
  mobileOffsetY: -30,
};
