import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [
    react(),
    webExtension({
      manifest: () => readJsonFile("manifest.json"),
      browser: "chrome",
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
