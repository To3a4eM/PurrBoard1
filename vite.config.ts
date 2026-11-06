import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/PurrBoard/', // если нужно
  plugins: [react(), tailwindcss()],
  server: {
    host: true,                    // слушать на всех интерфейсах
    allowedHosts: true,            // разрешить любой хост (включая trycloudflare.com)
  },
})