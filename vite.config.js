import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  server: { port: 5173, host: true, open: false },
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  build: { outDir: 'dist/vite' },
});
