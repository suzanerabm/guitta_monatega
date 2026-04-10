// src/theme/artSections.ts
// Per-art-section visual metadata. Centralised so designers can tweak the
// palette of every art section from one file.
//
// Values live here (rather than in tokens.ts) because they are unique to a
// single section and don't have reuse potential as global tokens.

export interface ArtSectionMeta {
  bg: string;
  titleColor: string;
  techColor: string;
  large: boolean;
  theme?: string;
}

export type ArtSectionId =
  | 'black'
  | 'grafite'
  | 'doodle'
  | 'digital'
  | 'collections'
  | 'fimo'
  | 'needle'
  | 'clay'
  | 'croche';

// Shared tech (subtitle) color used by every light-themed section.
const DARK_TECH_OVERLAY = 'rgba(51,51,51,0.5)';

export const artSectionMeta: Record<ArtSectionId, ArtSectionMeta> = {
  black: {
    bg: '#1a1a1a',
    titleColor: '#ffffff',
    techColor: 'rgba(255,255,255,0.5)',
    large: false,
    theme: 'dark',
  },
  grafite: {
    bg: '#f0eeeb',
    titleColor: '#333333',
    techColor: DARK_TECH_OVERLAY,
    large: true,
  },
  doodle: {
    bg: '#f5f3ef',
    titleColor: '#333333',
    techColor: DARK_TECH_OVERLAY,
    large: true,
  },
  digital: {
    bg: '#eae8f0',
    titleColor: '#333333',
    techColor: DARK_TECH_OVERLAY,
    large: false,
  },
  collections: {
    bg: '#f3f0e8',
    titleColor: '#333333',
    techColor: DARK_TECH_OVERLAY,
    large: false,
  },
  fimo: {
    bg: '#eef2e8',
    titleColor: '#333333',
    techColor: DARK_TECH_OVERLAY,
    large: false,
  },
  needle: {
    bg: '#e8eef2',
    titleColor: '#333333',
    techColor: DARK_TECH_OVERLAY,
    large: false,
  },
  clay: {
    bg: '#f2ede8',
    titleColor: '#333333',
    techColor: DARK_TECH_OVERLAY,
    large: false,
  },
  croche: {
    bg: '#f0e8f2',
    titleColor: '#333333',
    techColor: DARK_TECH_OVERLAY,
    large: false,
  },
};

// Hero gradient used on the /art page hero.
export const artHero = {
  background: 'linear-gradient(135deg, #f5f5f5, #e8e8e8, #f0f0f0)',
  textColor: '#1a1d21',
  labelColor: '#999999',
};
