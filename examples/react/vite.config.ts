import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@formitiva/react': resolve(__dirname, '../../packages/react/src/index.ts'),
      '@formitiva/core': resolve(__dirname, '../../packages/core/src'),
    },
  },
});
