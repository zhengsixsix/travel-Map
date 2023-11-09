import { defineConfig } from "vite";
import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";
import Pages from "vite-plugin-pages";
import fs from "fs";
import Markdown from "unplugin-vue-markdown/vite";
import LinkAttributes from "markdown-it-link-attributes";
import anchor from "markdown-it-anchor";
import { slugify } from "./scripts/slugify";
import { bundledLanguages, getHighlighter } from "shikiji";
import matter from "gray-matter";
import Components from "unplugin-vue-components/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 4000,
  },
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/],
      reactivityTransform: true,
      script: {
        defineModel: true,
      },
    }),
    Pages({
      extensions: ["vue", "md"],
      dirs: "pages",
      extendRoute(route) {
        const path = resolve(__dirname, route.component.slice(1));
        if (path.endsWith(".md")) {
          const md = fs.readFileSync(path, "utf-8");
          const { data } = matter(md);
          route.meta = Object.assign(route.meta || {}, { frontmatter: data });
        }
        return route;
      },
    }),
    Markdown({
      wrapperClasses: (id, code) => {
        return code.includes("@layout-map")
          ? "map_container"
          : code.includes("@layout-full-width")
          ? ""
          : "prose m-auto slide-enter-content";
      },
      exportFrontmatter: false,
      exposeFrontmatter: false,
      exposeExcerpt: false,
      async markdownItSetup(md) {
        const shiki = await getHighlighter({
          themes: ["vitesse-dark", "vitesse-light"],
          langs: Object.keys(bundledLanguages) as any,
        });

        md.use((markdown) => {
          markdown.options.highlight = (code, lang) => {
            return shiki.codeToHtml(code, {
              lang,
              themes: {
                light: "vitesse-light",
                dark: "vitesse-dark",
              },
              cssVariablePrefix: "--s-",
            });
          };
        });

        md.use(anchor, {
          slugify,
          permalink: anchor.permalink.linkInsideHeader({
            symbol: "#",
            renderAttrs: () => ({ "aria-hidden": "true" }),
          }),
        });

        md.use(LinkAttributes, {
          matcher: (link: string) => /^https?:\/\//.test(link),
          attrs: {
            target: "_blank",
            rel: "noopener",
          },
        });
      },
    }),
    Components({
      extensions: ["vue", "md"],
      dts: true,
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "icons/*.png"],
      manifest: {
        name: "旅行地图 - Travel Map",
        short_name: "旅行地图",
        description: "记录和展示您的旅行足迹",
        theme_color: "#4CAF50",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}", "**/*.webmanifest"],
        globIgnores: ["**/geojson/**/*.json"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB 上限，超出不预缓存
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            // 运行时缓存本地 geojson 文件
            urlPattern: ({ url }) => url.pathname.includes('/geojson/'),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "geojson-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: [{ find: "~/", replacement: `${resolve(__dirname, "src")}/` }],
  },
  build: {
    target: "esnext",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          "vue-vendor": ["vue", "vue-router"],
          "ol-vendor": ["ol"],
          "markdown-vendor": ["markdown-it", "gray-matter"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ["vue", "vue-router", "ol"],
  },
});
