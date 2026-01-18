import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Dans Docker, on utilisera le nom du service "backend".
// En local, on garde "localhost".
const BACKEND_URL = process.env.VITE_BACKEND_URL || "http://localhost:8000";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    watch: {
      usePolling: true, // Crucial pour Windows + Docker
    },
    proxy: {
      "/api": {
        target: BACKEND_URL,
        changeOrigin: true,
      },
      "/ws": {
        target: BACKEND_URL,
        ws: true,
      },
    },
  },
});

