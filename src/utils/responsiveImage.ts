// Responsive image utility that works with string paths instead of ImageMetadata
import type { ImageMetadata, UnresolvedImageTransform } from "astro";

import { MAX_IMAGE_WIDTH } from "@/constants";
import { memoize } from "@/utils/memoize";

export interface ImageDimensions {
  width: number;
  height: number;
}

export async function safeGetImage(options: UnresolvedImageTransform): Promise<{ src: string }> {
  try {
    // Try to dynamically import getImage
    const { getImage } = await import("astro:assets");
    return await getImage(options);
  } catch (error) {
    // When getImage is not available, return the original src
    return { src: (options.src as string) || "" };
  }
}

// Most of the legacy event images are 1198 wide
export const DEFAULT_OUTPUT_SIZES = [420, 1198] as const;

// Tailwind CSS breakpoint values
const BP = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export interface ResponsiveImageData {
  src: string;
  srcSet: string;
  sizes: string;
}

export type ImageType =
  | "sidebarLayoutHero"
  | "eventPolaroid"
  | "eventBig"
  | "eventCompact"
  | "galleryThumbnail"
  | "galleryLightbox"
  | "blobSlideshow"
  | "venueMap";

interface ImageConfig {
  sizes: string;
  cropAspectRatio?: number; // Optional aspect ratio (width/height)
  breakpoints?: readonly number[]; // Optional custom breakpoints for this image type
}

export const IMAGE_CONFIGS: Record<ImageType, ImageConfig> = {
  sidebarLayoutHero: {
    sizes: `(max-width: ${BP.md}px) 100vw, 70vw`,
    // 100vw on mobile, 70vw on desktop
  },
  eventPolaroid: {
    sizes: [
      `(max-width: ${BP.sm}px) 100vw`,
      `(max-width: ${BP.lg}px) 50vw`,
      `(min-width: ${BP.lg + 1}px) 20vw`,
      "100vw",
    ].join(", "),
    // 100vw mobile, 50vw tablet, 20vw desktop
  },
  eventBig: {
    sizes: [
      `(max-width: ${BP.sm}px) 100vw`,
      `(max-width: ${BP.lg}px) 60vw`,
      `(min-width: ${BP.lg + 1}px) 40vw`,
      "100vw",
    ].join(", "),
  },
  eventCompact: {
    sizes: [
      "(max-width: 480px) 64px",
      `(max-width: ${BP.sm}px) 96px`,
      `(max-width: ${BP.md}px) 128px`,
      "168px",
    ].join(", "),
    breakpoints: [168],
  },
  galleryThumbnail: {
    sizes: [
      `(max-width: ${BP.sm}px) 100vw`,
      `(max-width: ${BP.lg}px) 50vw`,
      `(min-width: ${BP.lg + 1}px) 25vw`,
      "100vw",
    ].join(", "),
    // Keep original aspect ratio for react-photo-album
  },
  galleryLightbox: {
    // Full viewport at key breakpoints
    sizes: "100vw",
    breakpoints: [MAX_IMAGE_WIDTH],
  },
  blobSlideshow: {
    sizes: `(max-width: ${BP.md}px) 100vw, 50vw`,
    cropAspectRatio: 4 / 3,
  },
  venueMap: {
    sizes: `(min-width: ${BP.sm}px) 33vw, 100vw`,
  },
};

// Import all images using glob - LAZY loading to avoid including all images in build
const eventImages = import.meta.glob<{ default: ImageMetadata }>(
  "/content/events/**/*.{jpg,jpeg,png,webp,svg}",
);

const venueImages = import.meta.glob<{ default: ImageMetadata }>(
  "/content/venues/**/*.{jpg,jpeg,png,webp,svg}",
);

// Combine all image loaders
const imageLoaders: Record<string, () => Promise<{ default: ImageMetadata }>> = {
  ...eventImages,
  ...venueImages,
};

/**
 * Generate responsive image data from a string path and an image type.
 * This combines the image loading and responsive generation into one step.
 *
 * - Uses BREAKPOINTS, capped to the original image width
 * - Produces WebP variants at quality 80
 * - Applies cropping if specified in the image config
 * - Returns { src, srcSet, sizes } ready to spread onto <img>
 */
export const getResponsiveImage = memoize(
  async (
    imagePath: string,
    imageType: ImageType = "galleryLightbox",
  ): Promise<ResponsiveImageData> => {
    // Normalize the path to match import.meta.glob format
    const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

    const loader = imageLoaders[normalizedPath];

    if (!loader) {
      console.error(`Image loader not found: ${normalizedPath}`);
      throw new Error(`Unable to load image at path: ${imagePath}`);
    }

    const module = await loader();
    const image = module.default;

    // Get the config for this image type
    const config = IMAGE_CONFIGS[imageType];
    const { sizes, cropAspectRatio, breakpoints } = config;

    const widths = breakpoints || DEFAULT_OUTPUT_SIZES;

    // If no valid widths, use the original width
    const candidateWidths = widths.length > 0 ? widths : [image.width];

    // Generate all variants
    const variants = await Promise.all(
      candidateWidths.map(async (width) => {
        const imageOptions: UnresolvedImageTransform = {
          src: image,
          width,
          format: "webp",
          quality: 80,
        };

        // Apply cropping if aspect ratio is specified
        if (cropAspectRatio) {
          imageOptions.height = Math.round(width / cropAspectRatio);
          imageOptions.fit = "cover";
        }

        const optimized = await safeGetImage(imageOptions);
        return { url: optimized.src, width };
      }),
    );

    // Largest variant (last in array) → sensible fallback `src`
    const largest = variants[variants.length - 1];

    return {
      src: largest.url, // URL only (not "url 1200w")
      srcSet: variants.map((v) => `${v.url} ${v.width}w`).join(", "),
      sizes,
    };
  },
);

/**
 * Get the original dimensions of an image from its path.
 * Returns the width and height of the original image.
 */
export const getImageDimensions = memoize(async (imagePath: string): Promise<ImageDimensions> => {
  const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  const loader = imageLoaders[normalizedPath];

  if (!loader) {
    console.error(`Image loader not found for dimensions: ${normalizedPath}`);
    // Return default dimensions as fallback
    return { width: 800, height: 600 };
  }

  const module = await loader();
  const image = module.default;

  return {
    width: image.width,
    height: image.height,
  };
});
