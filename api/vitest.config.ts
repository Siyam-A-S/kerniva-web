import { defineConfig } from "vitest/config";

// Present so vitest stops here. Without it, a run from this directory walks up
// to the site's vite.config.ts, which imports packages only the root installs.
export default defineConfig({
  test: { include: ["src/**/*.test.ts"] },
});
