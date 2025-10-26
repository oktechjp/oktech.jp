import type { ImageMetadata, UnresolvedImageTransform } from "astro";

import { MAX_IMAGE_WIDTH } from "@/constants";
import { BREAKPOINTS } from "@/utils/breakpoints";
import { memoize } from "@/utils/memoize";

const BP = BREAKPOINTS;

export type ImageType =
  | "sidebarLayoutHero"
  | "eventPolaroid"
  | "eventBig"
  | "eventCompact"
  | "galleryThumbnail"
  | "galleryLightbox"
  | "blobSlideshow"
  | "venueMap";

type ImageVariantKey = "thumbnail" | "galleryThumb" | "card" | "cardCropped" | "hero";
type ImageVariant = { breakpoints: readonly number[]; cropAspectRatio?: number };
type ImageConfig = { sizes: string; variantKey: ImageVariantKey };

const IMAGE_VARIANTS: Record<ImageVariantKey, ImageVariant> = {
  thumbnail: { breakpoints: [96, 144, 216] },
  galleryThumb: { breakpoints: [320, 640, 960] },
  card: { breakpoints: [480, 960, 1440] },
  cardCropped: { breakpoints: [480, 960, 1440], cropAspectRatio: 4 / 3 },
  hero: { breakpoints: [960, 1440, 1920] },
};

const IMAGE_CONFIGS: Record<ImageType, ImageConfig> = {
  sidebarLayoutHero: { sizes: `(max-width: ${BP.md}px) 100vw, 70vw`, variantKey: "hero" },
  eventPolaroid: {
    sizes: `(max-width: ${BP.sm}px) 100vw, (max-width: ${BP.lg}px) 50vw, (min-width: ${BP.lg + 1}px) 20vw, 20vw`,
    variantKey: "card",
  },
  eventBig: {
    sizes: `(max-width: ${BP.sm}px) 100vw, (max-width: ${BP.lg}px) 60vw, (min-width: ${BP.lg + 1}px) 40vw, 40vw`,
    variantKey: "card",
  },
  eventCompact: {
    sizes: `(max-width: 480px) 64px, (max-width: ${BP.sm}px) 96px, (max-width: ${BP.md}px) 128px, 168px`,
    variantKey: "thumbnail",
  },
  galleryThumbnail: {
    sizes: `(max-width: ${BP.sm}px) 100vw, (max-width: ${BP.lg}px) 50vw, (min-width: ${BP.lg + 1}px) 25vw, 25vw`,
    variantKey: "galleryThumb",
  },
  galleryLightbox: { sizes: "100vw", variantKey: "hero" },
  blobSlideshow: { sizes: `(max-width: ${BP.md}px) 100vw, 50vw`, variantKey: "cardCropped" },
  venueMap: { sizes: `(min-width: ${BP.sm}px) 33vw, 100vw`, variantKey: "card" },
};

export interface ImageDimensions {
  width: number;
  height: number;
}
export interface ResponsiveImageData {
  src: string;
  srcSet: string;
  sizes: string;
}

export async function safeGetImage(options: UnresolvedImageTransform): Promise<{ src: string }> {
  try {
    const { getImage } = await import("astro:assets");
    return await getImage(options);
  } catch {
    return { src: (options.src as string) || "" };
  }
}

const DEFAULT_OUTPUT_SIZES = [420, 1198] as const;

const eventImages = import.meta.glob<{ default: ImageMetadata }>(
  "/content/events/**/*.{jpg,jpeg,png,webp,svg}",
);
const venueImages = import.meta.glob<{ default: ImageMetadata }>(
  "/content/venues/**/*.{jpg,jpeg,png,webp,svg}",
);
const imageLoaders: Record<string, () => Promise<{ default: ImageMetadata }>> = {
  ...eventImages,
  ...venueImages,
};

const normalizePath = (path: string) => (path.startsWith("/") ? path : `/${path}`);

const loadImageMetadata = memoize(async (normalizedPath: string): Promise<ImageMetadata> => {
  const loader = imageLoaders[normalizedPath];
  if (!loader) {
    console.error(`Image loader not found: ${normalizedPath}`);
    throw new Error(`Unable to load image at path: ${normalizedPath}`);
  }
  return (await loader()).default;
});

type VariantSources = { src: string; srcSet: string };

const variantCache = new Map<string, Promise<VariantSources>>();

const clampWidths = (sourceWidth: number, widths: readonly number[]) => {
  const candidates = Array.from(
    new Set(
      widths
        .map((width) => Math.min(width, MAX_IMAGE_WIDTH, sourceWidth))
        .filter((width) => width > 0),
    ),
  ).sort((a, b) => a - b);
  return candidates.length > 0 ? candidates : [Math.min(sourceWidth, MAX_IMAGE_WIDTH)];
};

const buildVariantSources = async (image: ImageMetadata, variant: ImageVariant | undefined) => {
  const targetWidths = clampWidths(image.width, variant?.breakpoints ?? DEFAULT_OUTPUT_SIZES);
  const variants = await Promise.all(
    targetWidths.map(async (width) => {
      const options: UnresolvedImageTransform = { src: image, width, format: "webp", quality: 80 };
      if (variant?.cropAspectRatio) {
        options.height = Math.round(width / variant.cropAspectRatio);
        options.fit = "cover";
      }
      const optimized = await safeGetImage(options);
      return { url: optimized.src, width };
    }),
  );
  const largest = variants[variants.length - 1];
  return {
    src: largest.url,
    srcSet: variants.map((variantItem) => `${variantItem.url} ${variantItem.width}w`).join(", "),
  };
};

const resolveVariantSources = async (imagePath: string, variantKey: ImageVariantKey) => {
  const normalizedPath = normalizePath(imagePath);
  const cacheKey = `${normalizedPath}:${variantKey}`;
  if (!variantCache.has(cacheKey)) {
    const variant = IMAGE_VARIANTS[variantKey];
    variantCache.set(
      cacheKey,
      (async () => {
        const metadata = await loadImageMetadata(normalizedPath);
        return buildVariantSources(metadata, variant);
      })(),
    );
  }
  return variantCache.get(cacheKey)!;
};

export async function getResponsiveImage(
  imagePath: string,
  imageType: ImageType = "galleryLightbox",
): Promise<ResponsiveImageData> {
  const { sizes, variantKey } = IMAGE_CONFIGS[imageType];
  const { src, srcSet } = await resolveVariantSources(imagePath, variantKey);
  return { src, srcSet, sizes };
}

export const getImageDimensions = memoize(async (imagePath: string): Promise<ImageDimensions> => {
  try {
    const metadata = await loadImageMetadata(normalizePath(imagePath));
    return { width: metadata.width, height: metadata.height };
  } catch {
    console.error(`Image loader not found for dimensions: ${imagePath}`);
    return { width: 800, height: 600 };
  }
});
