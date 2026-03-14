import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "pwa-192x192.svg", "pwa-512x512.svg"],
      manifest: {
        name: "Vektor - Clareza Financeira",
        short_name: "Vektor",
        description: "Sistema financeiro inteligente para autônomos e MEI",
        theme_color: "#1E3A8A",
        background_color: "#f0f2f8",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/",
        scope: "/",
        shortcuts: [
          {
            name: "Vektor Gestão",
            short_name: "Gestão",
            description: "Acesse o painel financeiro completo",
            url: "/dashboard",
            icons: [{ src: "/pwa-192x192.svg", sizes: "192x192" }]
          },
          {
            name: "Vektor Agente",
            short_name: "Agente",
            description: "Assistente de IA independente",
            url: "/chat",
            icons: [{ src: "/agent-icon.svg", sizes: "192x192" }]
          }
        ],
        icons: [
          { src: "/pwa-192x192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any maskable" },
          { src: "/pwa-512x512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any maskable" },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
