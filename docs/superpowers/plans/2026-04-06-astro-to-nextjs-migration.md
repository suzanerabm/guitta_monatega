# Astro to Next.js + Chakra UI v3 Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Guitta Monatega portfolio from Astro 6 to Next.js 15 + Chakra UI v3, preserving visual fidelity and adding Storybook stories + full test coverage for every component.

**Architecture:** Next.js App Router with `[locale]` dynamic segment for i18n (pt-BR default, en prefixed). Chakra UI v3 provides the component library and theme system. All 22 Astro components become React components using Chakra primitives. Image data comes from a generated JSON manifest instead of filesystem reads.

**Tech Stack:** Next.js 15, React 19, Chakra UI v3, next-intl, Vitest, React Testing Library, Storybook 10, Playwright, lucide-react

**Spec:** `docs/superpowers/specs/2026-04-06-astro-to-nextjs-migration-design.md`

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx                          # Root layout: fonts, metadata, ChakraProvider
│   ├── globals.css                         # Minimal reset
│   ├── [locale]/
│   │   ├── layout.tsx                      # Locale layout: Header + Footer + ModalProvider
│   │   ├── page.tsx                        # Home
│   │   ├── about/page.tsx
│   │   ├── bichittos/page.tsx
│   │   ├── kammara/page.tsx
│   │   └── art/page.tsx
├── components/
│   ├── Header/
│   │   ├── Header.tsx
│   │   ├── Header.stories.tsx
│   │   ├── Header.test.tsx
│   │   └── index.ts
│   ├── Footer/
│   │   ├── Footer.tsx
│   │   ├── Footer.stories.tsx
│   │   ├── Footer.test.tsx
│   │   └── index.ts
│   ├── Breadcrumb/
│   │   ├── Breadcrumb.tsx
│   │   ├── Breadcrumb.stories.tsx
│   │   ├── Breadcrumb.test.tsx
│   │   └── index.ts
│   ├── LanguageToggle/
│   │   ├── LanguageToggle.tsx
│   │   ├── LanguageToggle.stories.tsx
│   │   ├── LanguageToggle.test.tsx
│   │   └── index.ts
│   ├── HomeBanner/
│   │   ├── HomeBanner.tsx
│   │   ├── HomeBanner.stories.tsx
│   │   ├── HomeBanner.test.tsx
│   │   └── index.ts
│   ├── HeroSection/
│   │   ├── HeroSection.tsx
│   │   ├── HeroSection.stories.tsx
│   │   ├── HeroSection.test.tsx
│   │   └── index.ts
│   ├── CreatureCard/
│   │   ├── CreatureCard.tsx
│   │   ├── CreatureCard.stories.tsx
│   │   ├── CreatureCard.test.tsx
│   │   └── index.ts
│   ├── CharacterCard/
│   │   ├── CharacterCard.tsx
│   │   ├── CharacterCard.stories.tsx
│   │   ├── CharacterCard.test.tsx
│   │   └── index.ts
│   ├── WorldCard/
│   │   ├── WorldCard.tsx
│   │   ├── WorldCard.stories.tsx
│   │   ├── WorldCard.test.tsx
│   │   └── index.ts
│   ├── SoonBadge/
│   │   ├── SoonBadge.tsx
│   │   ├── SoonBadge.stories.tsx
│   │   ├── SoonBadge.test.tsx
│   │   └── index.ts
│   ├── SoonPanel/
│   │   ├── SoonPanel.tsx
│   │   ├── SoonPanel.stories.tsx
│   │   ├── SoonPanel.test.tsx
│   │   └── index.ts
│   ├── DSMainCard/
│   │   ├── DSMainCard.tsx
│   │   ├── DSMainCard.stories.tsx
│   │   ├── DSMainCard.test.tsx
│   │   └── index.ts
│   ├── DSTextPanel/
│   │   ├── DSTextPanel.tsx
│   │   ├── DSTextPanel.stories.tsx
│   │   ├── DSTextPanel.test.tsx
│   │   └── index.ts
│   ├── SubSystem/
│   │   ├── SubSystem.tsx
│   │   ├── SubSystem.stories.tsx
│   │   ├── SubSystem.test.tsx
│   │   └── index.ts
│   ├── BookGallery/
│   │   ├── BookGallery.tsx
│   │   ├── BookGallery.stories.tsx
│   │   ├── BookGallery.test.tsx
│   │   └── index.ts
│   ├── ArtSection/
│   │   ├── ArtSection.tsx
│   │   ├── ArtSection.stories.tsx
│   │   ├── ArtSection.test.tsx
│   │   └── index.ts
│   ├── FilterBar/
│   │   ├── FilterBar.tsx
│   │   ├── FilterBar.stories.tsx
│   │   ├── FilterBar.test.tsx
│   │   └── index.ts
│   ├── Modal/
│   │   ├── Modal.tsx
│   │   ├── ModalProvider.tsx
│   │   ├── Modal.stories.tsx
│   │   ├── Modal.test.tsx
│   │   └── index.ts
│   ├── CharacterStrip/
│   │   ├── CharacterStrip.tsx
│   │   ├── CharacterStrip.stories.tsx
│   │   ├── CharacterStrip.test.tsx
│   │   └── index.ts
│   ├── SceneStrip/
│   │   ├── SceneStrip.tsx
│   │   ├── SceneStrip.stories.tsx
│   │   ├── SceneStrip.test.tsx
│   │   └── index.ts
│   ├── ScrollReveal/
│   │   ├── ScrollReveal.tsx
│   │   ├── ScrollReveal.stories.tsx
│   │   ├── ScrollReveal.test.tsx
│   │   └── index.ts
│   └── CreatureSection/
│       ├── CreatureSection.tsx
│       ├── CreatureSection.stories.tsx
│       ├── CreatureSection.test.tsx
│       └── index.ts
├── hooks/
│   ├── useParallax.ts
│   ├── useParallax.test.ts
│   ├── useScrollReveal.ts
│   ├── useScrollReveal.test.ts
│   ├── useStripAnimation.ts
│   ├── useStripAnimation.test.ts
│   ├── useScrollHeader.ts
│   └── useScrollHeader.test.ts
├── theme/
│   ├── index.ts
│   ├── tokens.ts
│   ├── palettes.ts
│   └── keyframes.ts
├── i18n/
│   ├── request.ts
│   ├── routing.ts
│   └── messages/
│       ├── pt-BR.json
│       └── en.json
├── data/
│   └── image-manifest.json
├── lib/
│   ├── images.ts
│   └── images.test.ts
└── __tests__/
    └── e2e/
        ├── navigation.spec.ts
        ├── i18n.spec.ts
        ├── modal.spec.ts
        ├── filters.spec.ts
        └── responsive.spec.ts

scripts/
├── generate-manifest.ts

.storybook/
├── main.ts
└── preview.tsx

middleware.ts                              # next-intl locale detection
next.config.ts
vitest.config.ts
playwright.config.ts
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `src/app/layout.tsx`, `src/app/globals.css`

- [ ] **Step 1: Initialize Next.js project in a new directory**

```bash
cd "/Users/suzane.machado/Library/Mobile Documents/com~apple~CloudDocs/GuittaMonatega_main/5 Website"
npx create-next-app@latest guitta_monatega_next --typescript --tailwind=no --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Note: We won't use Tailwind. The `--tailwind=no` flag prevents its installation.

- [ ] **Step 2: Copy the public/imgs directory from Astro project**

```bash
cp -r guitta_monatega/public/imgs guitta_monatega_next/public/imgs
```

- [ ] **Step 3: Install core dependencies**

```bash
cd guitta_monatega_next
npm install @chakra-ui/react @emotion/react next-intl lucide-react
```

- [ ] **Step 4: Install dev dependencies**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event storybook @storybook/react-vite @storybook/addon-essentials @storybook/test @playwright/test
```

- [ ] **Step 5: Create vitest.config.ts**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 6: Create test setup file**

```ts
// src/test-setup.ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 7: Create globals.css with minimal reset**

```css
/* src/app/globals.css */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

a {
  text-decoration: none;
  color: inherit;
}
```

- [ ] **Step 8: Verify project builds**

```bash
npm run build
```

Expected: Build succeeds with default Next.js page.

- [ ] **Step 9: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js 15 project with Chakra UI v3, Vitest, Storybook"
```

---

## Task 2: Chakra UI Theme System

**Files:**
- Create: `src/theme/tokens.ts`, `src/theme/palettes.ts`, `src/theme/keyframes.ts`, `src/theme/index.ts`

- [ ] **Step 1: Create palettes.ts with all 13 color palettes**

```ts
// src/theme/palettes.ts
export type PaletteName =
  | 'bichittos' | 'napcat' | 'zeco' | 'taylo' | 'miscelania'
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
    gradient: 'linear-gradient(135deg, #0a0a2e, #1a1a4e, #2d1b69, #0f3460)',
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
```

- [ ] **Step 2: Create keyframes.ts with all CSS animations**

```ts
// src/theme/keyframes.ts
export const keyframes = {
  fadeIn: {
    '0%': { opacity: 0, transform: 'translateY(10px)' },
    '100%': { opacity: 1, transform: 'translateY(0)' },
  },
  cardFloat: {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-8px)' },
  },
  fluidBichittos: {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
  fluidKammara: {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
  glowShift: {
    '0%, 100%': { opacity: 0.5, transform: 'scale(1)' },
    '50%': { opacity: 1, transform: 'scale(1.1)' },
  },
  shapeFloat: {
    '0%, 100%': { transform: 'translateY(0) scale(1)' },
    '50%': { transform: 'translateY(-20px) scale(1.05)' },
  },
  starTwinkle: {
    '0%, 100%': { opacity: 0.3, transform: 'scale(0.8)' },
    '50%': { opacity: 1, transform: 'scale(1.2)' },
  },
  kammaraGlow: {
    '0%, 100%': { opacity: 0.15, transform: 'scale(1)' },
    '50%': { opacity: 0.3, transform: 'scale(1.2)' },
  },
  strokeDraw: {
    '0%': { opacity: 0, transform: 'scaleX(0)' },
    '50%': { opacity: 0.15 },
    '100%': { opacity: 0, transform: 'scaleX(1)' },
  },
};
```

