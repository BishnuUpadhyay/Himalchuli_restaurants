import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

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
    // Without this, Vite just produces a generic SSR bundle (dist/server/*) that Vercel
    // doesn't know how to invoke, which is what was causing the 404: NOT_FOUND on every
    // request. This tells Nitro to build a Vercel-compatible serverless function output.
    nitro({ preset: "vercel" }),
  ],
});