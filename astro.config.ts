// @ts-check
import react from "@astrojs/react";
import yaml from "@rollup/plugin-yaml";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import { defineConfig } from "astro/config";

import redirects from "./redirects.json";

// Determine the site URL and base path
const isVercel = !!process.env.VERCEL_PROJECT_PRODUCTION_URL;

// Get port from environment variable, default to 4321
const port = process.env.DEV_PORT || "4321";

// Get base path from environment variable, default to "" (root)
const base = process.env.BASE_PATH || "";

const localSite = `http://localhost:${port}`;
const siteUrl = process.env.SITE_URL || localSite;
const isDev = process.env.NODE_ENV === "development";

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
    plugins: [tailwindcss(), yaml()],
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
  integrations: [react(), icon()],
  redirects,
  experimental: {
    clientPrerender: true,
    contentIntellisense: true,
  },
  prefetch: {
    prefetchAll: !isDev, // enabled in prod
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
