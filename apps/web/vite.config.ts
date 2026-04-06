import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // ESM bundle: avoid Rollup failing on CJS `exports.PLANS = void 0` from dist
      "@yourdrive/plans": path.resolve(
        __dirname,
        "../../packages/plans/src/index.ts",
      ),
    },
  },
  server: {
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || "5173", 10),
    // Allow Cloudflare quick tunnel URLs (Host header is the tunnel subdomain)
    allowedHosts: [".trycloudflare.com"],
    proxy: {
      "/api": {
        // Default: localhost so setup works on any machine. Override with API_PROXY_TARGET (e.g. http://192.168.1.2:3000).
        target: process.env.API_PROXY_TARGET ?? "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});
