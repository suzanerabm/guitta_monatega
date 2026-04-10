// src/theme/palettes.ts
export type PaletteName =
  | 'bichittos' | 'napcat' | 'zeco' | 'taylo' | 'miscelania' | 'cheiodebolinha'
  | 'kammara' | 'lunnp1' | 'eni4' | 'triplec' | 'orfv' | 'z1' | 'gotto' | 'arte';

export interface Palette {
  colors: string[];
  text: string;
  dark: string;
  gradient: string;
  gradientBg: string;
}

export const palettes: Record<PaletteName, Palette> = {
  bichittos: {
    colors: ['#ff6b9d', '#ffa751', '#ffe259', '#6dd5fa', '#ffffff', '#ffffff'],
    text: '#2d2d2d',
    dark: '#1a1a2e',
    gradient: 'linear-gradient(135deg, #ff6b9d, #ffa751, #ffe259, #6dd5fa)',
    gradientBg: 'linear-gradient(135deg, #ff6b9d, #ffa751, #ffe259, #6dd5fa)',
  },
  napcat: {
    colors: ['#667eea', '#764ba2', '#fefdff', '#b5a2dc', '#ddd4f4', '#4f0a42'],
    text: '#ddd4f4',
    dark: '#1a1432',
    gradient: 'linear-gradient(135deg, #667eea, #764ba2, #fefdff)',
    gradientBg: 'linear-gradient(160deg, #1a1432 0%, #2a1f4a 40%, #1e1638 100%)',
  },
  zeco: {
    colors: ['#ff8c42', '#ff6b35', '#ffa751', '#964712', '#f9e3cf', '#f58020'],
    text: '#594733',
    dark: '#1a0e02',
    gradient: 'linear-gradient(160deg, #fece95 0%, #fcaf5b 40%, #fece95 100%)',
    gradientBg: 'linear-gradient(160deg, #fece95 0%, #f57f20 40%, #fece95 100%)',
  },
  taylo: {
    colors: ['#5d9466', '#427f49', '#277230', '#d7e2dd', '#b6fcc0', '#082b0b'],
    text: '#b6fcc0',
    dark: '#082b0b',
    gradient: 'linear-gradient(135deg, #5d9466, #427f49, #5d9466)',
    gradientBg: 'linear-gradient(160deg, #34843c 0%, #185b1e 40%, #082b0b 100%)',
  },
  miscelania: {
    colors: ['#c99a2e', '#8a6418', '#e8c968', '#f5e3a8', '#1a1405', '#a67c1f'],
    text: '#f5e3a8',
    dark: '#1a1405',
    gradient: 'linear-gradient(135deg, #8a6418, #c99a2e, #e8c968)',
    gradientBg: 'linear-gradient(160deg, #1a1405 0%, #3a2a0a 40%, #241a08 100%)',
  },
  cheiodebolinha: {
    colors: ['#3a5a8c', '#2c4a6e', '#8badc4', '#b0cfe0', '#081e28', '#1a3a48'],
    text: '#b0cfe0',
    dark: '#0e1a2a',
    gradient: 'linear-gradient(135deg, #2c4a6e, #3a5a8c, #5a7a9c)',
    gradientBg: 'linear-gradient(160deg, #0e1a2a 0%, #1a2a40 40%, #152238 100%)',
  },
  kammara: {
    colors: ['#d4cbf0', '#b8a9e8', '#7a60b0', '#a898d0', '#2d1b69', '#0a0a2e'],
    text: '#b8a9e8',
    dark: '#0a0a2e',
    // --gradient-kammara: used by CreatureSection background
    gradient: 'linear-gradient(135deg, #0a0a2e, #1a1a4e, #2d1b69, #0f3460)',
    // --gradient-kammara-card: used by DSMainCard inside the kammara section
    // Has solid black bookends so it sits flush over the bg.
    gradientBg: 'linear-gradient(135deg, #000000, #0a0a2e, #1a1a4e, #000000)',
  },
  lunnp1: {
    colors: ['#00e676', '#00c853', '#c6eed6', '#59f397', '#00c853', '#c6eed6'],
    text: '#c6eed6',
    dark: '#002e14',
    gradient: 'linear-gradient(135deg, #004d25, #00c853, #00e676)',
    gradientBg: 'linear-gradient(160deg, #001a0e 0%, #003d1a 40%, #002e14 100%)',
  },
  eni4: {
    colors: ['#e8a317', '#c47f0a', '#f5c842', '#1a1005', '#c47f0a', '#f5c842'],
    text: '#f5c842',
    dark: '#1a1005',
    gradient: 'linear-gradient(135deg, #8a5a0a, #e8a317, #f5c842)',
    gradientBg: 'linear-gradient(160deg, #1a1005 0%, #3a2a0a 40%, #2a1c06 100%)',
  },
  triplec: {
    colors: ['#7b4fbf', '#2a5caa', '#00e86a', '#2a2868', '#0e3a1a', '#1a4a30'],
    text: '#0e3a1a',
    dark: '#0a0818',
    gradient: 'linear-gradient(135deg, #00e86a 0%, #00e86a 35%, #7b4fbf 70%, #2a5caa 100%)',
    gradientBg: 'linear-gradient(160deg, #0a0818 0%, #1a1040 40%, #081a10 100%)',
  },
  orfv: {
    colors: ['#8040c8', '#5a30a0', '#40d0e8', '#cf568c', '#3a1860', '#9040a0'],
    text: '#3a1860',
    dark: '#0c0620',
    gradient: 'linear-gradient(135deg, #d4829a 0%, #d4829a 70%, #40d0e8 100%)',
    gradientBg: 'linear-gradient(160deg, #0c0620 0%, #1a0c40 40%, #081828 100%)',
  },
  z1: {
    colors: ['#b0b8c4', '#8a929e', '#d8dce4', '#8a929e', '#6a7080', '#2a2c34'],
    text: '#d8dce4',
    dark: '#12141a',
    gradient: 'linear-gradient(135deg, #6a7080, #b0b8c4, #d8dce4)',
    gradientBg: 'linear-gradient(160deg, #12141a 0%, #2a2c34 40%, #1a1c22 100%)',
  },
  gotto: {
    colors: ['#4a2a2a', '#3a1a1a', '#6a4a4a', '#c4a8a8', '#8a6a6a', '#201212'],
    text: '#c4a8a8',
    dark: '#1a0e0e',
    gradient: 'linear-gradient(135deg, #2a1a1a, #4a2a2a, #3a1a1a)',
    gradientBg: 'linear-gradient(160deg, #1a0e0e 0%, #2a1a1a 40%, #201212 100%)',
  },
  arte: {
    colors: ['#f5f5f5', '#e8e8e8', '#d4d4d4', '#f0f0f0', '#cccccc', '#999999'],
    text: '#2d2d2d',
    dark: '#1a1a1a',
    gradient: 'linear-gradient(135deg, #f5f5f5, #e8e8e8, #d4d4d4, #f0f0f0)',
    gradientBg: 'linear-gradient(135deg, #f5f5f5, #e8e8e8, #d4d4d4, #f0f0f0)',
  },
};
