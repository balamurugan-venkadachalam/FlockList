import { defineConfig } from 'vite'
import type { UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
const config: UserConfig = {
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  // Rule applied: Implement proper CORS handling
  server: {
    proxy: {
      // Proxy API requests to the backend server
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        // Rewrite the path to remove the /api prefix if needed
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
}

export default defineConfig(config)
