import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Vendor groups must not import each other in a cycle, otherwise a chunk can run before
// React is initialised. three and gsap have no dependencies; everything else from
// node_modules shares one vendor chunk that only depends on them.
const chunkFor = (id) => {
  if (!id.includes("node_modules")) return undefined;
  if (/node_modules\/three\//.test(id)) return "three-core";
  if (/node_modules\/gsap\//.test(id)) return "gsap";
  return "vendor";
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // three.js core is a single ~700 kB module that cannot be split further.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: chunkFor,
      },
      onwarn(warning, warn) {
        // three-stdlib ships an unused lottie loader that contains eval(); it is tree-shaken away.
        if (warning.code === "EVAL" && warning.id?.includes("three-stdlib")) return;
        warn(warning);
      },
    },
  },
});
