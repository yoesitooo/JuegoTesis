import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: {
        // Cachea todo (código, estilos, fuentes, imágenes) para jugar sin internet
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
      manifest: {
        name: 'Carrera Matemática',
        short_name: 'Carrera',
        description: 'Crea tu personaje, elige tu vehículo y resuelve operaciones matemáticas.',
        lang: 'es',
        theme_color: '#CFE8FF',
        background_color: '#EEF6FF',
        display: 'fullscreen',
        orientation: 'any',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
  },
});
