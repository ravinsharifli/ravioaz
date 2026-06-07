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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('lucide-react'))  return 'vendor-icons';
          if (id.includes('react-helmet'))  return 'vendor-helmet';
          if (id.includes('@sanity') || id.includes('/sanity/')) return 'vendor-sanity';
          if (
            id.includes('react-dom') ||
            id.includes('react-router') ||
            id.includes('/react/') ||
            id.includes('scheduler')
          ) return 'vendor-react';
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});