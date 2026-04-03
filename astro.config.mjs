import { defineConfig } from 'astro/config';

export default defineConfig({
  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
