import clsx from "clsx";
import { LuInfo } from "react-icons/lu";

import Link from "@/components/Common/Link";
import type { EventEnriched } from "@/content";
import { formatDate, formatDuration, formatTime, getEndTime } from "@/utils/formatDate";

import AddToCalendarDropdown from "../Event/EventCalendarDropdown";
import EventSocialButtons from "../Event/EventSocialButtons";
import CalendarSubscribeButton from "./CalendarSubscribeButton";
import { EventCardInfo } from "./EventCardDescription";
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
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-lg">
              <LuInfo />
              How to find us
            </div>
            <div className="text-base-600">{event.data.howToFindUs}</div>
          </div>
        )
      }
      below={
        <div className={clsx("flex gap-6", horizontal ? "flex-col sm:flex-row" : "flex-col")}>
          <EventSocialButtons event={event} />
          <div className="w-full">
            <CalendarSubscribeButton event={event} />
          </div>
        </div>
      }
    >
      <div className="text-lg">
        <EventCardInfo
          event={event}
          variant="big"
          linkToVenue={event.venue?.hasPage ? `/venue/${event.venue?.id}` : undefined}
        />
      </div>
    </LocationCard>
  );
}
