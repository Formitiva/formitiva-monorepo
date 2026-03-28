import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@formitiva/vue': resolve(__dirname, '../../packages/vue/src/index.ts'),
      '@formitiva/core': resolve(__dirname, '../../packages/core/src'),
    },
  },
});
