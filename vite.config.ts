import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    // This ensures all built assets use relative paths, fixing the 404 errors
    base: './', 
    
    plugins: [react(), tailwindcss()],
    
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
