import { SITE } from "@/constants";
import type { EventEnriched } from "@/content";

import { urls } from "./urls";

export function formatICSDate(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

export function generateEventICS(event: EventEnriched): string {
  const startDate = new Date(event.data.dateTime);
  const endDate = new Date(event.data.dateTime);
  const durationMinutes = event.data.duration || 120;
  endDate.setMinutes(endDate.getMinutes() + durationMinutes);
  const summary = `${event.data.isCancelled ? "[CANCELLED] " : ""}${event.data.title}`;
  const status = event.data.isCancelled ? "CANCELLED" : "CONFIRMED";

  const eventUrl = urls.toAbsolute(`/events/${event.id}`);

  const location = event.venue?.title
    ? `${event.venue.title}${event.venue.address ? `, ${event.venue.address}` : ""}`
    : "TBD";

  return [
    "BEGIN:VEVENT",
    `UID:${event.id}@OKTECH`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${event.data.title} - ${SITE.longName}\\n\\n${eventUrl}`,
    `LOCATION:${location}`,
    `URL:${eventUrl}`,
    `STATUS:${status}`,
    "END:VEVENT",
  ].join("\r\n");
}

export function wrapICSCalendar(events: string | string[], calName?: string): string {
  const eventsContent = Array.isArray(events) ? events.join("\r\n") : events;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${SITE.name}//Event Calendar//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...(calName ? [`X-WR-CALNAME:${calName}`] : []),
    ...(calName ? [`X-WR-CALDESC:Events from ${calName}`] : []),
    eventsContent,
    "END:VCALENDAR",
  ].join("\r\n");
}
