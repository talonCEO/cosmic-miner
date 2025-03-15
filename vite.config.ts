import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import svgr from "vite-plugin-svgr"; // Added for SVG support

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::", // Allows IPv6 binding (e.g., for local network access)
    port: 8080,
  },
  plugins: [
    react(), // React plugin with SWC
    svgr(), // SVG as React components
    mode === "development" && componentTagger(), // Custom plugin in dev mode
  ].filter(Boolean), // Filters out falsy values (e.g., undefined from conditional)
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Alias for src directory
    },
  },
  // Optional: Optimize SVG handling
  assetsInclude: ["**/*.svg"], // Ensure SVGs are treated as assets when not imported as components
}));
