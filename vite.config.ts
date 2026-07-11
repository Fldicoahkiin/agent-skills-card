import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

declare const process: { env: Record<string, string | undefined> };

// Cloudflare plugin: dev runs real workerd; build outputs Worker + Static Assets.
// Dropped on Vercel (VERCEL=1) — vite build falls back to a plain SPA (dist/),
// with /api/* served by the api/[[...route]].ts Edge Function instead. Both wrap the same Hono app.
const onVercel = typeof process !== "undefined" && !!process.env.VERCEL;

// When an external tool (e.g. a preview sandbox) pins a port via PORT, bind to it strictly — otherwise vite
// silently drifts to the next free port and the proxy points at nothing. Without PORT, keep vite defaults (5173, may drift).
const port = process.env.PORT ? Number(process.env.PORT) : undefined;

export default defineConfig({
  plugins: [react(), tailwindcss(), ...(onVercel ? [] : [cloudflare()])],
  server: port ? { port, strictPort: true } : undefined,
});
