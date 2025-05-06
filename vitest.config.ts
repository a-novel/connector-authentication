import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    minify: false,
  },
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      enabled: true,
      clean: true,
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx}"],
    },
  },
});
