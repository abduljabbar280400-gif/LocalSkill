import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    // Target modern browsers for smaller, faster output
    target: 'es2020',

    // Warn on chunks > 500 kB
    chunkSizeWarningLimit: 500,

    rollupOptions: {
      output: {
        // Manual chunk splitting: keeps vendor code separate from app code
        // so returning visitors can use cached vendor chunks
        manualChunks: {
          // React runtime (rarely changes → long cache life)
          'vendor-react': ['react', 'react-dom'],

          // Routing
          'vendor-router': ['react-router-dom'],

          // UI / icon libraries
          'vendor-ui': ['react-icons', 'react-toastify', 'framer-motion'],

          // Chart library (heavy, page-specific)
          'vendor-charts': ['recharts'],

          // Map libraries (heavy, page-specific)
          'vendor-maps': ['leaflet', 'react-leaflet'],

          // HTTP client
          'vendor-axios': ['axios'],
        },
      },
    },
  },
});
