import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@formitiva/vanilla': resolve(__dirname, '../../packages/vanilla/src/index.ts'),
      '@formitiva/core': resolve(__dirname, '../../packages/core/src'),
    },
  },
});
