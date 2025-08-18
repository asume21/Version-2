import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    ...(process.env.NODE_ENV !== "production" ? [runtimeErrorOverlay()] : []),
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
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
