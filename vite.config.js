import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Sert l'app sous /pistache/ sur GitHub Pages, / en local.
  base: process.env.GITHUB_ACTIONS ? "/pistache/" : "/",
  plugins: [react()],
});
