import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-oxc";
import { createHtmlPlugin } from "vite-plugin-html";
import { resolve } from "path";
import { name, title } from "./package.json";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    define: {
      "import.meta.env.VITE_ENABLE_UPDATE":
        process.argv.includes("--enable-update"),
      global: "globalThis",
    },
    base: env.VITE_PUBLIC_BASE,
    build: {
      outDir: name,
      rollupOptions: {
        output: {
          entryFileNames: "assets/js/[name]-[hash].js",
          chunkFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: (assetInfo) => {
            const fileName = assetInfo.names?.[0] || "";
            const extType = fileName.split(".").pop()?.toLowerCase() || "";
            if (["png", "jpg", "jpeg", "svg", "gif", "webp"].includes(extType))
              return "assets/img/[name]-[hash][extname]";
            if (["woff", "woff2", "ttf", "eot"].includes(extType))
              return "assets/fonts/[name]-[hash][extname]";
            if (extType === "css") return "assets/css/[name]-[hash][extname]";
            return "assets/static/[name]-[hash][extname]";
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    plugins: [
      react(),
      createHtmlPlugin({
        minify: true,
        template: "public/index.html",
        entry: "/src/main.tsx",
        inject: {
          data: {
            title,
          },
          tags: [
            // 注入根元素
            {
              tag: "div",
              attrs: { id: "root" },
              injectTo: "body-prepend",
            },
            // 注入 Content-Security-Policy 元标签
            {
              tag: "meta",
              attrs: {
                "http-equiv": "Content-Security-Policy",
                content: (() => {
                  // 解析允许的外部主机列表
                  const allowedHosts = env.VITE_ALLOWED_HOSTS
                    ? JSON.parse(env.VITE_ALLOWED_HOSTS)
                    : [];
                  // 构建 CSP 规则
                  const srcMap = {
                    "default-src": ["'self'", "blob:", ...allowedHosts],
                    "script-src": ["'self'", ...allowedHosts],
                    // 允许内联样式
                    "style-src": ["'self'", "'unsafe-inline'", ...allowedHosts],
                    // 允许 data 协议加载图片
                    "img-src": ["'self'", "data:", "blob:", ...allowedHosts],
                    "media-src": [...allowedHosts],
                  };
                  // 转换为 CSP 字符串格式
                  return Object.entries(srcMap)
                    .map(([key, hosts]) => `${key} ${hosts.join(" ")}`)
                    .join("; ");
                })(),
              },
              injectTo: "head",
            },
          ],
        },
      }),
    ],
    css: {
      modules: {
        localsConvention: "camelCaseOnly",
        generateScopedName: "[local]-[hash:base64:10]",
      },
    },
    server: {
      port: 8888,
      open: true,
      host: "0.0.0.0",
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
  };
});
