import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite configuration
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API requests to Express backend running on port 5001
      "/customers": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
