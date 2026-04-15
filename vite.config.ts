import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  server: {
    proxy: {
      "/api/horizons": {
        target: "https://ssd.jpl.nasa.gov",
        changeOrigin: true,
        rewrite: (path) => path.replace("/api/horizons", "/api/horizons.api"),
      },
    },
  },
});
