import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@formitiva/core': path.resolve(__dirname, '../core/src/index.ts'),
    },
  },
  test: {
    name: 'vue',
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
