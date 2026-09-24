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
      // `server-only` é resolvido pelo bundler do Next, não pelo Vite. Fora do
      // Next ele precisa apontar pro stub vazio, senão qualquer módulo de dados
      // quebra aqui.
      'server-only': path.resolve(
        __dirname,
        './node_modules/next/dist/compiled/server-only/empty.js',
      ),
    },
  },
});
