// src/theme/creatures.ts
// Per-creature color overrides used by the Bichittos client.
// These values are aliases of entries inside `palettes.ts` — centralising them
// here lets designers change the visual language of a creature from a single
// place, without editing client components.

import { palettes } from './palettes';

export interface CreatureColors {
  /** Color of the creature's display name. */
  name: string;
  /** Color of the creature's body text. */
  text: string;
  /** Color of the DSMainCard title. */
  titleColor: string;
  /** Color of the DSMainCard body text. */
  textColor: string;
}

export type CreatureId = 'napcat' | 'zeco' | 'taylo' | 'miscelania';

export const creatureColors: Record<CreatureId, CreatureColors> = {
  napcat: {
    name: palettes.napcat.colors[3], // #b5a2dc
    text: palettes.napcat.colors[4], // #ddd4f4
    titleColor: palettes.napcat.colors[5], // #4f0a42
    textColor: palettes.napcat.colors[4], // #ddd4f4
  },
  zeco: {
    name: palettes.zeco.colors[3], // #964712
    text: palettes.zeco.colors[4], // #f9e3cf
    titleColor: palettes.zeco.colors[5], // #f58020
    textColor: palettes.zeco.colors[3], // #964712
  },
  taylo: {
    name: palettes.taylo.colors[0], // #5d9466
    text: palettes.taylo.colors[3], // #d7e2dd
    titleColor: palettes.taylo.colors[3], // #d7e2dd
    textColor: palettes.taylo.colors[4], // #b6fcc0
  },
  miscelania: {
    name: palettes.miscelania.colors[2], // #8badc4
    text: palettes.miscelania.colors[3], // #b0cfe0
    titleColor: palettes.miscelania.colors[4], // #081e28
    textColor: palettes.miscelania.colors[3], // #b0cfe0
  },
};

// Kammara page hero background — extracted so it can be swapped alongside
// the kammara palette.
export const kammaraHero = {
  background:
    'linear-gradient(135deg, #0a0a2e, #1a1a4e, #2d1b69, #0f3460, #0a0a2e)',
  textColor: '#ffffff',
  labelColor: 'rgba(255,255,255,0.6)',
};

// Kammara filter pill defaults (used as a fallback for the section filter).
export const kammaraFilter = {
  color: palettes.kammara.colors[1], // #b8a9e8
  bgColor: palettes.kammara.dark, // #0a0a2e
};
