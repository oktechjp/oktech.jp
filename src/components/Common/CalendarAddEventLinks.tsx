import { FaGoogle, FaYahoo } from "react-icons/fa6";
import { LuCalendar } from "react-icons/lu";

import type { EventEnriched } from "@/content/events";
import { urls } from "@/utils/urls";

interface CalendarAddEventLinksProps {
  event: EventEnriched;
}

interface CalendarButtonProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  testId?: string;
}

function CalendarButton({ href, icon, text, testId }: CalendarButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-outline btn-lg gap-4"
      data-testid={testId}
    >
      {icon}
      {text}
    </a>
  );
}

function generateCalendarUrls(event: EventEnriched) {
  const baseUrl = urls.getBaseUrl();
  const eventUrl = `${baseUrl}events/${event.id}`;
  const startDate = new Date(event.data.dateTime);
  const endDate = new Date(event.data.dateTime);
  const duration = event.data.duration || 2;
  endDate.setHours(endDate.getHours() + duration);

  const formatDate = (date: Date) => {
    return date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  };

  const formattedStart = formatDate(startDate);
  const formattedEnd = formatDate(endDate);

  const title = encodeURIComponent(event.data.title);
  const details = encodeURIComponent(`${event.data.title} - OK Tech Meetup\n\n${eventUrl}`);
  const location = encodeURIComponent(
    event.venue?.title
      ? `${event.venue.title}${event.venue.address ? `, ${event.venue.address}` : ""}`
      : "TBD",
  );

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formattedStart}/${formattedEnd}&details=${details}&location=${location}&sf=true`;
  const yahooUrl = `https://calendar.yahoo.com/?v=60&title=${title}&st=${formattedStart}&et=${formattedEnd}&desc=${details}&in_loc=${location}`;
  const icsUrl = `/events/${event.id}.ics`;

  return { googleUrl, yahooUrl, icsUrl };
}

export default function CalendarAddEventLinks({ event }: CalendarAddEventLinksProps) {
  const { googleUrl, yahooUrl, icsUrl } = generateCalendarUrls(event);

  return (
    <>
      <h3 className="text-xl">Add Event to Calendar</h3>
      <div className="flex flex-col gap-4">
        <CalendarButton
          href={icsUrl}
          icon={<LuCalendar className="h-4 w-4" />}
          text="Outlook / iCal"
          testId="calendar-ical"
        />
        <CalendarButton
          href={googleUrl}
          icon={<FaGoogle className="h-4 w-4" />}
          text="Google Calendar"
          testId="calendar-google"
        />
        <CalendarButton
          href={yahooUrl}
          icon={<FaYahoo className="h-4 w-4" />}
          text="Yahoo Calendar"
          testId="calendar-yahoo"
        />
      </div>
    </>
  );
}
