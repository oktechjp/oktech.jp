import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";

import { eventsCollection } from "./content/events";
import { eventGalleryImageCollection } from "./content/gallery";
import { venuesCollection } from "./content/venues";

export const collections = {
  events: eventsCollection,
  eventGalleryImage: eventGalleryImageCollection,
  venues: venuesCollection,
  markdownPages: defineCollection({
    loader: glob({
      pattern: ["**/*.md", "!events/**", "!venues/**", "!people/**"],
      base: "./content/",
    }),
  }),
};
