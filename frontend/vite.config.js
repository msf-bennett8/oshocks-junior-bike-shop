import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // SWC-based React plugin — 20x faster than Babel
    react({
      // Enable React Refresh for HMR
      refresh: true,
      // JSX runtime: automatic (no need to import React)
      jsxRuntime: 'automatic',
    }),
    
    // SVG support: import { ReactComponent } from './logo.svg'
    svgr({
      svgrOptions: {
        icon: true,
        // This will keep viewBox and replace width/height
        dimensions: false,
      },
    }),
    
    // PWA support — replaces workbox-webpack-plugin
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ttf,eot,json,webmanifest,txt,xml}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'oshocks-images',
              expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'oshocks-fonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'oshocks-api',
              expiration: { maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'oshocks-static',
              expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
        ],
        skipWaiting: true,
        clientsClaim: true,
      },
      manifest: false, // We use our own manifest.json in public/
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  
  // Resolve aliases — matches your project structure
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@context': path.resolve(__dirname, './src/context'),
      '@redux': path.resolve(__dirname, './src/redux'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@data': path.resolve(__dirname, './src/data'),
    },
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Chunk splitting for optimal caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk — third-party libraries (rarely change)
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-state': ['react-redux', '@reduxjs/toolkit', 'redux'],
          'vendor-ui': ['framer-motion', 'lucide-react', 'react-icons', 'react-hot-toast'],
          'vendor-charts': ['recharts'],
          'vendor-utils': ['axios', 'date-fns', 'uuid', 'zod'],
          'vendor-virtual': ['react-window', 'react-virtualized-auto-sizer'],
          'vendor-markdown': ['react-markdown'],
          'vendor-helmet': ['react-helmet-async'],
        },
      },
    },
    // Minification with esbuild (faster than terser)
    minify: 'esbuild',
    target: 'es2020',
  },
  
  // Development server
  server: {
    port: 3000,
    strictPort: false, // Try next port if 3000 is taken
    open: true,
    cors: true,
    // Proxy API requests to Laravel backend during development
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/sanctum': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  
  // Preview server (for testing production build)
  preview: {
    port: 4173,
    strictPort: false,
  },
  
  // CSS configuration
  css: {
    devSourcemap: true,
    postcss: './postcss.config.js',
  },
  
  // Environment variable prefix (Vite uses VITE_ instead of REACT_APP_)
  envPrefix: 'VITE_',
  
  // Optimize dependencies on startup
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'framer-motion',
      'lucide-react',
      'react-redux',
      '@reduxjs/toolkit',
    ],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  
  // ESBuild target
  esbuild: {
    target: 'es2020',
    legalComments: 'none',
  },
});
