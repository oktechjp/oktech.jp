import type { ImageMetadata, UnresolvedImageTransform } from "astro";

import { MAX_IMAGE_WIDTH } from "@/constants";
import { memoize } from "@/utils/memoize";

type ImageVariant = { widths: readonly number[]; cropAspectRatio?: number };
const IMAGE_VARIANTS = {
  thumbnail: { widths: [96, 144, 216] },
  galleryThumb: { widths: [320, 640, 960] },
  card: { widths: [360, 540, 960] },
  cardCropped: { widths: [480, 960, 1440], cropAspectRatio: 4 / 3 },
  hero: { widths: [480, 960, 1440, 1920] },
} satisfies Record<string, ImageVariant>;
type ImageVariantKey = keyof typeof IMAGE_VARIANTS;
type ImageConfig = { sizes: string; variantKey: ImageVariantKey };

const IMAGE_CONFIGS = {
  sidebarLayoutHero: { sizes: "(max-width: 900px) 100vw, 70vw", variantKey: "hero" },
  eventPolaroid: {
    sizes:
      "(max-width: 480px) min(100vw, 360px), (max-width: 900px) 50vw, (min-width: 901px) 33vw, 33vw",
    variantKey: "card",
  },
  eventBig: {
    sizes:
      "(max-width: 480px) min(100vw, 420px), (max-width: 900px) 60vw, (min-width: 901px) 45vw, 45vw",
    variantKey: "card",
  },
  eventCompact: {
    sizes: "(max-width: 420px) 64px, (max-width: 480px) 96px, (max-width: 700px) 128px, 168px",
    variantKey: "thumbnail",
  },
  galleryThumbnail: {
    sizes: "(max-width: 480px) 100vw, (max-width: 900px) 50vw, (min-width: 901px) 25vw, 25vw",
    variantKey: "galleryThumb",
  },
  galleryLightbox: { sizes: "100vw", variantKey: "hero" },
  blobSlideshow: { sizes: "(max-width: 900px) 100vw, 50vw", variantKey: "cardCropped" },
  venueMap: { sizes: "(min-width: 481px) 33vw, 100vw", variantKey: "card" },
} satisfies Record<string, ImageConfig>;

export type ImageType = keyof typeof IMAGE_CONFIGS;

export type ImageDimensions = { width: number; height: number };
export type ResponsiveImageData = { src: string; srcSet: string; sizes: string };

export async function safeGetImage(options: UnresolvedImageTransform): Promise<{ src: string }> {
  try {
    const { getImage } = await import("astro:assets");
    return await getImage(options);
  } catch {
    return { src: (options.src as string) || "" };
  }
}

const DEFAULT_WIDTHS = [420, 1198] as const;

const eventImages = import.meta.glob<{ default: ImageMetadata }>(
  "/content/events/**/*.{jpg,jpeg,png,webp,svg}",
);
const venueImages = import.meta.glob<{ default: ImageMetadata }>(
  "/content/venues/**/*.{jpg,jpeg,png,webp,svg}",
);
const assetImages = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/*.{jpg,jpeg,png,webp,svg}",
);
const imageLoaders: Record<string, () => Promise<{ default: ImageMetadata }>> = {
  ...eventImages,
  ...venueImages,
  ...assetImages,
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

const buildVariantSources = async (image: ImageMetadata, variant: ImageVariant | undefined) => {
  const targetWidths = Array.from(
    new Set(
      (variant?.widths ?? DEFAULT_WIDTHS)
        .map((width) => Math.min(width, MAX_IMAGE_WIDTH, image.width))
        .filter((width) => width > 0),
    ),
  ).sort((a, b) => a - b);

  const widths = targetWidths.length > 0 ? targetWidths : [Math.min(image.width, MAX_IMAGE_WIDTH)];

  const variants = await Promise.all(
    widths.map(async (width) => {
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
