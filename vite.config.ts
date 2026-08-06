import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// This replaces @lovable.dev/vite-tanstack-config, which used to configure all of the below
// automatically. If the build starts failing after a dependency bump, check that plugin's
// changelog for anything new it was adding on top of this.
export default defineConfig({
  resolve: {
    // Matches the "@/*" -> "./src/*" path mapping in tsconfig.json.
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Prevents duplicate React/TanStack instances (e.g. "invalid hook call") if any
    // dependency ends up bundling its own copy.
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"],
  },
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      server: { entry: "server" },
    }),
    viteReact(),
  ],
});