- [ ] **Step 3: Create tokens.ts with full design token system**

```ts
// src/theme/tokens.ts
import { defineTokens, defineSemanticTokens } from '@chakra-ui/react';

export const tokens = defineTokens({
  colors: {
    white: { value: '#ffffff' },
    offWhite: { value: '#fafafa' },
    black: { value: '#000000' },
    ink: { value: '#1a1d21' },
    inkSoft: { value: '#555555' },
    inkMuted: { value: '#999999' },
    border: { value: '#e0e0e0' },
    borderSoft: { value: '#f0f0f0' },
    subtle: { value: '#cccccc' },
    surface: { value: '#f5f5f5' },
    // Overlays
    overlayLight: { value: 'rgba(255,255,255,0.92)' },
    overlayLightSoft: { value: 'rgba(255,255,255,0.9)' },
    overlayDark: { value: 'rgba(0,0,0,0.95)' },
    overlayDarkSoft: { value: 'rgba(0,0,0,0.8)' },
    // Dark theme base
    darkBg: { value: '#0a0a1a' },
    darkInk: { value: '#e0e0e8' },
    darkInkSoft: { value: 'rgba(255,255,255,0.55)' },
    darkInkMuted: { value: 'rgba(255,255,255,0.3)' },
    darkBorder: { value: 'rgba(255,255,255,0.08)' },
    darkSubtle: { value: 'rgba(255,255,255,0.12)' },
    // Text overlays
    textOverlay: { value: 'rgba(255,255,255,0.7)' },
    textOverlayDim: { value: 'rgba(255,255,255,0.5)' },
    textOverlayBright: { value: 'rgba(255,255,255,0.9)' },
    // Bg overlays
    bgOverlay: { value: 'rgba(0,0,0,0.3)' },
    bgOverlayMid: { value: 'rgba(0,0,0,0.4)' },
    bgOverlayHeavy: { value: 'rgba(0,0,0,0.6)' },
    // Banner
    bannerLabel: { value: 'rgba(255,255,255,0.6)' },
    bannerDesc: { value: 'rgba(255,255,255,0.7)' },
    arteLabel: { value: 'rgba(0,0,0,0.35)' },
    arteDesc: { value: 'rgba(0,0,0,0.45)' },
  },
  fonts: {
    body: { value: "'Fira Sans', system-ui, sans-serif" },
    heading: { value: "'Fira Sans', system-ui, sans-serif" },
  },
  fontSizes: {
    xs: { value: '0.65rem' },
    sm: { value: '0.72rem' },
    base: { value: '0.85rem' },
    md: { value: '1rem' },
    lg: { value: '1.05rem' },
    xl: { value: '1.1rem' },
    '2xl': { value: '1.6rem' },
    '3xl': { value: '1.8rem' },
    h1: { value: 'clamp(3rem, 8vw, 6rem)' },
    h2: { value: 'clamp(2rem, 4vw, 3rem)' },
    h3: { value: '1.3rem' },
    h4: { value: '0.75rem' },
    label: { value: '0.7rem' },
    section: { value: '1.2rem' },
    soon: { value: '2rem' },
  },
  fontWeights: {
    thin: { value: '100' },
    light: { value: '300' },
    regular: { value: '400' },
    medium: { value: '500' },
    semibold: { value: '600' },
    bold: { value: '700' },
  },
  letterSpacings: {
    tight: { value: '0.04em' },
    normal: { value: '0.08em' },
    wide: { value: '0.12em' },
    wider: { value: '0.2em' },
    widest: { value: '0.25em' },
  },
  spacing: {
    xs: { value: '0.25rem' },
    sm: { value: '0.5rem' },
    md: { value: '0.8rem' },
    lg: { value: '1.5rem' },
    xl: { value: '3rem' },
    '2xl': { value: '5rem' },
  },
  shadows: {
    sm: { value: '0 4px 20px rgba(0,0,0,0.08)' },
    md: { value: '0 4px 24px rgba(0,0,0,0.06)' },
    lg: { value: '0 8px 30px rgba(0,0,0,0.12)' },
    text: { value: '0 2px 30px rgba(0,0,0,0.3)' },
  },
  durations: {
    default: { value: '0.2s' },
    slow: { value: '0.4s' },
  },
  easings: {
    default: { value: 'ease' },
  },
});

export const semanticTokens = defineSemanticTokens({
  colors: {
    bg: {
      value: { base: '{colors.white}', _dark: '{colors.darkBg}' },
    },
    fg: {
      value: { base: '{colors.ink}', _dark: '{colors.darkInk}' },
    },
    fgSoft: {
      value: { base: '{colors.inkSoft}', _dark: '{colors.darkInkSoft}' },
    },
    fgMuted: {
      value: { base: '{colors.inkMuted}', _dark: '{colors.darkInkMuted}' },
    },
    headerBg: {
      value: { base: '{colors.overlayLight}', _dark: 'rgba(10,10,26,0.9)' },
    },
    borderColor: {
      value: { base: '{colors.border}', _dark: '{colors.darkBorder}' },
    },
  },
});
```

- [ ] **Step 4: Create theme/index.ts combining everything**

```ts
// src/theme/index.ts
import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import { tokens, semanticTokens } from './tokens';
import { keyframes } from './keyframes';

const config = defineConfig({
  theme: {
    tokens,
    semanticTokens,
    keyframes,
    breakpoints: {
      sm: '30em',
      md: '48em',
      lg: '62em',
      xl: '80em',
      '2xl': '96em',
    },
  },
});

export const system = createSystem(defaultConfig, config);
```

- [ ] **Step 5: Verify theme file has no TypeScript errors**

```bash
npx tsc --noEmit src/theme/index.ts
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add src/theme/
git commit -m "feat: add Chakra UI v3 theme with tokens, palettes, and keyframes from Astro tokens.css"
```

---

## Task 3: i18n Setup (next-intl)

**Files:**
- Create: `src/i18n/routing.ts`, `src/i18n/request.ts`, `src/i18n/messages/pt-BR.json`, `src/i18n/messages/en.json`, `middleware.ts`

- [ ] **Step 1: Create routing.ts**

```ts
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['pt-BR', 'en'],
  defaultLocale: 'pt-BR',
  localePrefix: 'as-needed', // pt-BR has no prefix, en gets /en/
});
```

- [ ] **Step 2: Create request.ts**

```ts
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 3: Create middleware.ts**

```ts
// middleware.ts (project root)
import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(pt-BR|en)/:path*'],
};
```

- [ ] **Step 4: Update next.config.ts for next-intl**

```ts
// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
```

- [ ] **Step 5: Convert pt-BR.ts to pt-BR.json**

Convert the existing TypeScript translation object from `guitta_monatega/src/i18n/pt-BR.ts` to JSON format at `src/i18n/messages/pt-BR.json`. The structure stays identical — just change the format from TS export to JSON. Keep every key and value exactly as-is.

Read the source file and write the JSON equivalent. The structure follows:
```json
{
  "common": {
    "back": "voltar",
    "siteTitle": "Guitta Monatega",
    "footerAbout": "sobre guitta monatega",
    "soon": "em breve",
    "words": { ... }
  },
  "home": { ... },
  "about": { ... },
  "bichittos": { ... },
  "kammara": { ... },
  "art": { ... }
}
```

- [ ] **Step 6: Convert en.ts to en.json**

Same process as step 5 for the English translation file.

- [ ] **Step 7: Verify next-intl builds**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/i18n/ middleware.ts next.config.ts
git commit -m "feat: add next-intl i18n with pt-BR and en translations"
```

---

## Task 4: Root Layout + Chakra Provider

**Files:**
- Create: `src/app/layout.tsx`, `src/app/[locale]/layout.tsx`

- [ ] **Step 1: Create root layout with Chakra Provider**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '@/theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'Guitta Monatega',
  description: 'Portfolio — Guitta Monatega',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,100;0,300;0,400;0,500;0,600;0,700;1,100;1,300;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ChakraProvider value={system}>
          {children}
        </ChakraProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create locale layout with Header + Footer**

```tsx
// src/app/[locale]/layout.tsx
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {/* Header and Footer will be added in Task 6 */}
      <main>{children}</main>
    </NextIntlClientProvider>
  );
}
```

- [ ] **Step 3: Create a placeholder home page**

```tsx
// src/app/[locale]/page.tsx
import { useTranslations } from 'next-intl';
import { Box, Heading } from '@chakra-ui/react';

export default function HomePage() {
  const t = useTranslations('home');
  return (
    <Box p="xl">
      <Heading>Guitta Monatega</Heading>
    </Box>
  );
}
```

- [ ] **Step 4: Verify the app runs**

```bash
npm run dev
```

Open `http://localhost:3000` — should show "Guitta Monatega" with Fira Sans font.

- [ ] **Step 5: Commit**

```bash
git add src/app/
git commit -m "feat: add root layout with ChakraProvider and locale layout with next-intl"
```

---

## Task 5: Storybook Configuration

**Files:**
- Create: `.storybook/main.ts`, `.storybook/preview.tsx`

- [ ] **Step 1: Initialize Storybook**

```bash
npx storybook@latest init --type react --builder vite --no-dev
```

- [ ] **Step 2: Update .storybook/main.ts**

```ts
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../src'),
    };
    return config;
  },
};

export default config;
```

- [ ] **Step 3: Create preview.tsx with Chakra Provider**

```tsx
// .storybook/preview.tsx
import type { Preview } from '@storybook/react';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../src/theme';
import React from 'react';

const preview: Preview = {
  decorators: [
    (Story) => (
      <ChakraProvider value={system}>
        <Story />
      </ChakraProvider>
    ),
  ],
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
};

export default preview;
```

- [ ] **Step 4: Verify Storybook runs**

```bash
npm run storybook
```

Expected: Storybook opens at `http://localhost:6006`.

- [ ] **Step 5: Commit**

