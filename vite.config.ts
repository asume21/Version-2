import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(dirname(fileURLToPath(import.meta.url)), "client", "src"),
      "@shared": resolve(dirname(fileURLToPath(import.meta.url)), "shared"),
      "@assets": resolve(
        dirname(fileURLToPath(import.meta.url)),
        "attached_assets",
      ),
    },
  },
  root: resolve(dirname(fileURLToPath(import.meta.url)), "client"),
  build: {
    outDir: resolve(dirname(fileURLToPath(import.meta.url)), "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
