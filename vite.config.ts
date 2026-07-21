import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@mdx-js/rollup";
import path from "path";

const mdxPlugin = mdx({
  include: /\.mdx$/,
});

const mdxTransform = mdxPlugin.transform;

export default defineConfig({
  plugins: [
    {
      ...mdxPlugin,
      enforce: "pre",

      transform(code, id) {
        if (/^export default "(?:[^"\\]|\\.)*";?\s*$/.test(code)) {
          return null;
        }

        return mdxTransform.call(this, code, id);
      },
    },

    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
