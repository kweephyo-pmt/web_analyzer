import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        host: true, // Listen on all addresses
        allowedHosts: ['.ngrok-free.dev', '.ngrok.io'], // Allow ngrok domains
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
            '/auth': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
        },
    },
})
