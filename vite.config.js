import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Корень проекта — папка demo, там лежит index.html
  root: './demo',
})
