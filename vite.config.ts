import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    cssCodeSplit: true,
    minify: 'esbuild',
    target: 'es2017',
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        // Ana səhifə komponentləri main bundle-da qalır — ayrı chunk lazım deyil
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('lucide-react'))  return 'vendor-icons';
          if (id.includes('react-helmet'))  return 'vendor-helmet';
          if (id.includes('@sanity/image-url')) return 'vendor-sanity-image';
          if (id.includes('@sanity') || id.includes('/sanity/')) return 'vendor-sanity';
          if (id.includes('react-router'))  return 'vendor-router';
          if (id.includes('react-dom'))     return 'vendor-react-dom';
          if (id.includes('/react/') || id.includes('scheduler')) return 'vendor-react';
        },
        assetFileNames: 'assets/[name]-[hash:8][extname]',
        chunkFileNames: 'assets/[name]-[hash:8].js',
        entryFileNames: 'assets/[name]-[hash:8].js',
      },
    },
    chunkSizeWarningLimit: 600,
  },
});