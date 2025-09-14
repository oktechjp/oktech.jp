import clsx from "clsx";

import Link from "@/components/Common/Link";
import type { EventEnriched } from "@/content";
import { formatDate, formatDuration, formatTime, getEndTime } from "@/utils/formatDate";

import AddToCalendarDropdown from "../Event/EventCalendarDropdown";
import EventSocialButtons from "../Event/EventSocialButtons";
import LocationCard from "./LocationCard";

export default function LocationCardEvent({
  event,
  horizontal = false,
}: {
  event: EventEnriched;
  horizontal?: boolean;
}) {
  if (!event.venue) return null;
  return (
    <LocationCard
      venue={event.venue}
      horizontal={horizontal}
      info={
        event.data.howToFindUs && (
          <>
            <b className="mr-1">How to find us: </b>
            {event.data.howToFindUs}
          </>
        )
      }
      below={
        <div className={clsx("flex gap-6", horizontal ? "flex-col sm:flex-row" : "flex-col")}>
          <EventSocialButtons event={event} />
          <div className="w-full">
            <AddToCalendarDropdown event={event} />
          </div>
        </div>
      }
    >
      <div className="font-bold">{formatDate(event.data.dateTime, "long")}</div>
      <div>
        {formatTime(event.data.dateTime)}
        {event.data.duration && (
          <>
            {" to "}
            {formatTime(getEndTime(event.data.dateTime, event.data.duration)!)}
            {" ("}
            {formatDuration(event.data.duration)}
            {")"}
          </>
        )}
      </div>
      <div>
        {event.venue?.hasPage ? (
          <Link className="text-link" href={`/venue/${event.venue?.id}`}>
            {event.venue?.title}
          </Link>
        ) : (
          <span>{event.venue?.title}</span>
        )}
      </div>
      <div>{event.venue?.address}</div>
    </LocationCard>
  );
}
