import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        // Obliga a cachear todos los archivos estáticos (código, estilos, imágenes) para uso sin internet
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'] 
      },
      manifest: {
        name: 'EduRunner Math',
        short_name: 'EduRunner',
        description: 'Juego gamificado de matemáticas offline',
        theme_color: '#F9F7F1',
        display: 'fullscreen', // Hace que en tablets se vea como App nativa (sin barra de navegador)
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ]
});
