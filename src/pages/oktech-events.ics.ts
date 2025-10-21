import { SITE } from "@/constants";
import { getEvents } from "@/content";
import { generateEventICS, wrapICSCalendar } from "@/utils/ics";

export async function GET() {
  const events = await getEvents();

  // Sort events by date (newest first)
  const sortedEvents = events.sort(
    (a, b) => new Date(b.data.dateTime).getTime() - new Date(a.data.dateTime).getTime(),
  );

  // Build ICS content
  const icsEvents = sortedEvents.map((event) => generateEventICS(event));
  const icsContent = wrapICSCalendar(icsEvents, `${SITE.shortName} Events`);

  return new Response(icsContent, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="oktech-events.ics"',
    },
  });
}
