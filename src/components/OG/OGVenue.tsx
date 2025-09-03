import OGLayout from "./OGLayout";

interface VenueData {
  id: string;
  data: {
    title: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    cover?: {
      src: string;
    };
  };
}

interface OGVenueProps {
  venue: VenueData;
}

export default function OGVenue({ venue }: OGVenueProps) {
  // const locationParts = [venue.data.city, venue.data.country].filter(Boolean);
  // const location = locationParts.join(", ");

  return <OGLayout>TODO</OGLayout>;
}
