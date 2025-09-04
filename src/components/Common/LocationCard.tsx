import clsx from "clsx";

import type { ProcessedVenue } from "@/content";

import CityBadge from "./CityBadge";
import VenueMap from "./LocationMap";

export default function LocationCard({
  below,
  info,
  horizontal = false,
  children,
  venue,
}: {
  venue: ProcessedVenue;
  horizontal?: boolean;
  children: React.ReactNode;
  below?: React.ReactNode;
  info?: React.ReactNode;
}) {
  return (
    <>
      <div className={clsx("glass-card flex", horizontal ? "flex-col sm:flex-row" : "flex-col")}>
        {venue && (
          <div className={clsx("flex", horizontal ? "h-50 sm:h-auto sm:w-90" : "h-60")}>
            <div className="rounded-box-inner relative flex-grow overflow-hidden sm:rounded-r-none">
              <div className="absolute inset-0 z-0 overflow-hidden">
                <VenueMap venue={venue} marker={venue?.title} link={true} />
              </div>
              {venue.city && (
                <div className="absolute right-2 bottom-2 z-10">
                  <CityBadge city={venue.city} />
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex w-full flex-grow flex-col">
          <div className="flex flex-col justify-center gap-2 px-8 py-6">{children}</div>
          {info && (
            <div className="rounded-box-inner chat-bubble-info px-6 py-4 text-sm">{info}</div>
          )}
        </div>
      </div>
      {below}
    </>
  );
}
