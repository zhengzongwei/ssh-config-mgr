import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execSync } from "child_process";
import { readFileSync } from "fs";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// 读取版本号，优先使用环境变量（CI 构建时由 workflow 注入），否则读 package.json
const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));
const appVersion: string = process.env.APP_VERSION || pkg.version;

// 获取当前 git commit hash（短）
let gitCommit = "dev";
try {
  gitCommit = execSync("git rev-parse --short HEAD").toString().trim();
} catch (_) {}

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __GIT_COMMIT__: JSON.stringify(gitCommit),
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
