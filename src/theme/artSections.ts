// src/theme/artSections.ts
// Per-art-section visual metadata. Centralised so designers can tweak the
// palette of every art section from one file.
//
// Values live here (rather than in tokens.ts) because they are unique to a
// single section and don't have reuse potential as global tokens.

import { mediaUrl } from '@/lib/media';

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
  | 'croche'
  | 'livros';

// Subtitle (technique) color overlays — same alpha for both modes so
// the relationship between title and subtitle stays consistent.
const DARK_TECH_OVERLAY = 'rgba(26,26,26,0.55)';
const LIGHT_TECH_OVERLAY = 'rgba(255,255,255,0.55)';

// Monochrome scale walking the page top-to-bottom following the order
// in /art/page.tsx. Starts almost-white (doodle = the blank notebook),
// darkens until black (the climax), then keeps descending into mature
// greys for the tactile/finished crafts.
export const artSectionMeta: Record<ArtSectionId, ArtSectionMeta> = {
  doodle: {
    bg: '#fafafa',
    titleColor: '#1a1a1a',
    techColor: DARK_TECH_OVERLAY,
    large: true,
  },
  grafite: {
    bg: '#e8e8e8',
    titleColor: '#1a1a1a',
    techColor: DARK_TECH_OVERLAY,
    large: true,
  },
  black: {
    bg: '#1a1a1a',
    titleColor: '#ffffff',
    techColor: LIGHT_TECH_OVERLAY,
    large: false,
    theme: 'dark',
  },
  digital: {
    bg: '#d4d4d4',
    titleColor: '#1a1a1a',
    techColor: DARK_TECH_OVERLAY,
    large: false,
  },
  collections: {
    bg: '#dcdcdc',
    titleColor: '#1a1a1a',
    techColor: DARK_TECH_OVERLAY,
    large: false,
  },
  fimo: {
    bg: '#cfcfcf',
    titleColor: '#1a1a1a',
    techColor: DARK_TECH_OVERLAY,
    large: false,
  },
  needle: {
    bg: '#c2c2c2',
    titleColor: '#1a1a1a',
    techColor: DARK_TECH_OVERLAY,
    large: false,
  },
  clay: {
    bg: '#b8b8b8',
    titleColor: '#1a1a1a',
    techColor: DARK_TECH_OVERLAY,
    large: false,
  },
  croche: {
    bg: '#aeaeae',
    titleColor: '#1a1a1a',
    techColor: DARK_TECH_OVERLAY,
    large: false,
  },
  livros: {
    bg: '#a4a4a4',
    titleColor: '#1a1a1a',
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

// Quiet watermark used only by the art banner on the home page. The inverted
// source turns the original white-on-black drawing into a dark pencil trace;
// multiply makes the light background of the image disappear over the banner.
export const homeArtBanner = {
  image: mediaUrl('/imgs/art/black/1-arte.jpg'),
  width: { base: '48%', md: '28%' },
  height: '90%',
  right: { base: '1%', md: '2%' },
  bottom: '5%',
  opacity: 0.12,
  filter: 'invert(1) grayscale(1) contrast(1.35)',
  mixBlendMode: 'multiply' as const,
};
// Home-only treatment for the combined book gallery. It reuses the first
// black-and-white artwork without changing the books section on /art.
export const homeBooksGallery = {
  background:
    `linear-gradient(rgba(222,215,204,0.86), rgba(222,215,204,0.86)), url("${mediaUrl('/imgs/art/black/1-arte.jpg')}")`,
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  panelBackground: 'rgba(245,240,232,0.78)',
  titleColor: '#302d29',
  techColor: 'rgba(48,45,41,0.66)',
};
