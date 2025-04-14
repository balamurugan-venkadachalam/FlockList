/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/vitest.setup.ts'],
    include: [
      '**/*.test.{ts,tsx}',
      '**/__tests__/**/*.{ts,tsx}'
    ]
  },
});
