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
    esbuildOptions: {
      define: {
        // Critical fix: rewrite 'global' inside prebundled dependencies
        global: 'globalThis',
      },
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Chunk splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          wallet: ['@solana/wallet-adapter-react', '@solana/wallet-adapter-react-ui', '@solana/web3.js'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
          routing: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          charts: ['recharts'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
    // Enable gzip compression hints
    reportCompressedSize: true,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
}));
