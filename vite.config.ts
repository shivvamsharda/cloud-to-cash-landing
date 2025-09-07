import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Polyfill global for browser compatibility
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      '@metaplex-foundation/umi',
      '@metaplex-foundation/umi-bundle-defaults',
      '@metaplex-foundation/mpl-candy-machine',
      '@metaplex-foundation/mpl-candy-guard',
      '@metaplex-foundation/umi-signer-wallet-adapters',
    ],
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      external: [],
    },
  },
}));
