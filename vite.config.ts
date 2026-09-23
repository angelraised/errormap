import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Actions sets VITE_BASE to /repository-name/ for GitHub Pages.
  // Local development and other hosts keep using the domain root.
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
})
