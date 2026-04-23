// src/theme/palettes.ts
export type PaletteName =
  | 'bichittos' | 'napcat' | 'zeco' | 'taylo' | 'miscelania' | 'cheiodebolinha'
  | 'kammara' | 'lunnp1' | 'eni4' | 'triplec' | 'orfv' | 'z1' | 'gotto' | 'arte'
  | 'malloc' | 'mesh' | 'sharp';

/** Criaturas do Bichittos. */
export type CreatureId =
  | 'napcat' | 'zeco' | 'taylo' | 'miscelania' | 'cheiodebolinha';

export interface Palette {
  colors: string[];
  text: string;
  dark: string;
  gradient: string;
  gradientBg: string;
  /**
   * Fonte única de verdade para o BichittosClient — só definido para as
   * criaturas do Bichittos. Mudou aqui, mudou na página.
   */
  bichittos?: {
    /** Cor do nome grande do personagem (hero h1, fora do card). */
    name: string;
    /** Cor do texto curto do CreatureCard (fora do banner). */
    text: string;
    /** Cor do título <h2> dentro do DSTextPanel + cor da borda do painel. */
    titleColor: string;
    /** Cor dos <p> dentro do DSTextPanel. */
    textColor: string;
    /** Cor dos cantos HUD, fundo/borda da pill e dropcap. */
    accent: string;
    /** Cor do texto da pill (segundo acento, usado no dropcap também). */
    accentAlt: string;
    /** Imagem de fundo parallax da seção. */
    bgImage?: string;
    /** Texto da pill (ex: "Gato · Sonhador"). */
    tag: string;
    /** Fundo translúcido do DSTextPanel (default: rgba(0,0,0,0.3)). */
    panelBg?: string;
  };
  /** HeroSection da página do mundo (bg + cores de texto). Opcional. */
  hero?: {
    background: string;
    textColor: string;
    labelColor: string;
  };
  /** FilterBar pill default do mundo. Opcional. */
  filter?: {
    color: string;
    bgColor: string;
  };
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
    colors: ['#4a7eff', '#546db0', '#c4d4ff', '#0f1a4a', '#dde5ff', '#1e3a7a'],
    text: '#c4d4ff',
    dark: '#0a0f2a',
    gradient: 'linear-gradient(135deg, #0f1a4a, #0f1a33, #c4d4ff)',
    gradientBg: 'linear-gradient(160deg, #0f1a4a 10%, #1e3a7a 40%, #0f1a4a 100%)',
    bichittos: {
      name: '#2fd077', // hero "NapCat" grande fora do card
      text: '#c4d4ff',       // texto do CreatureCard externo
      titleColor: '#2fd077', // h2 "NapCat & Violeta" dentro do painel + borda
      textColor: '#c4d4ff',  // parágrafos dentro do painel
      accent: '#2fd077',     // cantos HUD + fundo/borda pill + dropcap
      accentAlt: '#2fd077',  // texto da pill
      bgImage: '/imgs/bichittos/bg/napcat.png',
      tag: 'Gato · Sonhador',
      // panelBg: '#3b0033',
      panelBg: '#01021b',
    },
  },
  zeco: {
    colors: ['#ff8c42', '#ff6b35', '#ffa751', '#f58020', '#f8e8da', '#f58020'],
    text: '#7ed63b',
    dark: '#1a0e02',
    gradient: 'linear-gradient(155deg, #4a2512 0%, #7a3d1a 45%, #c56b2e 100%)',
    gradientBg: 'linear-gradient(160deg, #fece95 0%, #f57f20 40%, #fece95 100%)',
    bichittos: {
      name: '#483727',
      text: '#483727',
      titleColor: '#483727',
      textColor: '#69250c',
      accent: '#483727',
      accentAlt: '#f9be82',
      bgImage: '/imgs/bichittos/bg/zeco.png',
      tag: 'Hamster · Quintal',
      // panelBg: 'rgb(249, 190, 130, 0.3)',
      panelBg: 'rgb(245, 128, 32, 0.8)',
    },
  },
  taylo: {
    colors: ['#5d9466', '#427f49', '#277230', '#d7e2dd', '#b6fcc0', '#082b0b'],
    text: '#b6fcc0',
    dark: '#082b0b',
    gradient: 'linear-gradient(135deg, #5d9466, #427f49, #5d9466)',
    gradientBg: 'linear-gradient(160deg, #34843c 0%, #185b1e 40%, #082b0b 100%)',
    bichittos: {
      name: '#eafcb6',
      text: '#d7e2dd',
      titleColor: '#eafcb6',
      textColor: '#d7e2dd',
      accent: '#5d9466',
      accentAlt: '#b6fcc0',
      bgImage: '/imgs/bichittos/bg/taylo.jpg',
      tag: 'Amigos · Natureza',
      panelBg: 'rgb(8, 43, 11, 0.8)',
    },
  },
  miscelania: {
    colors: ['#c266ea', '#764ba2', '#fefdff', '#450a3c', '#ddd4f4', '#4f0a42'],
    text: '#ddd4f4',
    dark: '#1a1432',
    gradient: 'linear-gradient(135deg, #105714, #2a952f, #e3f0e4)',
    gradientBg: 'linear-gradient(160deg, #2a1b5c 0%, #4c2a8a 40%, #2a952f 100%)',
    bichittos: {
      name: '#b5a2dc',
      text: '#ddd4f4',
      titleColor: '#977ad1',
      textColor: '#ddd4f4',
      accent: '#b5a2dc',
      accentAlt: '#977ad1',
      bgImage: '/imgs/bichittos/bg/miscelania.png',
      tag: 'Mágica',
    },
  },
  cheiodebolinha: {
    colors: ['#3a5a8c', '#2c4a6e', '#8badc4', '#b0cfe0', '#081e28', '#1a3a48'],
    text: '#edf0f2',
    dark: '#0e1a2a',
    gradient: 'linear-gradient(135deg, #1a299f, #1a299f, #1a299f)',
    gradientBg: 'linear-gradient(160deg, #1a299f 0%, #1a299f 40%, #1a299f 100%)',
    bichittos: {
      name: '#3ae9f2',
      text: '#edf0f2',
      titleColor: '#3ae9f2',
      textColor: '#edf0f2',
      accent: '#3ae9f2',
      accentAlt: '#83e5ea',
      bgImage: '/imgs/bichittos/bg/cheiodebolinha.png',
      tag: 'Elefante · Medroso',
      panelBg: 'rgb(47, 49, 113)',
    },
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
    hero: {
      background: 'linear-gradient(135deg, #0a0a2e, #1a1a4e, #2d1b69, #0f3460, #0a0a2e)',
      textColor: '#ffffff',
      labelColor: 'rgba(255,255,255,0.6)',
    },
    filter: {
      color: '#b8a9e8', // colors[1]
      bgColor: '#0a0a2e', // dark
    },
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
    // Used by FilterBar / Header / Breadcrumb as the chrome tint color.
    // Needs to be visibly "eni4" (not indistinguishable from black) while
    // still dark enough to host light text.
    dark: '#3a2608',
    gradient: 'linear-gradient(135deg, #8a5a0a, #e8a317, #f5c842)',
    gradientBg: 'linear-gradient(160deg, #1a1005 0%, #3a2a0a 40%, #2a1c06 100%)',
  },
  triplec: {
    // colors[1] = panel title (lavanda clara, alto contraste sobre bg verde)
    // colors[2] = body text (verde-menta quase off-white, mantém identidade)
    // colors[3] = world heading h1 (lavanda ainda mais clara pra máximo destaque)
    // colors[0/4/5] = usados em gradients e acentos, não viram texto
    colors: ['#a78bfa', '#b09dea', '#d4e8d4', '#c4b5fd', '#0e3a1a', '#1a4a30'],
    text: '#dbe5de',
    // Used by FilterBar chrome tint — roxo-profundo vibrante em vez de
    // quase-preto, pra ser perceptível junto com os outros mundos.
    dark: '#180c36',
    gradient: 'linear-gradient(135deg, #00e86a 0%, #00e86a 35%, #7b4fbf 70%, #2a5caa 100%)',
    // Deep forest green → mid green → dark edges. Harmonizes with the
    // verdant Niul Forest bg image instead of tinting it purple.
    gradientBg: 'linear-gradient(160deg, #081a10 0%, #1a3a22 40%, #0e2a18 70%, #081a10 100%)',
  },
  // === MALLOC ===
  // Verde tech + teal shilo. Instinto, cavernas pulsantes, circuitos integrados nas rochas.
  malloc: {
    colors: ['#22c55e', '#14b8a6', '#4ade80', '#059669', '#0a3a1f', '#1a4a30'],
    text: '#0a3a1f',
    dark: '#050f08',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #4ade80 30%, #14b8a6 65%, #059669 100%)',
    // Cavernas profundas de malloc — verde tech pulsante sobre rocha úmida.
    // O teal do shilo brilha entre as camadas geológicas.
    gradientBg: 'linear-gradient(160deg, #050f08 0%, #0a2818 35%, #0e3520 65%, #050f08 100%)',
  },
  // === MESH ===
  // Prata-azulado + verde kemita. Arquitetura modular, pontes hexagonais, simetria.
  mesh: {
    colors: ['#3b82f6', '#60a5fa', '#7c3aed', '#6d28d9', '#1e3a8a', '#1a0f3d'],
    text: '#1a0f3d',
    dark: '#080420',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 30%, #6d28d9 65%, #4c1d95 100%)',
    // Azul-real + roxo-noite vibrante, porém mais dark que a B. Mantém
    // saturação alta (blue-600 → violet-700) mas com anchors mais
    // profundos pra preservar a identidade fria-geométrica.
    gradientBg: 'linear-gradient(160deg, #080420 0%, #141638 30%, #2e1065 55%, #141638 80%, #080420 100%)',
  },
  // === SHARP ===
  // Branco puro + verde claro + azul-prateado. Megacidades seladas, validação, luz fria.
  sharp: {
    colors: ['#cee4da', '#689674', '#173d14', '#6a87ab', '#64748b', '#1e293b'],
    text: '#334155',
    dark: '#03170e',
    gradient: 'linear-gradient(135deg, #0a0f14 0%, #0c1e16 35%, #0e2a1c 70%, #0a0814 100%)',
    // Deep dark: slate-escuro → verde-floresta profundo → roxo-noite.
    // Mantém identidade fria-selada sem clarear demais.
    gradientBg: 'linear-gradient(160deg, #0a0f14 0%, #0c1e16 30%, #0e2a1c 55%, #1a0f3d 80%, #0a0814 100%)',
  },
  orfv: {
    colors: ['#cf568c', '#cf568c', '#40d0e8', '#cf568c', '#3a1860', '#9040a0'],
    text: '#e2dce9',
    dark: '#1e0c48',
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
    // Brown family, but with enough luminosity on the text indices to
    // actually read over the dark gradient background.
    // colors[0] = accent (CreatureSection radial tint) — sienna saturado
    // colors[1] = DSTextPanel title — caramelo claro
    // colors[2] = body text — creme/bege claro
    // colors[3] = world heading h1 (name "Gotto") — caramelo-rosado claro
    // colors[4..5] = usados em bordas/sombras
    colors: ['#a0522d', '#d4a574', '#f5e6d3', '#e8c39e', '#6b3419', '#3d1a0a'],
    text: '#f5e6d3',
    // Used by FilterBar chrome tint — marrom profundo perceptível.
    dark: '#3a1a0a',
    gradient: 'linear-gradient(135deg, #6b3419, #a0522d, #d4a574)',
    gradientBg: 'linear-gradient(160deg, #1a0a05 0%, #2a1408 40%, #1f0f06 100%)',
  },
  arte: {
    colors: ['#f5f5f5', '#e8e8e8', '#d4d4d4', '#f0f0f0', '#cccccc', '#999999'],
    text: '#2d2d2d',
    dark: '#1a1a1a',
    gradient: 'linear-gradient(135deg, #f5f5f5, #e8e8e8, #d4d4d4, #f0f0f0)',
    gradientBg: 'linear-gradient(135deg, #f5f5f5, #e8e8e8, #d4d4d4, #f0f0f0)',
  },
};
