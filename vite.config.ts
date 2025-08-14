import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  base: "/urban-brush-co/", // GitHub Pages base path
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
  },
});
