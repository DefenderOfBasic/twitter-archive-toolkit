// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  optimizeDeps: {
    exclude: ["@electric-sql/pglite"],
  },
  // publicDir: './frontend/public',
  root:  resolve(__dirname, './frontend'),
  build: {
    outDir: resolve(__dirname, './dist'),
    rollupOptions: {
      input: {
        main: resolve(__dirname, './frontend/index.html'),
        'archive-explorer': resolve(__dirname, './frontend/archive-explorer.html'),
        'semantic-search': resolve(__dirname, './frontend/semantic-search.html'),
        'simple': resolve(__dirname, './frontend/simple.html')
      },
    },
  },
})