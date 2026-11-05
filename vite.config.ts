import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/PurrBoard/',   // ← имя репозитория. Если репозиторий называется иначе — поменяй
  plugins: [react(), tailwindcss()],
})