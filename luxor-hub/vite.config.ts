import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    minify: false,
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      maxParallelFileOps: 3,
    },
  },
  server: {
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || "8080", 10),
    hmr: { overlay: false },
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || "5173", 10),
    allowedHosts: [
      "nice-useful-plot--al-bosify.replit.app",
      ".replit.app",
      ".vercel.app",
      "localhost",
    ],
  },
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