```bash
git add .storybook/
git commit -m "feat: configure Storybook with Chakra UI v3 provider"
```

---

## Task 6: Header + Footer + LanguageToggle + Breadcrumb

**Files:**
- Create: `src/components/Header/Header.tsx`, `src/components/Header/Header.stories.tsx`, `src/components/Header/Header.test.tsx`, `src/components/Header/index.ts`
- Create: `src/components/Footer/Footer.tsx`, `src/components/Footer/Footer.stories.tsx`, `src/components/Footer/Footer.test.tsx`, `src/components/Footer/index.ts`
- Create: `src/components/LanguageToggle/LanguageToggle.tsx`, `src/components/LanguageToggle/LanguageToggle.stories.tsx`, `src/components/LanguageToggle/LanguageToggle.test.tsx`, `src/components/LanguageToggle/index.ts`
- Create: `src/components/Breadcrumb/Breadcrumb.tsx`, `src/components/Breadcrumb/Breadcrumb.stories.tsx`, `src/components/Breadcrumb/Breadcrumb.test.tsx`, `src/components/Breadcrumb/index.ts`
- Create: `src/hooks/useScrollHeader.ts`, `src/hooks/useScrollHeader.test.ts`

- [ ] **Step 1: Write useScrollHeader hook test**

```ts
// src/hooks/useScrollHeader.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useScrollHeader } from './useScrollHeader';

describe('useScrollHeader', () => {
  it('returns isCompact false initially', () => {
    const { result } = renderHook(() => useScrollHeader(80));
    expect(result.current.isCompact).toBe(false);
  });

  it('sets isCompact true when scrolling down past threshold', () => {
    const { result } = renderHook(() => useScrollHeader(80));
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    // Needs two scroll events to detect direction
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 150, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.isCompact).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/hooks/useScrollHeader.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement useScrollHeader**

```ts
// src/hooks/useScrollHeader.ts
'use client';
import { useState, useEffect, useRef } from 'react';

