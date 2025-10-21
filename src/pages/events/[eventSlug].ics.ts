import type { APIRoute } from "astro";

import { getEvents } from "@/content";
import { generateEventICS, wrapICSCalendar } from "@/utils/ics";

export const prerender = true;

export async function getStaticPaths() {
  const events = await getEvents();

  return events.map((event) => ({
    params: { eventSlug: event.id },
    props: { event },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { event } = props;

  const eventICS = generateEventICS(event);
  const icsContent = wrapICSCalendar(eventICS);

  return new Response(icsContent, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="event-${event.id}.ics"`,
    },
  });
};
