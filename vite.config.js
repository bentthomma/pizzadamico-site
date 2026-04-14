import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  server: { port: 5173, host: '127.0.0.1', open: true },
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  build: { outDir: 'dist/vite' },
});
