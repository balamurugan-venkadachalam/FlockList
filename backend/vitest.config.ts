import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: [
      '**/*.unit.test.ts',
      '**/*.integration.test.ts',
    ],
    hookTimeout: 30000,
    testTimeout: 30000,
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    env: {
      MONGODB_URI_TEST: 'mongodb://localhost:27017/taskmaster_test'
    }
  }
}); 