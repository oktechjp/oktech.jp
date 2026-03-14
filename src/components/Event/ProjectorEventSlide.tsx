import { LuCalendar, LuMapPin } from "react-icons/lu";

import Brand from "@/components/Common/Brand";
import type { EventEnriched } from "@/content";

interface ProjectorEventSlideProps {
  event: EventEnriched;
  formattedDate: string;
  formattedTime: string;
}

export default function ProjectorEventSlide({
  event,
  formattedDate,
  formattedTime,
}: ProjectorEventSlideProps) {
  return (
    <div className="relative flex h-screen max-h-screen w-screen max-w-[calc(100vh*16/9)] flex-col justify-between p-[3.5vw]">
      {/* Top: Brand */}
      <div className="flex items-start justify-between">
        <div className="text-base-content w-[14vw]">
          <Brand active className="w-full" />
        </div>
      </div>

      {/* Center: Title */}
      <div className="flex flex-1 items-center py-[2vw]">
        <h1
          className="text-base-content line-clamp-4 text-[5.5vw] leading-[1.1] font-bold"
          data-testid="projector-title"
        >
          {event.data.title}
        </h1>
      </div>

      {/* Bottom: Date + Venue row */}
      <div className="flex items-end justify-between gap-[3vw]">
        <div className="flex items-center gap-[1.2vw]">
          <div className="bg-primary/10 rounded-box flex size-[3.5vw] flex-shrink-0 items-center justify-center">
            <LuCalendar className="text-primary size-[1.8vw]" />
          </div>
          <div className="flex flex-col gap-[0.2vw]">
            <span
              className="text-base-content text-[1.8vw] font-medium"
              data-testid="projector-datetime"
            >
              {formattedDate}
            </span>
            <span className="text-base-content/70 text-[1.4vw]">
              {formattedTime}
              {event.data.duration && <span> • {event.data.duration / 60} hours</span>}
            </span>
          </div>
        </div>

        {event.venue && (
          <div className="flex items-center gap-[1.2vw]">
            <div className="bg-primary/10 rounded-box flex size-[3.5vw] flex-shrink-0 items-center justify-center">
              <LuMapPin className="text-primary size-[1.8vw]" />
            </div>
            <div className="flex flex-col gap-[0.2vw]">
              <span
                className="text-base-content text-[1.8vw] font-medium"
                data-testid="projector-venue-title"
              >
                {event.venue.title}
              </span>
              {event.venue.address && (
                <span
                  className="text-base-content/70 text-[1.4vw]"
                  data-testid="projector-venue-address"
                >
                  {event.venue.address}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
