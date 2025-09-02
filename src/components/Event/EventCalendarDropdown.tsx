import { useRef } from "react";

import { FaGoogle, FaYahoo } from "react-icons/fa6";
import { LuCalendar, LuCalendarPlus } from "react-icons/lu";

import CalendarFeeds from "@/components/Common/CalendarFeeds";
import type { EventEnriched } from "@/content/events";
import { useClickOutside } from "@/hooks/useClickOutside";
import { resolveBaseUrl } from "@/utils/urlResolver";

interface AddToCalendarDropdownProps {
  event: EventEnriched;
}

interface ButtonProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  testId: string;
}

function Button({ href, icon, text, testId }: ButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-ghost btn-sm justify-start gap-3"
      data-testid={testId}
    >
      {icon}
      {text}
    </a>
  );
}

interface SubsectionProps {
  title: string;
  children: React.ReactNode;
}

function Subsection({ title, children }: SubsectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-base-content/70 px-2 text-xs font-semibold">{title}</div>
      <div className="flex flex-col gap-2 sm:flex-row">{children}</div>
    </div>
  );
}

export default function AddToCalendarDropdown({ event }: AddToCalendarDropdownProps) {
  const dropdownRef = useRef<HTMLDetailsElement>(null);

  useClickOutside(dropdownRef, () => {
    if (dropdownRef.current?.open) {
      dropdownRef.current.open = false;
    }
  });

  // Generate calendar URLs
  const baseUrl = resolveBaseUrl();
  const eventUrl = `${baseUrl}/events/${event.id}`;

  // Format dates for calendar links
  const startDate = new Date(event.data.dateTime);
  const endDate = new Date(event.data.dateTime);
  const duration = event.data.duration || 2;
  endDate.setHours(endDate.getHours() + duration);

  // Format dates as YYYYMMDDTHHMMSSZ
  const formatDate = (date: Date) => {
    return date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  };

  const formattedStart = formatDate(startDate);
  const formattedEnd = formatDate(endDate);

  // Event details
  const title = encodeURIComponent(event.data.title);
  const details = encodeURIComponent(`${event.data.title} - OK Tech Meetup\n\n${eventUrl}`);
  const location = encodeURIComponent(
    event.venue?.title
      ? `${event.venue.title}${event.venue.address ? `, ${event.venue.address}` : ""}`
      : "TBD",
  );

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formattedStart}/${formattedEnd}&details=${details}&location=${location}&sf=true`;
  const yahooUrl = `https://calendar.yahoo.com/?v=60&title=${title}&st=${formattedStart}&et=${formattedEnd}&desc=${details}&in_loc=${location}`;

  return (
    <details
      className="dropdown dropdown-bottom dropdown-end lg:dropdown-left w-full lg:[&_.dropdown-content]:top-auto lg:[&_.dropdown-content]:bottom-0"
      ref={dropdownRef}
      data-testid="add-to-calendar-dropdown"
    >
      <summary className="btn btn-lg w-full gap-4">
        Add to Calendar
        <LuCalendarPlus />
      </summary>
      <div className="dropdown-content bg-base-100 rounded-box z-50 mt-1 flex min-w-max flex-col gap-6 p-6 shadow lg:mt-0 lg:mr-1">
        <Subsection title="Add Single Event">
          <Button
            href={`/events/${event.id}.ics`}
            icon={<LuCalendar className="h-4 w-4" />}
            text="Outlook / iCal"
            testId="calendar-ical"
          />
          <Button
            href={googleUrl}
            icon={<FaGoogle className="h-4 w-4" />}
            text="Google Calendar"
            testId="calendar-google"
          />
          <Button
            href={yahooUrl}
            icon={<FaYahoo className="h-4 w-4" />}
            text="Yahoo Calendar"
            testId="calendar-yahoo"
          />
        </Subsection>
        <Subsection title="Subscribe to All Events">
          <CalendarFeeds inline className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2" />
        </Subsection>
      </div>
    </details>
  );
}
