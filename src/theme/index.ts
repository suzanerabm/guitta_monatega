// src/theme/index.ts
import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import { tokens, semanticTokens } from './tokens';
import { keyframes } from './keyframes';
import { textStyles } from './textStyles';

const config = defineConfig({
  theme: {
    tokens,
    semanticTokens,
    keyframes,
    textStyles,
    breakpoints: {
      sm: '30em', // 480px
      md: '48em', // 768px (Astro mobile cutoff)
      lg: '62em', // 992px
      xl: '80em', // 1280px
      '2xl': '94em', // 1500px (Astro mid cutoff)
      '3xl': '120em', // 1920px (Astro xl cutoff)
    },
  },
});

export const system = createSystem(defaultConfig, config);
