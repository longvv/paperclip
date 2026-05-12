import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./scripts/vitest-global-setup.ts"],
    projects: ["packages/db", "packages/adapters/opencode-local", "server", "ui", "cli"],
  },
});
