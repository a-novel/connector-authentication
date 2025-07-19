import { peerDependencies, name } from "./package.json";

import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        api: "src/api/index.ts",
        hooks: "src/hooks/index.ts",
      },
      name,
      formats: ["es"],
      fileName: (format, entryName) =>
        entryName === "index" ? `index.${format}.js` : `${entryName}/index.${format}.js`,
    },
    sourcemap: true,
    rollupOptions: {
      external: Object.keys(peerDependencies),
    },
  },
});
