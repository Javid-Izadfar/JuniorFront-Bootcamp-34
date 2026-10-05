import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

function pagesBase(): string {
  const fromEnv = process.env.GITHUB_PAGES_BASE;
  if (!fromEnv || fromEnv === "/") {
    return "/";
  }

  return fromEnv.endsWith("/") ? fromEnv : `${fromEnv}/`;
}

export default defineConfig({
  base: pagesBase(),
  plugins: [react()],
  build: {
    outDir: "dist",
  },
});
