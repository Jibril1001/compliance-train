import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const frontendUrl = process.env.FRONTEND_URL ?? 'localhost';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: Number(process.env.VITE_PORT),
    allowedHosts: [frontendUrl],
  },
})
