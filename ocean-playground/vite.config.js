import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    host: true,
    port: 5173
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild', // Using esbuild instead of terser for compatibility
    rollupOptions: {
      output: {
        manualChunks: {
          // Three.js and related libraries
          three: ['three'],
          'three-fiber': ['@react-three/fiber'],
          'three-drei': ['@react-three/drei'],
          'three-post': ['@react-three/postprocessing', 'postprocessing'],
          // Animation libraries
          gsap: ['gsap'],
          // State management
          zustand: ['zustand'],
          // React core
          react: ['react', 'react-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  // Optimizations
  esbuild: {
    drop: ['console', 'debugger'],
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
})