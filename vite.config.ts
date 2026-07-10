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
  },
});
