// @ts-check
import react from "@astrojs/react";
import yaml from "@rollup/plugin-yaml";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { visualizer } from "rollup-plugin-visualizer";

import { remarkDescription, remarkReadingTime } from "./src/utils/remarkPlugins";

// Determine the site URL and base path
const isVercel = !!process.env.VERCEL_PROJECT_PRODUCTION_URL;

// Get port from environment variable, default to 4321
const port = process.env.DEV_PORT || "4321";

// Get base path from environment variable, default to "" (root)
const base = process.env.BASE_PATH || "";

const localSite = `http://localhost:${port}`;
const siteUrl = process.env.SITE_URL || localSite;
const isDev = process.env.NODE_ENV === "development";
const isAnalyze = process.env.ANALYZE_BUNDLE === "true";

// refactor this. my head hurts.
const getSiteConfig = () => {
  if (isVercel) {
    return {
      site: `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
    };
  }

  return {
    site: siteUrl,
  };
};

const { site } = getSiteConfig();

console.log(`URL: ${site}${base}`);

// https://astro.build/config
export default defineConfig({
  site,
  base,
  trailingSlash: "never",
  devToolbar: {
    enabled: false,
  },
  vite: {
    plugins: [
      tailwindcss(),
      yaml(),
      ...(isAnalyze
        ? [
            visualizer({
              filename: "./dist/stats.html",
              open: true,
              gzipSize: true,
              brotliSize: true,
              template: "treemap",
            }),
          ]
        : []),
    ],
    ssr: {
      external: [
        "@resvg/resvg-js",
        "@resvg/resvg-js-linux-x64-musl",
        "@resvg/resvg-js-linux-x64-gnu",
        "@resvg/resvg-js-darwin-x64",
        "@resvg/resvg-js-darwin-arm64",
        "@resvg/resvg-js-win32-x64-msvc",
      ],
    },
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  integrations: [react()],
  redirects: {
    discord: "https://discord.com/invite/k8xj8d75f6",
  },
  markdown: {
    remarkPlugins: [remarkReadingTime, remarkDescription],
  },
  experimental: {
    clientPrerender: true,
    contentIntellisense: true,
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "viewport",
  },
  image: {
    // layout: "constrained",
    // objectFit: "contain",
    // objectPosition: "center",
    // breakpoints: [640, 750, 828, 1080, 1280],
    responsiveStyles: true,
  },
  build: {
    format: "file", // fixes trailing slash redirects.
  },
});
