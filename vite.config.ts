import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In production nginx serves the SPA and proxies /api to the forms API in the
// same container, so the browser only ever sees one origin. Mirror that here,
// otherwise the forms 404 against the dev server.
const apiPort = process.env.KERNIVA_API_PORT ?? "8080";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: `http://127.0.0.1:${apiPort}`,
        changeOrigin: false,
      },
    },
  },
  build: {
    target: "es2022",
    sourcemap: false,
  },
});
