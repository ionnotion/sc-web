import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const file = (p) => fileURLToPath(new URL(p, import.meta.url));

// Dev only: serve admin/index.html for client-side routes under /admin/* (e.g. /admin/news).
// In production nginx does the same with try_files.
const adminFallback = () => ({
  name: 'admin-spa-fallback',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const path = (req.url || '').split('?')[0];
      if (/^\/admin(\/|$)/.test(path) && !path.includes('.')) req.url = '/admin/index.html';
      next();
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), adminFallback()],
    server: {
      port: 5173,
      // Same-origin API in dev => no CORS setup on the backend.
      proxy: { '/api': env.DEV_API_URL || 'http://localhost:8080' },
    },
    build: {
      rollupOptions: {
        input: { main: file('./index.html'), admin: file('./admin/index.html') },
      },
    },
  };
});
