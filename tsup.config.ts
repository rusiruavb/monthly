import { defineConfig } from "tsup";

export default defineConfig([
  {
    name: "server",
    entry: ["server/index.ts", "server/start-server.ts", "server/app.ts"],
    format: ["esm"],
    outDir: "dist-server",
    sourcemap: true,
    clean: true,
    bundle: false,
    splitting: false,
    treeshake: false,
    external: ["better-sqlite3"],
    target: "node22",
  },
  {
    name: "electron",
    entry: ["electron/main.ts", "electron/preload.ts"],
    format: ["esm"],
    outDir: "dist-electron",
    sourcemap: true,
    clean: true,
    bundle: false,
    splitting: false,
    treeshake: false,
    target: "node22",
  },
]);

