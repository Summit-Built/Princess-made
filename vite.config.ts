import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";

/**
 * Make the main CSS bundle non-render-blocking so the inline critical CSS
 * in index.html can paint the pre-rendered hero shell immediately.
 * Also removes modulepreload for vendor-motion (only needed for below-fold animations).
 */
function asyncCssPlugin(): Plugin {
  return {
    name: "async-css",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        return html
          // Convert CSS link to non-render-blocking (inline critical CSS handles initial paint)
          .replace(
            /<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/g,
            '<link rel="stylesheet" href="$1" media="print" onload="this.media=\'all\'">\n    <noscript><link rel="stylesheet" href="$1"></noscript>'
          )
          // Remove modulepreload for vendor-motion — not needed for initial render,
          // frees bandwidth for critical resources on slow connections
          .replace(
            /<link rel="modulepreload" crossorigin href="\/assets\/vendor-motion[^"]*\.js">\n?/g,
            ""
          );
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), asyncCssPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            if (
              id.includes("/react/") ||
              id.includes("/react-dom/") ||
              id.includes("/react/jsx-runtime")
            ) {
              return "vendor-react";
            }
            if (id.includes("/framer-motion/")) {
              return "vendor-motion";
            }
            if (id.includes("/@radix-ui/") || id.includes("/lucide-react/")) {
              return "vendor-ui";
            }
            if (
              id.includes("/@tanstack/react-query/") ||
              id.includes("/@trpc/client/") ||
              id.includes("/@trpc/react-query/")
            ) {
              return "vendor-query";
            }
          }
        },
      },
    },
  },
  server: {
    host: true,
    allowedHosts: ["localhost", "127.0.0.1"],
  },
});
