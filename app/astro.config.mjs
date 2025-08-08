// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['three', '@react-three/fiber', '@react-three/drei']
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
            'vendor-gsap': ['gsap'],
            'vendor-zustand': ['zustand']
          }
        }
      }
    },
    ssr: {
      noExternal: ['three', '@react-three/fiber', '@react-three/drei']
    }
  },

  integrations: [react()],
  
  build: {
    inlineStylesheets: 'auto'
  }
});