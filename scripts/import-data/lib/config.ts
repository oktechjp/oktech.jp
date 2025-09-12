import { config as dotenvConfig } from "dotenv";
import path from "node:path";

// Load environment variables
dotenvConfig({ path: ".env.local" });

// GitHub configuration
const GITHUB_REPO = "oktechjp/public";

// Environment variables
const STADIA_API_KEY = process.env.STADIA_MAPS_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Base attribution for OpenStreetMap
const BASE_OSM_ATTRIBUTION = "© OpenStreetMap contributors";

// Map provider configurations
const mapProviders = {
  // Free providers
  openstreetmap: {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "",
    requiresKey: false,
  },
  carto: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
    attribution: ", © CartoDB",
    requiresKey: false,
  },
  cartoPositron: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    attribution: ", © CartoDB",
    requiresKey: false,
  },
  cartoDarkMatter: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
    attribution: ", © CartoDB",
    requiresKey: false,
  },

  // Stadia Maps (requires API key)
  stadiaWaterColor: {
    url: `https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.png?api_key=${STADIA_API_KEY}`,
    attribution: ", © Stadia Maps, © Stamen Design",
    requiresKey: true,
  },
  stadiaAlidadeSmoothDark: {
    url: `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${STADIA_API_KEY}`,
    attribution: ", © Stadia Maps",
    requiresKey: true,
  },
  stadiaBright: {
    url: `https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png?api_key=${STADIA_API_KEY}`,
    attribution: ", © Stadia Maps",
    requiresKey: true,
  },
} as const;

export type MapProviderKey = keyof typeof mapProviders;

export interface MapProviderConfig {
  url: string;
  attribution: string;
  requiresKey: boolean;
}

// Main configuration object
export const config = {
  github: {
    repo: GITHUB_REPO,
    token: GITHUB_TOKEN,
    getApiUrl: (endpoint: string) => `https://api.github.com/repos/${GITHUB_REPO}${endpoint}`,
    getRawUrl: (commitHash: string, file: string) =>
      `https://raw.githubusercontent.com/${GITHUB_REPO}/${commitHash}/${file}`,
    getRawBaseUrl: () => `https://raw.githubusercontent.com/${GITHUB_REPO}/refs/heads/main/`,
  },

  paths: {
    content: path.join("content"),
    events: path.join("content", "events"),
    venues: path.join("content", "venues"),
  },

  features: {
    parallelDownloads: 5, // Concurrent download limit
    maxImageWidth: 1920, // Maximum image width for resizing
    imageQuality: 85, // WebP compression quality
  },

  // Photo batch to event ID mapping
  // Maps photo batch timestamps to their corresponding event IDs
  photoEventPatches: {
    1676970780777: "291352411",
    1687916937627: "293876831",
    1708481165291: "298753297",
    1751017766431: "307295517",
    1755942261631: "310102122",
    1755944868036: "310102122",
    1755945025060: "310102122",
  } as Record<number, string>,

  maps: {
    providers: mapProviders,
    defaultProvider: "stadiaWaterColor" as MapProviderKey,
    darkModeProvider: "stadiaAlidadeSmoothDark" as MapProviderKey,
    defaultOptions: {
      width: 1024,
      height: 1024,
      zoom: 15,
      type: "jpeg" as const,
      quality: 90,
    },
  },

  api: {
    stadiaApiKey: STADIA_API_KEY,
  },
} as const;

// Helper function to get map provider configuration
export function getMapProviderConfig(
  providerKey: MapProviderKey,
): MapProviderConfig & { url: string } {
  const provider = mapProviders[providerKey];

  if (!provider) {
    throw new Error(`Unknown map provider: ${providerKey}`);
  }

  // Check if API key is required
  if (provider.requiresKey && !STADIA_API_KEY) {
    throw new Error(
      `Provider "${providerKey}" requires STADIA_MAPS_API_KEY environment variable to be set in .env.local`,
    );
  }

  return {
    url: provider.url,
    attribution: BASE_OSM_ATTRIBUTION + provider.attribution,
    requiresKey: provider.requiresKey,
  };
}

// Export data source URLs
export function getDataUrls(commitHash: string, customRepo?: string) {
  const repo = customRepo || GITHUB_REPO;
  const getRawUrl = (file: string) =>
    `https://raw.githubusercontent.com/${repo}/${commitHash}/${file}`;

  return {
    events: getRawUrl("events.json"),
    photos: getRawUrl("photos.json"),
  };
}
