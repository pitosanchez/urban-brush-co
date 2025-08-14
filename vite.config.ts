import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  base: "/urban-brush-co/", // GitHub Pages base path
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          vendor: ['react', 'react-dom'],
          animations: ['gsap', 'framer-motion'],
          ui: ['lucide-react', 'react-day-picker'],
          radix: ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-switch', '@radix-ui/react-tabs']
        }
      }
    },
    // Increase chunk size warning limit to 750kb since we have rich UI
    chunkSizeWarningLimit: 750,
  },
});
