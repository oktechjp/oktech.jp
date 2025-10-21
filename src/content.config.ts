import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";

import { eventGalleryImageCollection, eventsCollection } from "./content/events";
import { venuesCollection } from "./content/venues";

const markdownPages = defineCollection({
  loader: glob({
    pattern: ["**/*.md", "!events/**", "!venues/**", "!people/**"],
    base: "./content/",
  }),
});

export const collections = {
  markdownPages,
  events: eventsCollection,
  eventGalleryImage: eventGalleryImageCollection,
  venues: venuesCollection,
};
