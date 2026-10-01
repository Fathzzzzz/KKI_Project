import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // relatif, supaya hasil build bisa dibuka dari file:// atau subfolder GitHub Pages
  base: '/KKI_Project/',
  test: {
    environment: 'node',
    include: ['src/test/**/*.test.js'],
  },
})
