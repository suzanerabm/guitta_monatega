import { palettes } from './palettes';

export type BookVisualKey = 'napcat' | 'zeco' | 'taylo' | 'kammara' | 'art';

export interface BookBannerDecoration {
  src: string;
  height?: { base: string; md: string };
}

interface BookPageVisual {
  accent: string;
  background: string;
  decorations: BookBannerDecoration[];
  contextBackground: string;
  contextOverlay: string;
}

export const bookPageVisuals: Record<BookVisualKey, BookPageVisual> = {
  napcat: {
    accent: palettes.napcat.colors[0],
    background: 'linear-gradient(180deg, #fff8dc 0%, #ffffff 48%)',
    decorations: [
      { src: '/imgs/bichittos/napcat/napcat.png' },
      { src: '/imgs/bichittos/napcat/violeta.png' },
    ],
    contextBackground: '/imgs/bichittos/_bg/napcat.jpg',
    contextOverlay: 'linear-gradient(90deg, rgba(15, 26, 74, 0.96) 0%, rgba(30, 58, 122, 0.82) 52%, rgba(74, 126, 255, 0.28) 100%)',
  },
  zeco: {
    accent: palettes.zeco.colors[0],
    background: 'linear-gradient(180deg, #fff1e4 0%, #ffffff 48%)',
    decorations: [
      { src: '/imgs/bichittos/zeco/01_zeco.png' },
      { src: '/imgs/bichittos/zeco/02_RuiMerengue.png', height: { base: '210px', md: '322px' } },
      { src: '/imgs/bichittos/zeco/03_ninha.png', height: { base: '75px', md: '115px' } },
    ],
    contextBackground: '/imgs/bichittos/_bg/zeco.jpg',
    contextOverlay: 'linear-gradient(90deg, rgba(72, 55, 39, 0.96) 0%, rgba(181, 80, 20, 0.78) 52%, rgba(255, 140, 66, 0.24) 100%)',
  },
  taylo: {
    accent: palettes.taylo.colors[0],
    background: 'linear-gradient(180deg, #f7f0ff 0%, #ffffff 48%)',
    decorations: [
      { src: '/imgs/bichittos/taylo/tayllo_em_pe.png' },
      { src: '/imgs/bichittos/taylo/pitu.png' },
    ],
    contextBackground: '/imgs/bichittos/_bg/taylo.jpg',
    contextOverlay: 'linear-gradient(90deg, rgba(57, 77, 92, 0.96) 0%, rgba(82, 105, 121, 0.78) 52%, rgba(143, 169, 191, 0.24) 100%)',
  },
  kammara: {
    accent: palettes.kammara.colors[2],
    background: 'linear-gradient(180deg, #f0eef9 0%, #ffffff 48%)',
    decorations: [{ src: '/imgs/kammara/orfv/2maelik.png' }],
    contextBackground: '/imgs/kammara/orfv/_scenes/8Ceu_em_orf-v.jpg',
    contextOverlay: 'linear-gradient(90deg, rgba(10, 10, 46, 0.97) 0%, rgba(45, 27, 105, 0.82) 52%, rgba(122, 96, 176, 0.26) 100%)',
  },
  art: {
    accent: palettes.arte.colors[0],
    background: 'linear-gradient(180deg, #f3f0ec 0%, #ffffff 48%)',
    decorations: [{ src: '/imgs/books/art/Coloring_Book/bichitto_art.png' }],
    contextBackground: '/imgs/art/black/1-arte.jpg',
    contextOverlay: 'linear-gradient(90deg, rgba(26, 26, 26, 0.94) 0%, rgba(85, 85, 85, 0.76) 52%, rgba(204, 204, 204, 0.18) 100%)',
  },
};

export const bookPageLayout = {
  coverAspectRatio: '4 / 5',
  accentBorderWidth: '4px',
  contextBannerHeight: { base: '360px', md: '520px' },
  contextCharacterHeight: { base: '300px', md: '460px' },
};
