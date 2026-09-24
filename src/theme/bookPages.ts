import { palettes } from './palettes';

export type BookVisualKey = 'napcat' | 'zeco' | 'taylo' | 'orfv' | 'digg' | 'art';

export interface BookBannerDecoration {
  src: string;
  height?: { base: string; md: string };
}

interface BookPageVisual {
  accent: string;
  decorations: BookBannerDecoration[];
  contextBackground: string;
  contextOverlay: string;
  contextImageOpacity: number;
  contextText: string;
  contextEyebrow: string;
}

export const bookPageLayout = {
  coverAspectRatio: '4 / 5',
  accentBorderWidth: '4px',
  contextBannerHeight: { base: '360px', md: '520px' },
  contextCharacterHeight: { base: '300px', md: '460px' },
  bichittosSceneOpacity: 0.22,
  worldSceneOpacity: 0.3,
};

export const bookPageVisuals: Record<BookVisualKey, BookPageVisual> = {
  napcat: {
    accent: palettes.napcat.colors[0],
    decorations: [
      { src: '/imgs/bichittos/napcat/napcat.png' },
      { src: '/imgs/bichittos/napcat/violeta.png' },
    ],
    contextBackground: '/imgs/bichittos/_bg/napcat.jpg',
    contextOverlay: palettes.napcat.gradientBg,
    contextImageOpacity: bookPageLayout.worldSceneOpacity,
    contextText: palettes.napcat.text,
    contextEyebrow: palettes.napcat.colors[2],
  },
  zeco: {
    accent: palettes.zeco.colors[0],
    decorations: [
      { src: '/imgs/bichittos/zeco/01_zeco.png' },
      { src: '/imgs/bichittos/zeco/02_RuiMerengue.png', height: { base: '210px', md: '322px' } },
      { src: '/imgs/bichittos/zeco/03_ninha.png', height: { base: '75px', md: '115px' } },
    ],
    contextBackground: '/imgs/bichittos/_bg/zeco.jpg',
    contextOverlay: palettes.zeco.gradient,
    contextImageOpacity: bookPageLayout.worldSceneOpacity,
    contextText: palettes.zeco.colors[4],
    contextEyebrow: palettes.zeco.colors[2],
  },
  taylo: {
    accent: palettes.taylo.colors[0],
    decorations: [
      { src: '/imgs/bichittos/taylo/tayllo_em_pe.png' },
      { src: '/imgs/bichittos/taylo/pitu.png' },
    ],
    contextBackground: palettes.taylo.bichittos!.bgImage!,
    contextOverlay: palettes.taylo.gradientBg,
    contextImageOpacity: bookPageLayout.bichittosSceneOpacity,
    contextText: palettes.taylo.bichittos!.name,
    contextEyebrow: palettes.taylo.bichittos!.name,
  },
  orfv: {
    accent: palettes.orfv.colors[0],
    decorations: [{ src: '/imgs/kammara/orfv/2maelik.png' }],
    contextBackground: '/imgs/kammara/orfv/_scenes/8Ceu_em_orf-v.jpg',
    contextOverlay: palettes.orfv.gradientBg,
    contextImageOpacity: bookPageLayout.worldSceneOpacity,
    contextText: palettes.orfv.text,
    contextEyebrow: palettes.orfv.colors[2],
  },
  digg: {
    accent: palettes.digg.colors[0],
    decorations: [{ src: '/imgs/kammara/digg/CHMURKA_frente.png' }],
    contextBackground: '/imgs/kammara/digg/_bg/digg_vista-gigapixel.jpg',
    contextOverlay: palettes.digg.gradientBg,
    contextImageOpacity: bookPageLayout.worldSceneOpacity,
    contextText: palettes.digg.text,
    contextEyebrow: palettes.digg.colors[1],
  },
  art: {
    accent: palettes.arte.text,
    decorations: [{ src: '/imgs/books/art/Coloring_Book/bichitto_art.png' }],
    contextBackground: '/imgs/art/black/1-arte.jpg',
    contextOverlay: palettes.arte.gradientBg,
    contextImageOpacity: bookPageLayout.worldSceneOpacity,
    contextText: palettes.arte.text,
    contextEyebrow: palettes.arte.colors[5],
  },
};
