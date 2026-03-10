import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/kalender_new/',
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        proxy: {
            '/kalender_new/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                secure: false,
            },
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                secure: false,
            },
            '/kalender_new/uploads': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                secure: false,
            },
            '/uploads': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                secure: false,
            },
        },
    },
})
