// src/data/bichittos.ts
// Content-level data for the Bichittos page: character positions inside each
// DSMainCard scene and the Zeco mascot configuration. This is NOT theme data
// (it describes which images go where), so it lives under `data/`, not `theme/`.

import type { Character, Mascot } from '@/components/DSMainCard/DSMainCard';
import type { CreatureId } from '@/theme/creatures';

export const characterPositions: Record<CreatureId, Character[]> = {
  napcat: [
    { image: '/imgs/characters/napcat/napcat-sonequinha.png', x: 55, y: 0, size: 360, zIndex: 2,
      xl: { x: 58, size: 340 }, xxl: { x: 62, size: 320 } },
    { image: '/imgs/characters/napcat/violeta.png', x: 82, y: 0, size: 350, zIndex: 1,
      xl: { x: 78, size: 330 }, xxl: { x: 75, size: 310 } },
  ],
  zeco: [
    { image: '/imgs/characters/zeco/zeco_comendo_picole.png', x: 55, y: 0, size: 400, zIndex: 3,
      xl: { x: 58, size: 380 }, xxl: { x: 62, size: 360 } },
    { image: '/imgs/characters/zeco/Rui_Merengue_comendo_compota.png', x: 85, y: 0, size: 280, zIndex: 1,
      xl: { x: 80, size: 260 }, xxl: { x: 76, size: 250 } },
  ],
  taylo: [
    { image: '/imgs/characters/taylo/taylo.png', x: 80, y: 0, size: 400, zIndex: 3,
      xl: { x: 75, size: 380 }, xxl: { x: 72, size: 360 } },
    { image: '/imgs/characters/taylo/pitu.png', x: 55, y: 0, size: 200, zIndex: 2, mobileY: 90,
      xl: { x: 58, size: 190 }, xxl: { x: 60, size: 180 } },
  ],
  miscelania: [
    { image: '/imgs/characters/miscelania/querie_dancando.gif', x: 55, y: 0, size: 100, zIndex: 2, mobileY: 85, mobileScale: 0.55,
      xl: { x: 58 }, xxl: { x: 62 } },
    { image: '/imgs/characters/miscelania/Cheio_Bolinha_voando.png', x: 82, y: 30, size: 200, zIndex: 1, mobileY: 100, mobileScale: 0.7,
      xl: { x: 78 }, xxl: { x: 75 } },
    { image: '/imgs/characters/miscelania/malmo.png', x: 5, y: 0, size: 100, zIndex: 1 },
  ],
};

export const zecoMascot: Mascot = {
  image: '/imgs/characters/zeco/ninha_apaixonada.png',
  size: 100,
  offsetX: 15,
  offsetY: -70,
  mobileScale: 0.5,
  mobileOffsetY: -30,
};
