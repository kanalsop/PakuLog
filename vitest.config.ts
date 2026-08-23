import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const ROOT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(ROOT_DIRECTORY, "src"),
    },
  },
  test: {
    globals: true,
    projects: [
      {
        test: {
          name: "unit",
          environment: "node",
          globals: true,
          include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
        },
      },
      {
        test: {
          name: "component",
          environment: "jsdom",
          globals: true,
          include: ["src/**/*.test.tsx", "src/**/*.spec.tsx"],
          setupFiles: ["./tests/setup.ts"],
        },
      },
    ],
  },
});
