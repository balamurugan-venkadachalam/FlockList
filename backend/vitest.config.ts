import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    setupFiles: ['./src/test/setup.ts'],
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