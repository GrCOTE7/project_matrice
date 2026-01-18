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
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            if (err.code === "ECONNABORTED" || err.code === "ECONNRESET") {
              return;
            }
            console.log("proxy error", err);
          });
          proxy.on("proxyReqWs", (_proxyReq, _req, socket) => {
            // Force silencieuse : on remplace socket.emit pour intercepter 'error'
            // avant que Vite ne le loggue.
            const originalEmit = socket.emit;
            socket.emit = function (event, ...args) {
              if (event === "error") {
                const err = args[0];
                if (
                  err &&
                  (err.code === "ECONNABORTED" || err.code === "ECONNRESET")
                ) {
                  return true;
                }
              }
              return originalEmit.apply(this, args);
            };
          });
        },
      },
    },
  },
});