export function useScrollHeader(threshold = 80) {
  const [isCompact, setIsCompact] = useState(false);
  const lastScrollRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const scrollingDown = y > lastScrollRef.current && y > threshold;
      setIsCompact(scrollingDown);
      lastScrollRef.current = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return { isCompact };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/hooks/useScrollHeader.test.ts
```

Expected: PASS.

- [ ] **Step 5: Write LanguageToggle test**

```tsx
// src/components/LanguageToggle/LanguageToggle.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LanguageToggle } from './LanguageToggle';

// Mock next-intl
vi.mock('next-intl', () => ({
  useLocale: () => 'pt-BR',
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

describe('LanguageToggle', () => {
  it('renders EN when locale is pt-BR', () => {
    render(<LanguageToggle currentPath="/" />);
    expect(screen.getByText('EN')).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

```bash
npx vitest run src/components/LanguageToggle/LanguageToggle.test.tsx
```

Expected: FAIL.

- [ ] **Step 7: Implement LanguageToggle**

```tsx
// src/components/LanguageToggle/LanguageToggle.tsx
'use client';
import { Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useLocale } from 'next-intl';

interface LanguageToggleProps {
  currentPath: string;
}

export function LanguageToggle({ currentPath }: LanguageToggleProps) {
  const locale = useLocale();
  const isEn = locale === 'en';
  const altPath = isEn
    ? currentPath.replace(/^\/en/, '') || '/'
    : `/en${currentPath}`;
  const label = isEn ? 'PT' : 'EN';

  return (
    <Link
      as={NextLink}
      href={altPath}
      fontSize="sm"
      fontWeight="medium"
      letterSpacing="wide"
      textTransform="uppercase"
      borderBottom="1px solid"
      borderColor="currentColor"
      pb="1px"
      transition="default"
      _hover={{ opacity: 0.7 }}
    >
      {label}
    </Link>
  );
}
```

```ts
// src/components/LanguageToggle/index.ts
export { LanguageToggle } from './LanguageToggle';
```

- [ ] **Step 8: Run test to verify it passes**

```bash
npx vitest run src/components/LanguageToggle/LanguageToggle.test.tsx
```

Expected: PASS.

- [ ] **Step 9: Write Header test**

```tsx
// src/components/Header/Header.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from './Header';

vi.mock('next-intl', () => ({
  useLocale: () => 'pt-BR',
}));
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));
vi.mock('@/hooks/useScrollHeader', () => ({
  useScrollHeader: () => ({ isCompact: false }),
}));

describe('Header', () => {
  it('renders site name', () => {
    render(<Header homePath="/" currentPath="/" />);
    expect(screen.getByText('guitta')).toBeInTheDocument();
    expect(screen.getByText('monatega')).toBeInTheDocument();
  });

  it('links to home path', () => {
    render(<Header homePath="/en" currentPath="/en" />);
    const link = screen.getByRole('link', { name: /guitta/i });
    expect(link).toHaveAttribute('href', '/en');
  });
});
```

- [ ] **Step 10: Run test to verify it fails**

```bash
npx vitest run src/components/Header/Header.test.tsx
```

Expected: FAIL.

- [ ] **Step 11: Implement Header**

```tsx
// src/components/Header/Header.tsx
'use client';
import { Box, Flex, Link as ChakraLink } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useLocale } from 'next-intl';
import { useScrollHeader } from '@/hooks/useScrollHeader';
import { LanguageToggle } from '@/components/LanguageToggle';

interface HeaderProps {
  homePath: string;
  transparent?: boolean;
  currentPath: string;
}

export function Header({ homePath, transparent = false, currentPath }: HeaderProps) {
  const { isCompact } = useScrollHeader(80);

  return (
    <Box
      as="header"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={100}
      bg={transparent && !isCompact ? 'transparent' : 'headerBg'}
      backdropFilter={transparent && !isCompact ? 'none' : 'blur(14px)'}
      transition="all 0.3s ease"
      px={['lg', 'lg', 'xl']}
      py={isCompact ? '0.6rem' : ['1.2rem', '1.2rem', 'md']}
    >
      <Flex justify="space-between" align="center">
        <ChakraLink
          as={NextLink}
          href={homePath}
          fontSize={isCompact ? 'base' : ['base', 'base', 'xl']}
          fontWeight="light"
          letterSpacing="wider"
          textTransform="lowercase"
          color="fg"
          _hover={{ textDecoration: 'none' }}
          transition="default"
        >
          <Box as="strong" fontWeight="medium">guitta</Box>{' '}monatega
        </ChakraLink>
        <LanguageToggle currentPath={currentPath} />
      </Flex>
    </Box>
  );
}
```

```ts
// src/components/Header/index.ts
export { Header } from './Header';
```

- [ ] **Step 12: Run test to verify it passes**

```bash
npx vitest run src/components/Header/Header.test.tsx
```

Expected: PASS.

- [ ] **Step 13: Write Header story**

```tsx
// src/components/Header/Header.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Header } from './Header';

const meta: Meta<typeof Header> = {
  title: 'Layout/Header',
  component: Header,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {
  args: { homePath: '/', currentPath: '/' },
};

export const Transparent: Story = {
  args: { homePath: '/', currentPath: '/', transparent: true },
};
```

- [ ] **Step 14: Write Footer test**

```tsx
// src/components/Footer/Footer.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Footer } from './Footer';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

describe('Footer', () => {
  it('renders about link', () => {
    render(<Footer aboutPath="/about" aboutLabel="sobre guitta monatega" />);
    expect(screen.getByText('sobre guitta monatega')).toBeInTheDocument();
  });

  it('links to about path', () => {
    render(<Footer aboutPath="/about" aboutLabel="about" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/about');
  });
});
```

- [ ] **Step 15: Run test to verify it fails, then implement Footer**

```tsx
// src/components/Footer/Footer.tsx
import { Box, Flex, Link as ChakraLink } from '@chakra-ui/react';
import NextLink from 'next/link';

interface FooterProps {
  aboutPath: string;
  aboutLabel: string;
}

export function Footer({ aboutPath, aboutLabel }: FooterProps) {
  return (
    <Box as="footer" py={['2rem', '2rem', 'xl']} px="lg">
      <Flex direction="column" align="center" gap="lg">
        <Box w="30px" h="1px" bg="borderColor" />
        <ChakraLink
          as={NextLink}
          href={aboutPath}
          fontSize="xs"
          fontWeight="light"
          letterSpacing="widest"
          textTransform="lowercase"
          color="fgMuted"
          _hover={{ color: 'fg' }}
          transition="default"
        >
          {aboutLabel}
        </ChakraLink>
      </Flex>
    </Box>
  );
}
```

```ts
// src/components/Footer/index.ts
export { Footer } from './Footer';
```

- [ ] **Step 16: Run Footer test to verify it passes**

```bash
npx vitest run src/components/Footer/Footer.test.tsx
```

Expected: PASS.

- [ ] **Step 17: Write Footer story**

```tsx
// src/components/Footer/Footer.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Footer } from './Footer';

const meta: Meta<typeof Footer> = {
  title: 'Layout/Footer',
  component: Footer,
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {
  args: { aboutPath: '/about', aboutLabel: 'sobre guitta monatega' },
};
```

- [ ] **Step 18: Write Breadcrumb test, implement, and story**

```tsx
// src/components/Breadcrumb/Breadcrumb.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Breadcrumb } from './Breadcrumb';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

describe('Breadcrumb', () => {
  it('renders items', () => {
    render(<Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Bichittos' }]} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Bichittos')).toBeInTheDocument();
  });

  it('last item has no link', () => {
    render(<Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Art' }]} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2); // home icon + "Home"
  });
});
```

```tsx
// src/components/Breadcrumb/Breadcrumb.tsx
'use client';
import { Box, Flex, Link as ChakraLink, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { House, ChevronRight, ArrowLeft } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const backHref = items.length > 1 ? items[items.length - 2].href : '/';

  return (
    <Box
      position="fixed"
      top={['50px', '50px', '62px']}
      left={0}
      right={0}
      zIndex={90}
      bg="headerBg"
      backdropFilter="blur(10px)"
      px="lg"
      py="xs"
      transition="all 0.3s ease"
    >
      <Flex align="center" gap="sm" fontSize="base" color="fgSoft">
        {backHref && (
          <ChakraLink as={NextLink} href={backHref} mr="sm" color="fgMuted" _hover={{ color: 'fg' }}>
            <ArrowLeft size={14} />
          </ChakraLink>
        )}
        <ChakraLink as={NextLink} href="/" color="fgMuted" _hover={{ color: 'fg' }}>
          <House size={12} />
        </ChakraLink>
        {items.map((item, i) => (
          <Flex key={i} align="center" gap="sm">
            <ChevronRight size={10} />
            {item.href ? (
              <ChakraLink as={NextLink} href={item.href} color="fgMuted" _hover={{ color: 'fg' }}>
                {item.label}
              </ChakraLink>
            ) : (
              <Text color="fgSoft">{item.label}</Text>
            )}
          </Flex>
        ))}
      </Flex>
    </Box>
  );
}
```

```ts
// src/components/Breadcrumb/index.ts
export { Breadcrumb } from './Breadcrumb';
export type { BreadcrumbItem } from './Breadcrumb';
```

```tsx
// src/components/Breadcrumb/Breadcrumb.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumb } from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Layout/Breadcrumb',
  component: Breadcrumb,
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  args: { items: [{ label: 'Home', href: '/' }, { label: 'Bichittos' }] },
};

export const ThreeLevels: Story = {
  args: { items: [{ label: 'Home', href: '/' }, { label: 'Kammara', href: '/kammara' }, { label: "LUNN'P1" }] },
};
```

- [ ] **Step 19: Write LanguageToggle story**

```tsx
// src/components/LanguageToggle/LanguageToggle.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { LanguageToggle } from './LanguageToggle';

const meta: Meta<typeof LanguageToggle> = {
  title: 'Layout/LanguageToggle',
  component: LanguageToggle,
};

export default meta;
type Story = StoryObj<typeof LanguageToggle>;

export const Default: Story = {
  args: { currentPath: '/' },
};
```

- [ ] **Step 20: Run all layout component tests**

```bash
npx vitest run src/components/Header/ src/components/Footer/ src/components/Breadcrumb/ src/components/LanguageToggle/ src/hooks/useScrollHeader.test.ts
```

Expected: All PASS.

- [ ] **Step 21: Update locale layout with Header + Footer**

```tsx
// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const t = await getTranslations('common');
  const homePath = locale === 'en' ? '/en' : '/';
  const aboutPath = locale === 'en' ? '/en/about' : '/about';

  return (
    <NextIntlClientProvider messages={messages}>
      <Header homePath={homePath} currentPath={homePath} />
      <main style={{ paddingTop: '62px' }}>{children}</main>
      <Footer aboutPath={aboutPath} aboutLabel={t('footerAbout')} />
    </NextIntlClientProvider>
  );
}
```

- [ ] **Step 22: Commit**

```bash
git add src/components/Header/ src/components/Footer/ src/components/Breadcrumb/ src/components/LanguageToggle/ src/hooks/ src/app/
git commit -m "feat: add Header, Footer, LanguageToggle, Breadcrumb components with tests and stories"
```

---

## Task 7: Image Manifest System

**Files:**
- Create: `scripts/generate-manifest.ts`, `src/data/image-manifest.json`, `src/lib/images.ts`, `src/lib/images.test.ts`

- [ ] **Step 1: Write images.ts types and helper tests**

```ts
// src/lib/images.test.ts
import { describe, it, expect } from 'vitest';
import { getCharacters, getBooks, getArtImages, getScenes } from './images';

describe('Image Manifest Helpers', () => {
  it('getCharacters returns array for valid creature', () => {
    const chars = getCharacters('napcat');
    expect(Array.isArray(chars)).toBe(true);
  });

  it('getCharacters returns empty array for unknown creature', () => {
    const chars = getCharacters('nonexistent');
    expect(chars).toEqual([]);
  });

  it('getBooks returns array for valid section', () => {
    const books = getBooks('napcat');
    expect(Array.isArray(books)).toBe(true);
  });

  it('getArtImages returns array for valid section', () => {
    const images = getArtImages('digital');
    expect(Array.isArray(images)).toBe(true);
  });

  it('getScenes returns array for valid world', () => {
    const scenes = getScenes('lunnp1');
    expect(Array.isArray(scenes)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/lib/images.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Create generate-manifest.ts script**

```ts
// scripts/generate-manifest.ts
import fs from 'fs';
import path from 'path';

const PUBLIC = path.resolve(process.cwd(), 'public');
const IMGS = path.join(PUBLIC, 'imgs');
const OUTPUT = path.resolve(process.cwd(), 'src/data/image-manifest.json');

const IMAGE_EXTS = /\.(png|jpg|jpeg|webp|gif|svg)$/i;

function listImages(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => IMAGE_EXTS.test(f))
    .sort();
}

function listDirs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => fs.statSync(path.join(dir, f)).isDirectory())
    .sort();
}

// Build characters manifest
function buildCharacters() {
  const charsDir = path.join(IMGS, 'characters');
  const result: Record<string, { name: string; image: string }[]> = {};
  
  for (const creature of listDirs(charsDir)) {
    const creatureDir = path.join(charsDir, creature);
    // Check if it has sub-worlds (kammara pattern)
    const subDirs = listDirs(creatureDir);
    const directImages = listImages(creatureDir);
    
    if (directImages.length > 0) {
      result[creature] = directImages.map((f) => ({
        name: f.replace(IMAGE_EXTS, '').replace(/^\d+[-_]?/, '').replace(/[_-]/g, ' ').trim(),
        image: `/imgs/characters/${creature}/${f}`,
      }));
    }
    
    // Sub-directories (e.g., kammara worlds)
    for (const sub of subDirs) {
      if (sub.startsWith('_')) continue; // skip _scenes, _bg, etc.
      const subImages = listImages(path.join(creatureDir, sub));
      result[`${creature}/${sub}`] = subImages.map((f) => ({
        name: f.replace(IMAGE_EXTS, '').replace(/^\d+[-_]?/, '').replace(/[_-]/g, ' ').trim(),
        image: `/imgs/characters/${creature}/${sub}/${f}`,
      }));
    }
  }
  return result;
}

// Build books manifest
function buildBooks() {
  const booksDir = path.join(IMGS, 'books');
  const result: Record<string, { id: string; cover: string | null; pages: string[] }[]> = {};
  
  for (const section of listDirs(booksDir)) {
    const sectionDir = path.join(booksDir, section);
    result[section] = [];
    
    for (const book of listDirs(sectionDir)) {
      const bookDir = path.join(sectionDir, book);
      const coverCandidates = listImages(bookDir).filter((f) => f.startsWith('cover'));
      const pagesDir = path.join(bookDir, 'pages');
      const pages = listImages(pagesDir).map((f) => `/imgs/books/${section}/${book}/pages/${f}`);
      
      result[section].push({
        id: book,
        cover: coverCandidates[0] ? `/imgs/books/${section}/${book}/${coverCandidates[0]}` : null,
        pages,
      });
    }
  }
  return result;
}

// Build art manifest
function buildArt() {
  const artDir = path.join(IMGS, 'art');
  const result: Record<string, { thumbs: string[]; full: string[] }> = {};
  
  for (const section of listDirs(artDir)) {
    const sectionDir = path.join(artDir, section);
    const thumbDir = path.join(sectionDir, '_thumb');
    const thumbs = listImages(thumbDir).map((f) => `/imgs/art/${section}/_thumb/${f}`);
    const full = listImages(sectionDir).map((f) => `/imgs/art/${section}/${f}`);
    result[section] = { thumbs, full };
  }
  return result;
}

// Build scenes manifest
function buildScenes() {
  const charsDir = path.join(IMGS, 'characters');
  const result: Record<string, { name: string; image: string }[]> = {};
  
  for (const creature of listDirs(charsDir)) {
    const creatureDir = path.join(charsDir, creature);
    for (const sub of listDirs(creatureDir)) {
      const scenesDir = path.join(creatureDir, sub, '_scenes');
      if (!fs.existsSync(scenesDir)) continue;
      const images = listImages(scenesDir);
      result[`${creature}/${sub}`] = images.map((f) => ({
        name: f.replace(IMAGE_EXTS, '').replace(/^\d+[-_]?/, '').replace(/[_-]/g, ' ').trim(),
        image: `/imgs/characters/${creature}/${sub}/_scenes/${f}`,
      }));
    }
  }
  return result;
}

const manifest = {
  characters: buildCharacters(),
  books: buildBooks(),
  art: buildArt(),
  scenes: buildScenes(),
};

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2));
console.log(`Manifest generated at ${OUTPUT}`);
```

- [ ] **Step 4: Run the manifest generator**

```bash
npx tsx scripts/generate-manifest.ts
```

Expected: Creates `src/data/image-manifest.json` with the project's images.

- [ ] **Step 5: Implement images.ts helpers**

```ts
// src/lib/images.ts
import manifest from '@/data/image-manifest.json';

export interface Character {
  name: string;
  image: string;
}

export interface Book {
  id: string;
  cover: string | null;
  pages: string[];
}

export interface ArtImage {
  thumbs: string[];
  full: string[];
}

export interface Scene {
  name: string;
  image: string;
}

export function getCharacters(creature: string): Character[] {
  return (manifest.characters as Record<string, Character[]>)[creature] ?? [];
}

export function getBooks(section: string): Book[] {
  return (manifest.books as Record<string, Book[]>)[section] ?? [];
}

export function getBookPages(section: string, bookId: string): string[] {
  const books = getBooks(section);
  return books.find((b) => b.id === bookId)?.pages ?? [];
}

export function getArtImages(section: string): ArtImage {
  return (manifest.art as Record<string, ArtImage>)[section] ?? { thumbs: [], full: [] };
}

export function getScenes(world: string): Scene[] {
  return (manifest.scenes as Record<string, Scene[]>)[world] ?? [];
}
```

- [ ] **Step 6: Run images tests**

```bash
npx vitest run src/lib/images.test.ts
```

Expected: PASS.

- [ ] **Step 7: Add generate-manifest to package.json scripts**

Add to `package.json` scripts:
```json
"generate-manifest": "tsx scripts/generate-manifest.ts"
```

- [ ] **Step 8: Commit**

```bash
git add scripts/ src/data/ src/lib/
git commit -m "feat: add image manifest generator and helper functions"
```

---

## Task 8: Simple Presentational Components (SoonBadge, SoonPanel, HeroSection)

**Files:**
- Create: `src/components/SoonBadge/`, `src/components/SoonPanel/`, `src/components/HeroSection/`

- [ ] **Step 1: Write SoonBadge test**

```tsx
// src/components/SoonBadge/SoonBadge.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SoonBadge } from './SoonBadge';

describe('SoonBadge', () => {
  it('renders label text', () => {
    render(<SoonBadge label="soon" />);
    expect(screen.getByText('soon')).toBeInTheDocument();
  });

  it('renders default label when none provided', () => {
    render(<SoonBadge />);
    expect(screen.getByText('soon')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails, then implement SoonBadge**

```tsx
// src/components/SoonBadge/SoonBadge.tsx
import { Flex, Text } from '@chakra-ui/react';
import { Sparkles } from 'lucide-react';

interface SoonBadgeProps {
  label?: string;
  overlay?: boolean;
}

export function SoonBadge({ label = 'soon', overlay = false }: SoonBadgeProps) {
  if (overlay) {
    return (
      <Flex
        position="absolute"
        inset={0}
        align="center"
        justify="center"
        bg="bgOverlayHeavy"
        borderRadius="inherit"
        zIndex={2}
      >
        <Flex
          align="center"
          gap="xs"
          px="sm"
          py="xs"
          borderRadius="full"
          border="1px solid"
          borderColor="textOverlayDim"
          color="textOverlayDim"
          fontSize="sm"
          fontWeight="light"
          letterSpacing="wider"
          textTransform="uppercase"
        >
          <Sparkles size={12} />
          <Text>{label}</Text>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex
      as="span"
      display="inline-flex"
      align="center"
      gap="xs"
      px="sm"
      py="xs"
      borderRadius="full"
      border="1px solid"
      borderColor="fgMuted"
      color="fgMuted"
      fontSize="sm"
      fontWeight="light"
      letterSpacing="wider"
      textTransform="uppercase"
    >
      <Sparkles size={12} />
      <Text as="span">{label}</Text>
    </Flex>
  );
}
```

```ts
// src/components/SoonBadge/index.ts
export { SoonBadge } from './SoonBadge';
```

- [ ] **Step 3: Run SoonBadge test, write story**

```bash
npx vitest run src/components/SoonBadge/SoonBadge.test.tsx
```

```tsx
// src/components/SoonBadge/SoonBadge.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { SoonBadge } from './SoonBadge';

const meta: Meta<typeof SoonBadge> = {
  title: 'Components/SoonBadge',
  component: SoonBadge,
};

export default meta;
type Story = StoryObj<typeof SoonBadge>;

export const Default: Story = { args: { label: 'soon' } };
export const Overlay: Story = {
  args: { label: 'em breve', overlay: true },
  decorators: [(Story) => <div style={{ position: 'relative', width: 200, height: 200, background: '#333' }}><Story /></div>],
};
```

- [ ] **Step 4: Write SoonPanel test, implement, and story**

```tsx
// src/components/SoonPanel/SoonPanel.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SoonPanel } from './SoonPanel';

describe('SoonPanel', () => {
  it('renders label', () => {
    render(<SoonPanel label="em breve" />);
    expect(screen.getByText('em breve')).toBeInTheDocument();
  });
});
```

```tsx
// src/components/SoonPanel/SoonPanel.tsx
import { Flex, Text } from '@chakra-ui/react';

interface SoonPanelProps {
  label?: string;
  color?: string;
}

export function SoonPanel({ label = 'soon', color = 'textOverlayDim' }: SoonPanelProps) {
  return (
    <Flex
      minH="200px"
      align="center"
      justify="center"
      borderRadius="12px"
    >
      <Text
        color={color}
        border="1px solid"
        borderColor={color}
        borderRadius="full"
        px="lg"
        py="xs"
        fontSize="sm"
        fontWeight="light"
        letterSpacing="widest"
        textTransform="uppercase"
      >
        {label}
      </Text>
    </Flex>
  );
}
```

```ts
// src/components/SoonPanel/index.ts
export { SoonPanel } from './SoonPanel';
```

```tsx
// src/components/SoonPanel/SoonPanel.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { SoonPanel } from './SoonPanel';

const meta: Meta<typeof SoonPanel> = {
  title: 'Components/SoonPanel',
  component: SoonPanel,
};

export default meta;
type Story = StoryObj<typeof SoonPanel>;

export const Default: Story = { args: { label: 'soon' } };
```

- [ ] **Step 5: Write HeroSection test, implement, and story**

```tsx
// src/components/HeroSection/HeroSection.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HeroSection } from './HeroSection';

describe('HeroSection', () => {
  it('renders label, title, and description', () => {
    render(<HeroSection label="serie" title="Bichittos" description="A series about..." background="#000" />);
    expect(screen.getByText('serie')).toBeInTheDocument();
    expect(screen.getByText('Bichittos')).toBeInTheDocument();
    expect(screen.getByText('A series about...')).toBeInTheDocument();
  });

  it('renders without description', () => {
    render(<HeroSection label="art" title="Arte" background="#fff" />);
    expect(screen.getByText('Arte')).toBeInTheDocument();
  });
});
```

```tsx
// src/components/HeroSection/HeroSection.tsx
import { Box, Flex, Text, Heading } from '@chakra-ui/react';

interface HeroSectionProps {
  label: string;
  title: string;
  description?: string;
  background: string;
  textColor?: string;
  labelColor?: string;
  minHeight?: string;
  children?: React.ReactNode;
}

export function HeroSection({
  label,
  title,
  description,
  background,
  textColor = 'white',
  labelColor = 'textOverlayDim',
  minHeight = '15vh',
  children,
}: HeroSectionProps) {
  return (
    <Flex
      as="section"
      direction="column"
      align="center"
      justify="center"
      textAlign="center"
      bg={background}
      minH={minHeight}
      px="lg"
      py="2xl"
      position="relative"
      overflow="hidden"
    >
      {children}
      <Text
        color={labelColor}
        fontSize="xs"
        fontWeight="light"
        letterSpacing="widest"
        textTransform="uppercase"
        mb="sm"
        animation="fadeIn 0.5s ease 0.1s both"
      >
        {label}
      </Text>
      <Heading
        color={textColor}
        fontSize="h2"
        fontWeight="thin"
        letterSpacing="wider"
        textTransform="lowercase"
        animation="fadeIn 0.5s ease 0.2s both"
      >
        {title}
      </Heading>
      {description && (
        <Text
          color={labelColor}
          fontSize="base"
          fontWeight="light"
          mt="md"
          maxW="500px"
          animation="fadeIn 0.5s ease 0.4s both"
        >
          {description}
        </Text>
      )}
    </Flex>
  );
}
```

```ts
// src/components/HeroSection/index.ts
export { HeroSection } from './HeroSection';
```

```tsx
// src/components/HeroSection/HeroSection.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { HeroSection } from './HeroSection';

const meta: Meta<typeof HeroSection> = {
  title: 'Components/HeroSection',
  component: HeroSection,
};

export default meta;
type Story = StoryObj<typeof HeroSection>;

export const Dark: Story = {
  args: { label: 'serie', title: 'Bichittos', description: 'A series about cute creatures', background: 'linear-gradient(135deg, #1a1432, #2a1f4a)' },
};

export const Light: Story = {
  args: { label: 'portfolio', title: 'Arte', background: '#f5f5f5', textColor: '#2d2d2d', labelColor: 'rgba(0,0,0,0.4)' },
};
```

- [ ] **Step 6: Run all tests for this task**

```bash
npx vitest run src/components/SoonBadge/ src/components/SoonPanel/ src/components/HeroSection/
```

Expected: All PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/SoonBadge/ src/components/SoonPanel/ src/components/HeroSection/
git commit -m "feat: add SoonBadge, SoonPanel, HeroSection components with tests and stories"
```

---

## Task 9: CharacterCard + CreatureCard + WorldCard

**Files:**
- Create: `src/components/CharacterCard/`, `src/components/CreatureCard/`, `src/components/WorldCard/`

Each of these follows the same TDD pattern: write test → verify fail → implement → verify pass → write story → commit.

Refer to the Astro source for exact CSS values. Key details:

- **CharacterCard**: cardFloat keyframe animation, --card-size CSS variable, hover scale 1.35x, glow background from gradient prop. `noBorder` variant scales 2x. `transparent` variant has outline style.
- **CreatureCard**: opacity/transform reveal animation with `.visible` class toggle. Max-width 1000px.
- **WorldCard**: gradient classes mapped from palettes. Conditional `banner` vs `side` layout. `stripLayout` prop.

Each component receives its palette colors via props (not CSS classes). Use Chakra `Box`, `Flex`, `Grid`, `Image`, `Heading`, `Text` primitives with responsive arrays for breakpoints.

- [ ] **Step 1: Write CharacterCard test**
- [ ] **Step 2: Run test to verify fail**
- [ ] **Step 3: Implement CharacterCard using Chakra Box + CSS keyframes**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Write CharacterCard story with variants (default, transparent, noBorder)**
- [ ] **Step 6: Write CreatureCard test**
- [ ] **Step 7: Run test to verify fail**
- [ ] **Step 8: Implement CreatureCard**
- [ ] **Step 9: Run test to verify pass**
- [ ] **Step 10: Write CreatureCard story**
- [ ] **Step 11: Write WorldCard test**
- [ ] **Step 12: Run test to verify fail**
- [ ] **Step 13: Implement WorldCard with palette prop and layout variants**
- [ ] **Step 14: Run test to verify pass**
- [ ] **Step 15: Write WorldCard story with palette variants**
- [ ] **Step 16: Run all tests**

```bash
npx vitest run src/components/CharacterCard/ src/components/CreatureCard/ src/components/WorldCard/
```

Expected: All PASS.

- [ ] **Step 17: Commit**

```bash
git add src/components/CharacterCard/ src/components/CreatureCard/ src/components/WorldCard/
git commit -m "feat: add CharacterCard, CreatureCard, WorldCard with tests and stories"
```

---

## Task 10: DSMainCard + DSTextPanel + SubSystem + BookGallery + ArtSection

**Files:**
- Create: all 5 component directories with `.tsx`, `.test.tsx`, `.stories.tsx`, `index.ts`

These are the complex layout/content components. Follow TDD pattern for each.

Key details from Astro source:
- **DSMainCard**: Absolute-positioned characters over gradient background. Mascot + DSTextPanel in text wrap. stripSide layout variant. Responsive at 768px and 1500px.
- **DSTextPanel**: Scrollable text container with mask gradients (transparent→black→transparent). h2/h3/p typography with passed color props.
- **SubSystem**: 3-column grid (calc 33.333% - 1rem), card height 400px→500px→550px by breakpoint. Image left, scrollable text right on 1900px+.
- **BookGallery**: Grid of book covers with dynamic column count. 4:3 aspect ratio (3:2 mobile). Hover translateY(-4px).
- **ArtSection**: Art image grid with hidden/visible toggle. auto-fill minmax(220px). Large variant: 5 cols (3 mobile).

- [ ] **Step 1-5: DSTextPanel (test → fail → implement → pass → story)**
- [ ] **Step 6-10: DSMainCard (test → fail → implement → pass → story)**
- [ ] **Step 11-15: SubSystem (test → fail → implement → pass → story)**
- [ ] **Step 16-20: BookGallery (test → fail → implement → pass → story)**
- [ ] **Step 21-25: ArtSection (test → fail → implement → pass → story)**

- [ ] **Step 26: Run all tests**

```bash
npx vitest run src/components/DSMainCard/ src/components/DSTextPanel/ src/components/SubSystem/ src/components/BookGallery/ src/components/ArtSection/
```

Expected: All PASS.

- [ ] **Step 27: Commit**

```bash
git add src/components/DSMainCard/ src/components/DSTextPanel/ src/components/SubSystem/ src/components/BookGallery/ src/components/ArtSection/
git commit -m "feat: add DSMainCard, DSTextPanel, SubSystem, BookGallery, ArtSection with tests and stories"
```

---

## Task 11: ScrollReveal Hook + Component

**Files:**
- Create: `src/hooks/useScrollReveal.ts`, `src/hooks/useScrollReveal.test.ts`, `src/components/ScrollReveal/`

- [ ] **Step 1: Write useScrollReveal test**

```ts
// src/hooks/useScrollReveal.test.ts
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useScrollReveal } from './useScrollReveal';
import { useRef } from 'react';

describe('useScrollReveal', () => {
  it('returns isVisible false initially', () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      return useScrollReveal(ref);
    });
    expect(result.current).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify fail**
- [ ] **Step 3: Implement useScrollReveal**

```ts
// src/hooks/useScrollReveal.ts
'use client';
import { useEffect, useState, type RefObject } from 'react';

export function useScrollReveal(
  ref: RefObject<HTMLElement | null>,
  options?: { threshold?: number; once?: boolean }
): boolean {
  const [isVisible, setIsVisible] = useState(false);
  const threshold = options?.threshold ?? 0.15;
  const once = options?.once ?? true;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold, once]);

  return isVisible;
}
```

- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Write ScrollReveal component (wraps children with reveal effect)**

```tsx
// src/components/ScrollReveal/ScrollReveal.tsx
'use client';
import { useRef } from 'react';
import { Box } from '@chakra-ui/react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface ScrollRevealProps {
  children: React.ReactNode;
  threshold?: number;
}

export function ScrollReveal({ children, threshold }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useScrollReveal(ref, { threshold });

  return (
    <Box
      ref={ref}
      opacity={isVisible ? 1 : 0}
      transform={isVisible ? 'translateY(0)' : 'translateY(10px)'}
      transition="opacity 0.7s ease, transform 0.7s ease"
    >
      {children}
    </Box>
  );
}
```

```ts
// src/components/ScrollReveal/index.ts
export { ScrollReveal } from './ScrollReveal';
```

- [ ] **Step 6: Write ScrollReveal test and story**
- [ ] **Step 7: Commit**

```bash
git add src/hooks/useScrollReveal.ts src/hooks/useScrollReveal.test.ts src/components/ScrollReveal/
git commit -m "feat: add useScrollReveal hook and ScrollReveal component"
```

---

## Task 12: FilterBar Component

**Files:**
- Create: `src/components/FilterBar/`

- [ ] **Step 1: Write FilterBar test**

```tsx
// src/components/FilterBar/FilterBar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterBar } from './FilterBar';

describe('FilterBar', () => {
  const filters = [
    { id: 'napcat', label: 'NapCat', color: '#667eea' },
    { id: 'zeco', label: 'Zeco', color: '#ff8c42' },
  ];

  it('renders all filter buttons plus "All"', () => {
    render(<FilterBar filters={filters} onFilter={() => {}} />);
    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('NapCat')).toBeInTheDocument();
    expect(screen.getByText('Zeco')).toBeInTheDocument();
  });

  it('calls onFilter with filter id on click', () => {
    const onFilter = vi.fn();
    render(<FilterBar filters={filters} onFilter={onFilter} />);
    fireEvent.click(screen.getByText('NapCat'));
    expect(onFilter).toHaveBeenCalledWith('napcat');
  });

  it('calls onFilter with "all" when All is clicked', () => {
    const onFilter = vi.fn();
    render(<FilterBar filters={filters} onFilter={onFilter} />);
    fireEvent.click(screen.getByText('Todos'));
    expect(onFilter).toHaveBeenCalledWith('all');
  });
});
```

- [ ] **Step 2: Run test to verify fail**
- [ ] **Step 3: Implement FilterBar**

```tsx
// src/components/FilterBar/FilterBar.tsx
'use client';
import { useState } from 'react';
import { Flex, Button } from '@chakra-ui/react';

export interface FilterItem {
  id: string;
  label: string;
  color?: string;
  bgColor?: string;
}

interface FilterBarProps {
  filters: FilterItem[];
  allLabel?: string;
  onFilter: (filterId: string) => void;
}

export function FilterBar({ filters, allLabel = 'Todos', onFilter }: FilterBarProps) {
  const [active, setActive] = useState('all');

  const handleClick = (id: string) => {
    setActive(id);
    onFilter(id);
  };

  return (
    <Flex
      as="nav"
      position="sticky"
      top={['60px', '60px', '92px']}
      zIndex={80}
      gap="sm"
      px="lg"
      py="sm"
      bg="headerBg"
      backdropFilter="blur(10px)"
      overflowX="auto"
      flexWrap="nowrap"
    >
      <Button
        size="sm"
        variant={active === 'all' ? 'solid' : 'outline'}
        borderRadius="full"
        fontSize="sm"
        fontWeight="regular"
        letterSpacing="normal"
        onClick={() => handleClick('all')}
      >
        {allLabel}
      </Button>
      {filters.map((f) => (
        <Button
          key={f.id}
          size="sm"
          variant={active === f.id ? 'solid' : 'outline'}
          borderRadius="full"
          fontSize="sm"
          fontWeight="regular"
          letterSpacing="normal"
          bg={active === f.id ? f.bgColor || f.color : undefined}
          color={active === f.id ? 'white' : f.color}
          borderColor={f.color}
          onClick={() => handleClick(f.id)}
          _hover={{ bg: f.bgColor || f.color, color: 'white' }}
        >
          {f.label}
        </Button>
      ))}
    </Flex>
  );
}
```

```ts
// src/components/FilterBar/index.ts
export { FilterBar } from './FilterBar';
export type { FilterItem } from './FilterBar';
```

- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Write FilterBar story**

```tsx
// src/components/FilterBar/FilterBar.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { FilterBar } from './FilterBar';

const meta: Meta<typeof FilterBar> = {
  title: 'Components/FilterBar',
  component: FilterBar,
};

export default meta;
type Story = StoryObj<typeof FilterBar>;

export const Bichittos: Story = {
  args: {
    filters: [
      { id: 'napcat', label: 'NapCat', color: '#667eea' },
      { id: 'zeco', label: 'Zeco', color: '#ff8c42' },
      { id: 'taylo', label: 'Taylo', color: '#5d9466' },
      { id: 'miscelania', label: 'Miscelania', color: '#3a5a8c' },
    ],
    onFilter: (id) => console.log('Filter:', id),
  },
};
```

- [ ] **Step 6: Commit**

```bash
git add src/components/FilterBar/
git commit -m "feat: add FilterBar component with filter state and palette colors"
```

---

## Task 13: Modal / Gallery System

**Files:**
- Create: `src/components/Modal/ModalProvider.tsx`, `src/components/Modal/Modal.tsx`, `src/components/Modal/Modal.test.tsx`, `src/components/Modal/Modal.stories.tsx`, `src/components/Modal/index.ts`

- [ ] **Step 1: Write Modal test**

```tsx
// src/components/Modal/Modal.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ModalProvider, useModal } from './ModalProvider';
import { Modal } from './Modal';

function TestConsumer() {
  const { openGallery, registerGallery } = useModal();
  registerGallery('test', ['/img1.jpg', '/img2.jpg', '/img3.jpg']);
  return (
    <button onClick={() => openGallery('test', 0, 'Test Gallery', 'Digital')}>
      Open
    </button>
  );
}

function TestModal() {
  return (
    <ModalProvider>
      <TestConsumer />
      <Modal />
    </ModalProvider>
  );
}

describe('Modal', () => {
  it('opens gallery on trigger', () => {
    render(<TestModal />);
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByAltText(/1 \/ 3/)).toBeInTheDocument();
  });

  it('navigates to next image', () => {
    render(<TestModal />);
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByLabelText('Next'));
    expect(screen.getByAltText(/2 \/ 3/)).toBeInTheDocument();
  });

  it('closes on Escape', () => {
    render(<TestModal />);
    fireEvent.click(screen.getByText('Open'));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByAltText(/1 \/ 3/)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify fail**
- [ ] **Step 3: Implement ModalProvider**

```tsx
// src/components/Modal/ModalProvider.tsx
'use client';
import { createContext, useContext, useState, useCallback, useRef } from 'react';

interface ModalState {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  title: string;
  technique: string;
  theme?: string;
  heroTitle?: string;
  heroText?: string;
}

interface ModalContextType {
  state: ModalState;
  openGallery: (galleryId: string, startIndex: number, title?: string, technique?: string, theme?: string) => void;
  openModal: (title: string, technique: string, images: string[], startIndex: number, theme?: string, heroTitle?: string, heroText?: string) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  registerGallery: (id: string, images: string[]) => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ModalState>({
    isOpen: false,
    images: [],
    currentIndex: 0,
    title: '',
    technique: '',
  });

  const galleriesRef = useRef<Record<string, string[]>>({});

  const registerGallery = useCallback((id: string, images: string[]) => {
    galleriesRef.current[id] = images;
  }, []);

  const openGallery = useCallback((galleryId: string, startIndex: number, title = '', technique = '', theme?: string) => {
    const images = galleriesRef.current[galleryId];
    if (!images) return;
    setState({ isOpen: true, images, currentIndex: startIndex, title, technique, theme });
  }, []);

  const openModal = useCallback((title: string, technique: string, images: string[], startIndex: number, theme?: string, heroTitle?: string, heroText?: string) => {
    setState({ isOpen: true, images, currentIndex: startIndex, title, technique, theme, heroTitle, heroText });
  }, []);

  const close = useCallback(() => {
    setState((s) => ({ ...s, isOpen: false }));
  }, []);

  const next = useCallback(() => {
    setState((s) => ({
      ...s,
      currentIndex: (s.currentIndex + 1) % s.images.length,
    }));
  }, []);

  const prev = useCallback(() => {
    setState((s) => ({
      ...s,
      currentIndex: (s.currentIndex - 1 + s.images.length) % s.images.length,
    }));
  }, []);

  return (
    <ModalContext.Provider value={{ state, openGallery, openModal, close, next, prev, registerGallery }}>
      {children}
    </ModalContext.Provider>
  );
}
```

- [ ] **Step 4: Implement Modal component**

```tsx
// src/components/Modal/Modal.tsx
'use client';
import { useEffect } from 'react';
import { Box, Flex, Text, IconButton, Image } from '@chakra-ui/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useModal } from './ModalProvider';

export function Modal() {
  const { state, close, next, prev } = useModal();
  const { isOpen, images, currentIndex, title, technique } = state;

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, close, next, prev]);

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={200}
      bg="overlayDark"
      onClick={close}
    >
      <Flex
        h="100%"
        align="center"
        justify="center"
        direction="column"
        onClick={(e) => e.stopPropagation()}
      >
        <IconButton
          aria-label="Close"
          position="absolute"
          top={4}
          right={4}
          variant="ghost"
          color="white"
          onClick={close}
        >
          <X size={24} />
        </IconButton>

        <Flex align="center" gap={4} maxW="90vw" maxH="85vh">
          <IconButton
            aria-label="Previous"
            variant="ghost"
            color="white"
            onClick={prev}
            display={['none', 'flex']}
          >
            <ChevronLeft size={32} />
          </IconButton>

          <Image
            src={images[currentIndex]}
            alt={`${title} ${currentIndex + 1} / ${images.length}`}
            maxH="80vh"
            maxW={['90vw', '75vw']}
            objectFit="contain"
            borderRadius="md"
          />

          <IconButton
            aria-label="Next"
            variant="ghost"
            color="white"
            onClick={next}
            display={['none', 'flex']}
          >
            <ChevronRight size={32} />
          </IconButton>
        </Flex>

        <Flex
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          py="md"
          px="lg"
          bg="rgba(0,0,0,0.6)"
          backdropFilter="blur(10px)"
          justify="center"
          align="center"
          gap="lg"
        >
          {title && (
            <Text color="white" fontSize="base" fontWeight="light" letterSpacing="wide">
              {title}
            </Text>
          )}
          {technique && (
            <Text color="textOverlayDim" fontSize="sm" fontWeight="light">
              {technique}
            </Text>
          )}
          <Text color="textOverlayDim" fontSize="sm">
            {currentIndex + 1} / {images.length}
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
}
```

```ts
// src/components/Modal/index.ts
export { Modal } from './Modal';
export { ModalProvider, useModal } from './ModalProvider';
```

- [ ] **Step 5: Run test to verify pass**

```bash
npx vitest run src/components/Modal/Modal.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Write Modal story**

```tsx
// src/components/Modal/Modal.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ModalProvider, useModal } from './ModalProvider';
import { Modal } from './Modal';
import { useEffect } from 'react';

function ModalOpener() {
  const { openModal } = useModal();
  useEffect(() => {
    openModal('Gallery Demo', 'Digital Art', [
      'https://via.placeholder.com/800x600/667eea/ffffff?text=Image+1',
      'https://via.placeholder.com/800x600/764ba2/ffffff?text=Image+2',
      'https://via.placeholder.com/800x600/ff6b9d/ffffff?text=Image+3',
    ], 0);
  }, [openModal]);
  return null;
}

const meta: Meta = {
  title: 'Components/Modal',
  decorators: [
    (Story) => (
      <ModalProvider>
        <ModalOpener />
        <Modal />
      </ModalProvider>
    ),
  ],
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Default: StoryObj = {};
```

- [ ] **Step 7: Add ModalProvider to locale layout**

Update `src/app/[locale]/layout.tsx` to wrap children with `<ModalProvider>` and include `<Modal />`.

- [ ] **Step 8: Commit**

```bash
git add src/components/Modal/ src/app/
git commit -m "feat: add Modal/Gallery system with React Context, keyboard navigation, tests and stories"
```

---

## Task 14: Animation Hooks (useParallax, useStripAnimation)

**Files:**
- Create: `src/hooks/useParallax.ts`, `src/hooks/useParallax.test.ts`, `src/hooks/useStripAnimation.ts`, `src/hooks/useStripAnimation.test.ts`

- [ ] **Step 1: Write useParallax test**

```ts
// src/hooks/useParallax.test.ts
import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useParallax } from './useParallax';
import { useRef } from 'react';

describe('useParallax', () => {
  it('does not throw when ref is null', () => {
    expect(() => {
      renderHook(() => {
        const ref = useRef<HTMLDivElement>(null);
        useParallax(ref, 0.15);
      });
    }).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify fail**
- [ ] **Step 3: Implement useParallax**

```ts
// src/hooks/useParallax.ts
'use client';
import { useEffect, type RefObject } from 'react';

export function useParallax(ref: RefObject<HTMLElement | null>, speed = 0.15) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId: number;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;
      if (rect.bottom > 0 && rect.top < windowH) {
        const offset = rect.top * speed;
        el.style.transform = `translateY(${offset}px)`;
      }
      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [ref, speed]);
}
```

- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Write useStripAnimation test**

```ts
// src/hooks/useStripAnimation.test.ts
import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useStripAnimation } from './useStripAnimation';
import { useRef } from 'react';

describe('useStripAnimation', () => {
  it('returns pause and resume functions', () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      return useStripAnimation(ref, { speed: 30, direction: 'left', pauseOnHover: true });
    });
    expect(typeof result.current.pause).toBe('function');
    expect(typeof result.current.resume).toBe('function');
  });
});
```

- [ ] **Step 6: Run test to verify fail**
- [ ] **Step 7: Implement useStripAnimation**

```ts
// src/hooks/useStripAnimation.ts
'use client';
import { useEffect, useCallback, useRef as useReactRef, type RefObject } from 'react';

