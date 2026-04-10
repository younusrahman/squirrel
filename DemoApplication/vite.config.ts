import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"; // Du kan behöva installera @types/node om det saknas

export default defineConfig({
  plugins: [react()],
  base: "/squirrel/",
  resolve: {
    alias: {
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
  },
});
