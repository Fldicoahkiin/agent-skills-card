import { defineConfig } from "vitest/config";

// Standalone config (no @cloudflare/vite-plugin); tests cover the pure render / query functions.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
