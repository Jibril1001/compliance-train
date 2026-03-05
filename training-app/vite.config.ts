import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const frontendHost = process.env.FRONTEND_URL?.replace(/^https?:\/\//, '') ?? 'localhost';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: Number(process.env.VITE_PORT) || 5173,
    allowedHosts: [frontendHost],
  },
})