interface StripOptions {
  speed: number;
  direction: 'left' | 'right';
  pauseOnHover: boolean;
}

export function useStripAnimation(
  trackRef: RefObject<HTMLElement | null>,
  options: StripOptions
) {
  const animRef = useReactRef<Animation | null>(null);

  const pause = useCallback(() => {
    animRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    animRef.current?.play();
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const halfWidth = track.scrollWidth / 2;
    const translateValue = options.direction === 'left' ? -halfWidth : halfWidth;

    const anim = track.animate(
      [
        { transform: 'translateX(0)' },
        { transform: `translateX(${translateValue}px)` },
      ],
      {
        duration: options.speed * 1000,
        iterations: Infinity,
        easing: 'linear',
      }
    );

    animRef.current = anim;

    if (options.pauseOnHover) {
      const handleEnter = () => { anim.playbackRate = 0.3; };
      const handleLeave = () => { anim.playbackRate = 1; };
      track.addEventListener('mouseenter', handleEnter);
      track.addEventListener('mouseleave', handleLeave);
      return () => {
        anim.cancel();
        track.removeEventListener('mouseenter', handleEnter);
        track.removeEventListener('mouseleave', handleLeave);
      };
    }

    return () => anim.cancel();
  }, [trackRef, options.speed, options.direction, options.pauseOnHover]);

  return { pause, resume };
}
```

- [ ] **Step 8: Run test to verify pass**
- [ ] **Step 9: Commit**

```bash
git add src/hooks/useParallax.ts src/hooks/useParallax.test.ts src/hooks/useStripAnimation.ts src/hooks/useStripAnimation.test.ts
git commit -m "feat: add useParallax and useStripAnimation hooks with tests"
```

---

## Task 15: CharacterStrip + SceneStrip + CreatureSection

**Files:**
- Create: `src/components/CharacterStrip/`, `src/components/SceneStrip/`, `src/components/CreatureSection/`

These are the most complex interactive components. Each uses the animation hooks from Task 14.

- **CharacterStrip**: Renders CharacterCard items in a horizontally scrolling track. Uses `useStripAnimation` for infinite scroll. Arrow buttons scroll by card width + gap. Mask gradients on edges. Responsive: arrows hidden on mobile.
- **SceneStrip**: Similar to CharacterStrip but for scene images (16:9 aspect ratio). Click opens Modal. Arrow-based scrolling.
- **CreatureSection**: Gradient background + optional bg image with parallax via `useParallax`. Accent glow overlay.

Follow TDD pattern for each: test → fail → implement → pass → story.

- [ ] **Step 1-5: CharacterStrip (test → fail → implement → pass → story)**
- [ ] **Step 6-10: SceneStrip (test → fail → implement → pass → story)**
- [ ] **Step 11-15: CreatureSection (test → fail → implement → pass → story)**

- [ ] **Step 16: Run all tests**

```bash
npx vitest run src/components/CharacterStrip/ src/components/SceneStrip/ src/components/CreatureSection/
```

Expected: All PASS.

- [ ] **Step 17: Commit**

```bash
git add src/components/CharacterStrip/ src/components/SceneStrip/ src/components/CreatureSection/
git commit -m "feat: add CharacterStrip, SceneStrip, CreatureSection with animation hooks, tests and stories"
```

---

## Task 16: HomeBanner Component

**Files:**
- Create: `src/components/HomeBanner/`

The most CSS-heavy presentational component. Three variants:
- **bichittos**: 5 floating blurred circles with staggered animations
- **kammara**: 10 twinkling stars + glowing radial orb
- **arte**: 5 animated stroke lines

- [ ] **Step 1: Write HomeBanner test**

```tsx
// src/components/HomeBanner/HomeBanner.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HomeBanner } from './HomeBanner';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

