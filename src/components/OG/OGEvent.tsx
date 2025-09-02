import { twj } from "tw-to-css";

import { formatDate, formatTime } from "@/utils/formatDate";
import { themeColorsHex } from "@/utils/og/theme-colors";

import OGLayout, { CalendarIcon, IconWrapper, LocationIcon } from "./OGLayout";

interface EventData {
  data: {
    title: string;
    dateTime: Date;
    topics?: string[];
  };
  venue?: {
    id: string;
    title: string;
    city?: string;
  };
}

interface OGEventProps {
  event: EventData;
  mapImageBase64?: string | null;
  coverImageBase64?: string | null;
}

export default function OGEvent({ event }: OGEventProps) {
  const colors = themeColorsHex.light;
  // Format date
  const eventDate = new Date(event.data.dateTime);
  const formattedDate = `${formatDate(eventDate, "long")}, ${formatTime(eventDate)}`;

  // Get venue info
  const venueLocation = event.venue
    ? `${event.venue.title}${event.venue.city ? `, ${event.venue.city}` : ""}`
    : "Location TBD";

  // Determine subtitle based on event data
  const subtitle =
    event.data.topics && event.data.topics.length > 0
      ? event.data.topics.slice(0, 2).join(" • ")
      : "OKTech Event";

  return (
    <OGLayout title={event.data.title} subtitle={subtitle}>
      {/* note - this is not rendered currently as OGLayout does not use children */}
      <div style={twj("flex flex-col gap-6")}>
        <div style={twj("flex items-center gap-4")}>
          <IconWrapper>
            <CalendarIcon />
          </IconWrapper>
          <span
            style={{
              ...twj("text-[20px]"),
              color: colors.baseContent,
              opacity: 0.8,
            }}
          >
            {formattedDate}
          </span>
        </div>

        <div style={twj("flex items-center gap-4")}>
          <IconWrapper>
            <LocationIcon />
          </IconWrapper>
          <span
            style={{
              ...twj("text-[20px]"),
              color: colors.baseContent,
              opacity: 0.8,
            }}
          >
            {venueLocation}
          </span>
        </div>

        {event.data.topics && event.data.topics.length > 2 && (
          <div style={twj("flex mt-2")}>
            <p
              style={{
                ...twj("text-lg"),
                color: colors.baseContent,
                opacity: 0.6,
              }}
            >
              Also featuring: {event.data.topics.slice(2).join(", ")}
            </p>
          </div>
        )}
      </div>
    </OGLayout>
  );
}
