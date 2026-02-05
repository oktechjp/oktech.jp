// @ts-check
import react from "@astrojs/react";
import yaml from "@rollup/plugin-yaml";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import remarkBreaks from "remark-breaks";
import { visualizer } from "rollup-plugin-visualizer";
import svgr from "vite-plugin-svgr";

import { rehypeTableWrapper, rehypeTaskListCheckbox } from "./src/utils/rehypePlugins";
import relativeStaticAssets from "./src/utils/relativeStaticAssets";
import {
  remarkDescription,
  remarkReadingTime,
  remarkRelativeAssets,
} from "./src/utils/remarkPlugins";

// Get base path from environment variable, default to "" (root)
// BASE_PATH is used to prefix the site URL with a base path, for example /chris-wireframe/
const base = process.env.BASE_PATH || "";

// Output bundle analysis to stats.html
const analyzeBundle = process.env.ANALYZE_BUNDLE === "true";

// if we're in a Vercel preview deployment, use that URL, otherwise use SITE_URL, otherwise use localhost.
const siteUrl = process.env.SITE_URL || `http://localhost:${process.env.DEV_PORT || "4321"}`;
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const site = !!vercelUrl ? `https://${vercelUrl}` : siteUrl;

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
      svgr(),
      tailwindcss(),
      yaml(),
      ...(analyzeBundle
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
  integrations: [react(), relativeStaticAssets()],
  redirects: {
    discord: "https://discord.com/invite/k8xj8d75f6",
    // Legacy long event slugs → truncated slugs (84-char URL limit)
    "/events/229405636-spring-meetup-what-is-lurking-behind-those-laptops":
      "/events/229405636-spring-meetup-what-is-lurking-behind-those",
    "/events/233221987-owddm-escape-the-august-heat-at-this-months-summer-meetup-in-osaka":
      "/events/233221987-owddm-escape-the-august-heat-at-this-months",
    "/events/233957080-september-web-talks-scope-optimization-and-creative-coding":
      "/events/233957080-september-web-talks-scope-optimization-and",
    "/events/255569433-introduction-how-to-hack-your-website-and-make-continuous-integration-from-it":
      "/events/255569433-introduction-how-to-hack-your-website-and-make",
    "/events/259644459-spring-time-march-meetup-rekindle-your-passion-for-web-development":
      "/events/259644459-spring-time-march-meetup-rekindle-your-passion",
    "/events/263532260-hot-summer-hot-topics-osaka-web-dev-and-design-meetup-in-august":
      "/events/263532260-hot-summer-hot-topics-osaka-web-dev-and-design",
    "/events/264050187-autumn-the-beautiful-season-of-colors-osaka-web-dev-and-design-meetup-in-october":
      "/events/264050187-autumn-the-beautiful-season-of-colors-osaka-web",
    "/events/285938706-javascript-dependency-future-and-typescript-at-the-cafe":
      "/events/285938706-javascript-dependency-future-and-typescript-at",
    "/events/294488629-ivskyoto2023-machine-learning-and-open-source-funding":
      "/events/294488629-ivskyoto2023-machine-learning-and-open-source",
    "/events/299334647-workshop-create-a-blogportfolio-in-astro-and-hygraph":
      "/events/299334647-workshop-create-a-blogportfolio-in-astro-and",
    "/events/308421828-oktech-study-session-ddd-part-1-not-another-acronym":
      "/events/308421828-oktech-study-session-ddd-part-1-not-another",
    "/events/308421830-oktech-study-session-ddd-part-2-a-new-product-emerges":
      "/events/308421830-oktech-study-session-ddd-part-2-a-new-product",
    "/events/309961693-oktech-study-session-ddd-part-3-putting-the-model-into-practice":
      "/events/309961693-oktech-study-session-ddd-part-3-putting-the-model",
    "/events/310707456-oktech-study-session-breaking-boundaries-with-hexagonal-architecture":
      "/events/310707456-oktech-study-session-breaking-boundaries-with",
    "/events/311323383-study-session-elephant-carpaccio-exercise-part-1-slicing-it-up":
      "/events/311323383-study-session-elephant-carpaccio-exercise-part-1",
    "/events/311323444-study-session-elephant-carpaccio-exercise-part-2-remaking-it":
      "/events/311323444-study-session-elephant-carpaccio-exercise-part-2",
    "/events/311974329-study-session-inversion-of-control-and-dependency-injection":
      "/events/311974329-study-session-inversion-of-control-and-dependency",
    "/events/313122761-event-driven-architecture-part-2-what-happens-when-reality-intervenes":
      "/events/313122761-event-driven-architecture-part-2-what-happens",
    "/events/313122762-event-driven-architecture-part-3-how-do-we-live-with-this-long-term":
      "/events/313122762-event-driven-architecture-part-3-how-do-we-live",
  },
  markdown: {
    remarkPlugins: [remarkBreaks, remarkReadingTime, remarkDescription, remarkRelativeAssets],
    rehypePlugins: [rehypeTableWrapper, rehypeTaskListCheckbox],
  },
  experimental: {
    clientPrerender: true,
    contentIntellisense: true,
    fonts: [
      {
        name: "Lexend",
        cssVariable: "--font-lexend",
        provider: fontProviders.google(),
        weights: [300, 600, 800],
        styles: ["normal"],
        subsets: ["latin"],
        fallbacks: ["sans-serif"],
      },
    ],
  },
  // astro prefetch config only applies to astro links, mostly it's handled in Link.tsx
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
