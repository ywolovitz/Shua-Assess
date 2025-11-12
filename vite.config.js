import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const base =
  process.env.NODE_ENV === "production" ? "/Shua-Assess/" : "/";

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    host: "localhost",
    port: 5173,
  },
});

