import { defineCollection, getCollection, reference, z } from "astro:content";
import type { CollectionEntry } from "astro:content";

import { memoize } from "@/utils/memoize";
import {
  type ImageDimensions,
  type ResponsiveImageData,
  getImageDimensions,
  getResponsiveImage,
} from "@/utils/responsiveImage";

export type GalleryImage = CollectionEntry<"eventGalleryImage"> & {
  thumbnail: ResponsiveImageData;
  full: ResponsiveImageData;
  dimensions: ImageDimensions;
};

export const eventGalleryImageCollection = defineCollection({
  loader: eventGalleryImageLoader,
  schema: eventGalleryImageSchema,
});

export async function eventGalleryImageLoader() {
  const [images, metadata] = await Promise.all([
    import.meta.glob("/content/events/**/gallery/*.{webp,jpg,jpeg,png,gif,svg}"),
    import.meta.glob("/content/events/**/gallery/*.yaml", { eager: true }),
  ]);
  return Object.entries(images).map(([id]) => {
    const metaDataPath = `${id}.yaml`;
    const metaDataModule = metadata[metaDataPath] as
      | { default: Record<string, unknown> }
      | undefined;
    const imageMetadata = metaDataModule?.default as Record<string, unknown>;
    const event = id.split("/").slice(0, -2).pop();
    return { ...imageMetadata, id, event, image: id };
  });
}

function eventGalleryImageSchema() {
  return z.object({
    id: z.string(),
    image: z.string(),
    event: reference("events"),
    caption: z.string().optional(),
  });
}

export const getGalleryImages = memoize(async (eventId: string): Promise<GalleryImage[]> => {
  const images = await getCollection("eventGalleryImage");
  const relevant = images.filter((img) => img.data.event.id === eventId);

  return Promise.all(
    relevant.map(async (img) => {
      const [thumbnail, full, dimensions] = await Promise.all([
        getResponsiveImage(img.data.image, "galleryThumbnail"),
        getResponsiveImage(img.data.image, "galleryLightbox"),
        getImageDimensions(img.data.image),
      ]);

      return {
        ...img,
        thumbnail,
        full,
        dimensions,
      };
    }),
  );
});
