import { peerDependencies, name } from "./package.json";

import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: {
        api: "src/api/index.ts",
        hooks: "src/hooks/index.ts",
      },
      name,
      formats: ["es"],
      fileName: (format, entryName) => `${entryName}/${entryName}.${format}.js`,
    },
    sourcemap: true,
    rollupOptions: {
      external: Object.keys(peerDependencies),
    },
  },
});
