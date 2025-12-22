import clsx from "clsx";
import { LuInfo } from "react-icons/lu";

import type { EventEnriched } from "@/content";

import EventProjectorButton from "../Event/EventProjectorButton";
import EventSocialButtons from "../Event/EventSocialButtons";
import CalendarSubscribeButton from "./CalendarSubscribeButton";
import EventCardInfo from "./EventCardInfo";
import LocationCard from "./LocationCard";

function EventActionButtons({
  event,
  horizontal = false,
}: {
  event: EventEnriched;
  horizontal?: boolean;
}) {
  return (
    <div
      className={clsx(
        "flex gap-4",
        horizontal
          ? "fade-overflow scrollbar-hover -mx-4 min-w-full overflow-scroll px-4 pr-20 pb-2"
          : "flex-col",
      )}
    >
      <CalendarSubscribeButton event={event} className="w-full" />
      <EventSocialButtons event={event} />
      <EventProjectorButton event={event} />
    </div>
  );
}

function EventInfo({ event, showVenue }: { event: EventEnriched; showVenue: boolean }) {
  return (
    <div className="text-lg">
      <EventCardInfo
        event={event}
        variant="big"
        fullAddress={showVenue}
        fields={showVenue ? ["date", "time", "venue"] : ["date", "time"]}
      />
    </div>
  );
}

function HowToFindUs({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-lg">
        <LuInfo />
        How to find us
      </div>
      <div className="text-base-600">{text}</div>
    </div>
  );
}

function LocationCardEventNoVenue({
  event,
  horizontal = false,
}: {
  event: EventEnriched;
  horizontal?: boolean;
}) {
  return (
    <>
      <div
        className={clsx(
          "border-base-200 rounded-box flex flex-col border",
          horizontal && "sm:flex-row",
        )}
      >
        <div className="flex w-full flex-col justify-center gap-2 px-8 py-6">
          <EventInfo event={event} showVenue={false} />
        </div>
      </div>
      <EventActionButtons event={event} horizontal={horizontal} />
    </>
  );
}

export default function LocationCardEvent({
  event,
  horizontal = false,
}: {
  event: EventEnriched;
  horizontal?: boolean;
}) {
  if (!event.venue) {
    return <LocationCardEventNoVenue event={event} horizontal={horizontal} />;
  }

  return (
    <LocationCard
      venue={event.venue}
      horizontal={horizontal}
      info={event.data.howToFindUs && <HowToFindUs text={event.data.howToFindUs} />}
      below={<EventActionButtons event={event} horizontal={horizontal} />}
    >
      <EventInfo event={event} showVenue />
    </LocationCard>
  );
}
