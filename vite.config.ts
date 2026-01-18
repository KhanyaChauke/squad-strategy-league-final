import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa';


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    proxy: {
      '/.netlify/functions': {
        target: 'http://localhost:8888',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'touchline-logo.jpg', 'ios/100.png', 'ios/1024.png'], // Including logo
      manifest: {
        name: 'Touchline SA',
        short_name: 'Touchline SA',
        description: 'Build your dream squad and compete with friends in the ultimate South African fantasy soccer experience',
        theme_color: '#2D7D32',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'touchline-logo.jpg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'touchline-logo.jpg',
            sizes: '512x512',
            type: 'image/jpeg'
          },
          {
            src: 'touchline-logo.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,tsx}']
      }
    }),
    // mode === 'development' &&
    // componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
