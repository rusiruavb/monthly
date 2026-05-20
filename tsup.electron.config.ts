import { defineConfig } from "tsup";

export default defineConfig({
  name: "electron",
  entry: ["electron/main.ts", "electron/preload.ts"],
  format: ["cjs"],
  outDir: "dist-electron",
  sourcemap: true,
  clean: true,
  bundle: false,
  splitting: false,
  treeshake: false,
  target: "node22",
  outExtension: () => ({ js: ".cjs" }),
});

