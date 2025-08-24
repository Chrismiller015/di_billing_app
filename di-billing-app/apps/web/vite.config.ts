// [SOURCE: apps/web/vite.config.ts]
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This is the new section that fixes the 404 errors.
    proxy: {
      // Proxy all requests starting with /api to the backend server
      '/api': {
        target: 'http://localhost:4000', // The address of your NestJS API
        changeOrigin: true, // Recommended for virtual hosted sites
      },
    },
  },
});