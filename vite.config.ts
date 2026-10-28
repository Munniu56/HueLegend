import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// Bo nho luu tru du lieu dong bo giua Desktop va Mobile
const memorySyncStore = new Map<string, any>();

function syncServerPlugin(): Plugin {
  return {
    name: 'sync-server-plugin',
    configureServer(server) {
      server.middlewares.use('/api/sync', (req, res) => {
        const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
        const code = url.searchParams.get('code') || 'huelegend_global_sync';

        // Doc du lieu dong bo
        if (req.method === 'GET') {
          const data = memorySyncStore.get(code) || null;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, data, timestamp: Date.now() }));
          return;
        }

        // Cap nhat va luu du lieu dong bo
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              memorySyncStore.set(code, parsed);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, timestamp: Date.now() }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), syncServerPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});

