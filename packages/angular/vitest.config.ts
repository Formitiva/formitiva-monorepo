import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@formitiva/core': path.resolve(__dirname, '../core/src/index.ts'),
    },
  },
  test: {
    name: 'angular',
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
