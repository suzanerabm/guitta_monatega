import { palettes } from './palettes';

export type BookVisualKey = 'napcat' | 'zeco' | 'taylo' | 'kammara' | 'art';

interface BookPageVisual {
  accent: string;
  background: string;
  decorations: string[];
  contextBackground: string;
}

export const bookPageVisuals: Record<BookVisualKey, BookPageVisual> = {
  napcat: {
    accent: palettes.napcat.colors[0],
    background: 'linear-gradient(180deg, #fff8dc 0%, #ffffff 48%)',
    decorations: ['/imgs/bichittos/napcat/napcat.png', '/imgs/bichittos/napcat/violeta.png'],
    contextBackground: '/imgs/bichittos/_bg/napcat.jpg',
  },
  zeco: {
    accent: palettes.zeco.colors[0],
    background: 'linear-gradient(180deg, #fff1e4 0%, #ffffff 48%)',
    decorations: ['/imgs/bichittos/zeco/01_zeco.png', '/imgs/bichittos/zeco/02_RuiMerengue.png', '/imgs/bichittos/zeco/03_ninha.png'],
    contextBackground: '/imgs/bichittos/_bg/zeco.jpg',
  },
  taylo: {
    accent: palettes.taylo.colors[0],
    background: 'linear-gradient(180deg, #f7f0ff 0%, #ffffff 48%)',
    decorations: ['/imgs/bichittos/taylo/tayllo_em_pe.png', '/imgs/bichittos/taylo/pitu.png'],
    contextBackground: '/imgs/bichittos/_bg/taylo.jpg',
  },
  kammara: {
    accent: palettes.kammara.colors[2],
    background: 'linear-gradient(180deg, #f0eef9 0%, #ffffff 48%)',
    decorations: ['/imgs/kammara/orfv/2maelik.png'],
    contextBackground: '/imgs/kammara/orfv/_scenes/8Ceu_em_orf-v.jpg',
  },
  art: {
    accent: palettes.arte.colors[0],
    background: 'linear-gradient(180deg, #f3f0ec 0%, #ffffff 48%)',
    decorations: ['/imgs/books/art/Coloring_Book/bichitto_art.png'],
    contextBackground: '/imgs/art/black/1-arte.jpg',
  },
};

export const bookPageLayout = {
  coverAspectRatio: '4 / 5',
  accentBorderWidth: '4px',
  contextBannerHeight: { base: '360px', md: '520px' },
  contextCharacterHeight: { base: '300px', md: '460px' },
};
