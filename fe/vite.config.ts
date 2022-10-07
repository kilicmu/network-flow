import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: process.env.BUILD_PATH || "dist",
  },
  plugins: [react()],
});
