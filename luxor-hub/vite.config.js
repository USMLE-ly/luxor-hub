import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => ({
  esbuild: false,
  build: {
    minify: false,
    sourcemap: false,
  },
  plugins: [
    react({
      babel: {
        plugins: [],
        presets: ["@babel/preset-typescript"],
      },
    }),
  ],
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
}));
