import { eventsCollection } from "./content/events";
import { eventGalleryImageCollection } from "./content/gallery";
import { markdownPagesCollection } from "./content/markdownPages";
import { sponsorsCollection } from "./content/sponsors";
import { venuesCollection } from "./content/venues";

export const collections = {
  events: eventsCollection,
  eventGalleryImage: eventGalleryImageCollection,
  venues: venuesCollection,
  markdownPages: markdownPagesCollection,
  sponsors: sponsorsCollection,
};