describe('HomeBanner', () => {
  it('renders label, title, and description', () => {
    render(<HomeBanner href="/bichittos" label="serie" title="Bichittos" description="cute creatures" variant="bichittos" />);
    expect(screen.getByText('serie')).toBeInTheDocument();
    expect(screen.getByText('Bichittos')).toBeInTheDocument();
    expect(screen.getByText('cute creatures')).toBeInTheDocument();
  });

  it('links to href', () => {
    render(<HomeBanner href="/kammara" label="saga" title="Kammara" description="worlds" variant="kammara" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/kammara');
  });
});
```

- [ ] **Step 2: Run test to verify fail**
- [ ] **Step 3: Implement HomeBanner with all three variant decorations**

The component uses Chakra `Box` for structure and CSS keyframes defined in `theme/keyframes.ts` for animations. Each variant renders its decorative elements conditionally. Use `sx` prop for complex CSS animations that Chakra props can't express directly.

- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Write HomeBanner story with all 3 variants**
- [ ] **Step 6: Commit**

```bash
git add src/components/HomeBanner/
git commit -m "feat: add HomeBanner component with bichittos/kammara/arte variants, tests and stories"
```

---

## Task 17: Pages (Home, About, Bichittos, Kammara, Art)

**Files:**
- Create/modify: `src/app/[locale]/page.tsx`, `src/app/[locale]/about/page.tsx`, `src/app/[locale]/bichittos/page.tsx`, `src/app/[locale]/kammara/page.tsx`, `src/app/[locale]/art/page.tsx`

Each page composes the components built in Tasks 6-16. Use `useTranslations` from next-intl for all text content. Use `getCharacters`, `getBooks`, etc. from `src/lib/images.ts` for image data.

- [ ] **Step 1: Implement Home page**

Compose: HomeBanner (bichittos + kammara in 2-col grid) + HomeBanner (arte full width). Add hero spacer with site title. Parallax effect on banner backgrounds via `useParallax`.

- [ ] **Step 2: Implement About page**

Static translated content. Max-width 680px centered. Links to Bichittos, Kammara, Art.

- [ ] **Step 3: Implement Bichittos page**

Compose: HeroSection + FilterBar + CreatureSection per creature (napcat, zeco, taylo, miscelania). Each section contains DSMainCard + CharacterStrip + BookGallery. Register book galleries with Modal.

- [ ] **Step 4: Implement Kammara page**

Compose: HeroSection (dark theme) + FilterBar + WorldCard per world (lunnp1, eni4, triplec, orfv, z1, gotto). Each world has DSMainCard + CharacterStrip + SceneStrip + SubSystem. Star field CSS background animation.

- [ ] **Step 5: Implement Art page**

Compose: HeroSection (light) + FilterBar + ArtSection per section (black, grafite, doodle, digital, collections, fimo, needle, clay, croche). Register art galleries with Modal. Map thumb paths to full image paths.

- [ ] **Step 6: Update locale layout with Breadcrumb support**

Pass breadcrumb items based on current route segment.

- [ ] **Step 7: Verify dev server shows all pages**

```bash
npm run dev
```

Navigate: `/`, `/about`, `/bichittos`, `/kammara`, `/art`, `/en`, `/en/about`, etc.

- [ ] **Step 8: Commit**

```bash
git add src/app/
git commit -m "feat: implement all 5 pages (Home, About, Bichittos, Kammara, Art) with i18n"
```

---

## Task 18: Playwright E2E Tests

**Files:**
- Create: `playwright.config.ts`, `src/__tests__/e2e/navigation.spec.ts`, `src/__tests__/e2e/i18n.spec.ts`, `src/__tests__/e2e/modal.spec.ts`, `src/__tests__/e2e/filters.spec.ts`, `src/__tests__/e2e/responsive.spec.ts`

- [ ] **Step 1: Create playwright.config.ts**

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/__tests__/e2e',
  fullyParallel: true,
  retries: 1,
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
  use: {
    baseURL: 'http://localhost:3000',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 } } },
  ],
});
```

- [ ] **Step 2: Install Playwright browsers**

```bash
npx playwright install chromium
```

- [ ] **Step 3: Write navigation E2E test**

```ts
// src/__tests__/e2e/navigation.spec.ts
import { test, expect } from '@playwright/test';

test('navigates between all pages', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Guitta Monatega/);

  await page.click('text=Bichittos');
  await expect(page).toHaveURL(/bichittos/);

  await page.click('text=guitta');
  await expect(page).toHaveURL('/');
});
```

- [ ] **Step 4: Write i18n E2E test**

```ts
// src/__tests__/e2e/i18n.spec.ts
import { test, expect } from '@playwright/test';

test('switches language', async ({ page }) => {
  await page.goto('/');
  await page.click('text=EN');
  await expect(page).toHaveURL(/\/en/);

  await page.click('text=PT');
  await expect(page).toHaveURL('/');
});
```

- [ ] **Step 5: Write modal E2E test**

```ts
// src/__tests__/e2e/modal.spec.ts
import { test, expect } from '@playwright/test';

test('opens and navigates modal gallery', async ({ page }) => {
  await page.goto('/art');
  // Click first art image to open modal
  await page.locator('.art-grid img').first().click();
  await expect(page.locator('[aria-label="Close"]')).toBeVisible();

  // Navigate with keyboard
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Escape');
  await expect(page.locator('[aria-label="Close"]')).not.toBeVisible();
});
```

- [ ] **Step 6: Write filter E2E test**

```ts
// src/__tests__/e2e/filters.spec.ts
import { test, expect } from '@playwright/test';

test('filters sections on Bichittos page', async ({ page }) => {
  await page.goto('/bichittos');
  // Click NapCat filter
  await page.click('text=NapCat');
  // Verify only NapCat section is visible
  // Click All to show everything
  await page.click('text=Todos');
});
```

- [ ] **Step 7: Write responsive E2E test**

```ts
// src/__tests__/e2e/responsive.spec.ts
import { test, expect } from '@playwright/test';

test('mobile layout hides strip arrows', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/bichittos');
  // Arrows should be hidden on mobile
});
```

- [ ] **Step 8: Run E2E tests**

```bash
npx playwright test
```

Expected: All pass across desktop, mobile, tablet.

- [ ] **Step 9: Commit**

```bash
git add playwright.config.ts src/__tests__/e2e/
git commit -m "feat: add Playwright E2E tests for navigation, i18n, modal, filters, responsive"
```

---

## Task 19: Cleanup + Final Verification

**Files:**
- Modify: `package.json` (add scripts)

- [ ] **Step 1: Add all scripts to package.json**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "generate-manifest": "tsx scripts/generate-manifest.ts"
  }
}
```

- [ ] **Step 2: Run all unit tests**

```bash
npm test
```

Expected: All PASS.

- [ ] **Step 3: Run Storybook build**

```bash
npm run build-storybook
```

Expected: Builds without errors.

- [ ] **Step 4: Run production build**

```bash
npm run build
```

Expected: Builds without errors.

- [ ] **Step 5: Run E2E tests**

```bash
npm run test:e2e
```

Expected: All PASS.

- [ ] **Step 6: Add .gitignore entries**

Ensure `.gitignore` includes:
```
.superpowers/
src/data/image-manifest.json
```

- [ ] **Step 7: Commit final**

```bash
git add -A
git commit -m "feat: complete Astro to Next.js + Chakra UI v3 migration"
```

---

## Summary

| Task | What | Est. Steps |
|------|------|-----------|
| 1 | Project Scaffolding | 9 |
| 2 | Chakra Theme System | 6 |
| 3 | i18n Setup | 8 |
| 4 | Root + Locale Layout | 5 |
| 5 | Storybook Config | 5 |
| 6 | Header/Footer/LanguageToggle/Breadcrumb | 22 |
| 7 | Image Manifest System | 8 |
| 8 | SoonBadge/SoonPanel/HeroSection | 7 |
| 9 | CharacterCard/CreatureCard/WorldCard | 17 |
| 10 | DSMainCard/DSTextPanel/SubSystem/BookGallery/ArtSection | 27 |
| 11 | ScrollReveal Hook + Component | 7 |
| 12 | FilterBar | 6 |
| 13 | Modal/Gallery System | 8 |
| 14 | Animation Hooks | 9 |
| 15 | CharacterStrip/SceneStrip/CreatureSection | 17 |
| 16 | HomeBanner | 6 |
| 17 | Pages (all 5) | 8 |
| 18 | Playwright E2E Tests | 9 |
| 19 | Cleanup + Final Verification | 7 |
| **Total** | | **195 steps** |
