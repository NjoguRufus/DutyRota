import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = (env.VITE_SITE_URL || "https://capemedia.vercel.app").replace(/\/$/, "");

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [
      react(),
      {
        name: "html-site-url",
        transformIndexHtml(html) {
          /* Avoid % in HTML attrs — Vite's HTML parser treats % as URI encoding. */
          return html.replaceAll("__SITE_URL__", siteUrl);
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
