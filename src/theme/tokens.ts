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
    // Semantic heading/text aliases (commonly used literals)
    headingDark: { value: '#333333' },
    headingLight: { value: '#ffffff' },
    subtleText: { value: '#999999' },
    // Overlays
    overlayLight: { value: 'rgba(255,255,255,0.92)' },
    overlayLightSoft: { value: 'rgba(255,255,255,0.9)' },
    overlayLightStrong: { value: 'rgba(255,255,255,0.97)' },
    overlayDark: { value: 'rgba(0,0,0,0.95)' },
    overlayDarkSoft: { value: 'rgba(0,0,0,0.8)' },
    // Dark theme base
    darkBg: { value: '#0a0a1a' },
    darkInk: { value: '#e0e0e8' },
    darkInkSoft: { value: 'rgba(255,255,255,0.55)' },
    darkInkMuted: { value: 'rgba(255,255,255,0.3)' },
    darkBorder: { value: 'rgba(255,255,255,0.08)' },
    darkSubtle: { value: 'rgba(255,255,255,0.12)' },
    // Text overlays (white-over-dark fades)
    textOverlay: { value: 'rgba(255,255,255,0.7)' },
    textOverlayDim: { value: 'rgba(255,255,255,0.5)' },
    textOverlayBright: { value: 'rgba(255,255,255,0.9)' },
    textOverlayStrong: { value: 'rgba(255,255,255,0.85)' },
    textOverlayFaint: { value: 'rgba(255,255,255,0.3)' },
    textOverlayGhost: { value: 'rgba(255,255,255,0.2)' },
    // Bg overlays
    bgOverlay: { value: 'rgba(0,0,0,0.3)' },
    bgOverlayMid: { value: 'rgba(0,0,0,0.4)' },
    bgOverlayHeavy: { value: 'rgba(0,0,0,0.6)' },
    // Outlines used by CharacterCard / DSTextPanel (Astro tokens.css)
    outlineSoft: { value: 'rgba(255,255,255,0.12)' },
    outlineMid: { value: 'rgba(255,255,255,0.2)' },
    outlineStrong: { value: 'rgba(255,255,255,0.35)' },
    // Banner
    bannerLabel: { value: 'rgba(255,255,255,0.6)' },
    bannerDesc: { value: 'rgba(255,255,255,0.7)' },
    arteLabel: { value: 'rgba(0,0,0,0.35)' },
    arteDesc: { value: 'rgba(0,0,0,0.45)' },
    // Hero defaults
    heroDefaultText: { value: '#ffffff' },
    heroDefaultLabel: { value: 'rgba(255,255,255,0.5)' },
    // Modal overlay backgrounds
    modalBgDark: { value: 'rgba(0,0,0,0.95)' },
    modalBgLight: { value: 'rgba(255,255,255,0.97)' },
    modalNavBgDark: { value: 'rgba(0,0,0,0.8)' },
    modalNavBgLight: { value: 'rgba(255,255,255,0.9)' },
    modalImgBgDark: { value: 'rgba(255,255,255,0.05)' },
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
    // Hero title for the landing page — more contained than the uppercase
    // bold h1 used on inner pages (bichittos/kammara/art).
    heroHome: { value: 'clamp(2.25rem, 5.5vw, 4rem)' },
    // Label proporcional ao heroHome (ratio ~5:1). Escala junto com o
    // título em qualquer viewport pra manter a proporção fixa.
    heroHomeLabel: { value: 'clamp(0.45rem, 1.1vw, 0.8rem)' },
    // Banner label e descrição proporcionais ao h2 (título dos banners).
    // Escalam juntos mantendo a hierarquia visual fixa em qualquer viewport.
    bannerLabel: { value: 'clamp(0.53rem, 1.06vw, 0.8rem)' }, // ~3x menor que h2
    bannerDesc: { value: 'clamp(0.66rem, 1.33vw, 1rem)' }, // ~4x menor que h2
    // Hero page label proporcional ao h1 (ratio ~6:1). Escala junto com
    // o título em qualquer viewport.
    heroLabel: { value: 'clamp(0.5rem, 1.33vw, 1rem)' }, // ~6x menor que h1
    h2: { value: 'clamp(2.66rem, 5.31vw, 3.98rem)' }, // 42px → 64px
    h3: { value: '1.3rem' },
    h4: { value: '0.75rem' },
    label: { value: '0.825rem' },
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
    hero: { value: '0.3em' },
    heroTitle: { value: '0.06em' },
  },
  spacing: {
    // Original scale (kept backward-compatible)
    xs: { value: '0.25rem' },
    sm: { value: '0.5rem' },
    md: { value: '0.8rem' },
    lg: { value: '1.5rem' },
    xl: { value: '3rem' },
    '2xl': { value: '5rem' },
    // Extended scale for fine-grained layout values used across the app
    '3xs': { value: '0.0625rem' }, // 1px
    '2xs': { value: '0.125rem' }, // 2px
    tight: { value: '0.3rem' }, // 4.8px — small inline gaps
    cozy: { value: '0.6rem' }, // ~10px
    snug: { value: '0.7rem' }, // ~11px
    base: { value: '1rem' }, // 16px (token name "base" to avoid clashing with md=0.8rem)
    '3xl': { value: '2rem' }, // 32px
    '4xl': { value: '4rem' }, // 64px
    '5xl': { value: '8rem' }, // 128px (hero pt)
  },
  shadows: {
    sm: { value: '0 4px 20px rgba(0,0,0,0.08)' },
    md: { value: '0 4px 24px rgba(0,0,0,0.06)' },
    lg: { value: '0 8px 30px rgba(0,0,0,0.12)' },
    text: { value: '0 2px 30px rgba(0,0,0,0.3)' },
    card: { value: '0 4px 16px rgba(0,0,0,0.12)' },
    cardHover: { value: '0 12px 40px rgba(0,0,0,0.15), 0 0 20px rgba(255,255,255,0.15)' },
    cardHoverBig: { value: '0 20px 60px rgba(0,0,0,0.4)' },
    sceneHover: { value: '0 8px 30px rgba(0,0,0,0.3)' },
    dsPanel: { value: '0 8px 32px rgba(0,0,0,0.1)' },
    labelText: { value: '0 1px 8px rgba(0,0,0,0.3)' },
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
