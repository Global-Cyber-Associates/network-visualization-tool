// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Ensure only one copy of react is used
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "@": path.resolve(__dirname, "src"), // Optional: use @ as src alias
    },
  },
  server: {
    port: 5173,
    host: "0.0.0.0",
    open: true, // automatically open browser
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`, // if using scss variables
      },
    },
  },
});
