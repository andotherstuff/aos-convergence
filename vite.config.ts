import path from "node:path";

import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      // New SW activates on next navigation, no prompt.
      registerType: "autoUpdate",
      // Don't run the SW in dev — Workbox dev SW can interfere with HMR
      // and the local worker-proxy story. Production builds get it.
      devOptions: { enabled: false },
      // Use the hand-written public/manifest.webmanifest (linked from
      // index.html). The plugin only manages the service worker; the
      // custom eslint rule `require-webmanifest` enforces the static file
      // exists.
      manifest: false,
      // Don't inject any link tags — index.html already has them.
      injectRegister: false,
      workbox: {
        // Precache the hashed build output. Vite hashes filenames per build,
        // so updates invalidate cleanly. Bumped from the 2MiB default so the
        // full app shell fits.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,ico,woff,woff2}"],
        navigateFallback: "/index.html",
        // CRITICAL: never cache API calls. Gated content is per-user and
        // NIP-98 tokens are time-bound — a stale cached 200 could leak
        // content to a logged-out user or to someone whose approval was
        // revoked.
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
            handler: "NetworkOnly",
            method: "GET",
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
            handler: "NetworkOnly",
            method: "POST",
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
            handler: "NetworkOnly",
            method: "PUT",
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
            handler: "NetworkOnly",
            method: "DELETE",
          },
        ],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    onConsoleLog(log) {
      return !log.includes("React Router Future Flag Warning");
    },
    env: {
      DEBUG_PRINT_LIMIT: '0', // Suppress DOM output that exceeds AI context windows
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));