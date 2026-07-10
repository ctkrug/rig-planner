import { defineConfig } from "vite";

// Relative base so the build is deployable under any subpath
// (e.g. apps.charliekrug.com/rig-planner) with no server-side rewrite.
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/ui/**"],
      thresholds: {
        lines: 85,
        branches: 80,
        functions: 85,
        statements: 85,
      },
    },
  },
});
