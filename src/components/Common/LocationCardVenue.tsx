import { LuGlobe } from "react-icons/lu";

import type { VenueEnriched } from "@/content";

import LocationCard from "./LocationCard";

export default function LocationCardVenue({
  venue,
  horizontal = false,
}: {
  venue: VenueEnriched;
  horizontal?: boolean;
}) {
  return (
    <LocationCard venue={venue.data} horizontal={horizontal}>
      {venue.data.city && <div className="capitalize">{venue.data.city}, Japan</div>}
      {venue.data.address && <div>{venue.data.address}</div>}
      {venue.data.url && (
        <a
          href={venue.data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link flex items-center gap-2"
        >
          <LuGlobe className="h-4 w-4" />
          {venue.data.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        </a>
      )}
    </LocationCard>
  );
}
