// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@design": "c:/Users/User/OneDrive/Documents/fleetflow capstone/fleetflow design/Design"
    }
  },
  server: {
    port: 5173,
    hmr: {
      overlay: false
    },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false
      }
    }
  }
});
