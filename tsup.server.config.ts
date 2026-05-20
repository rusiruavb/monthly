import { defineConfig } from "tsup";

export default defineConfig({
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
});

