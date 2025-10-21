import rss from "@astrojs/rss";

import { SITE } from "@/constants";
import { getEvents } from "@/content";

import { formatDate } from "../utils/formatDate";
import { urls } from "../utils/urls";

export async function GET() {
  const events = await getEvents();

  // Sort events by date (newest first)
  const sortedEvents = events.sort(
    (a, b) => new Date(b.data.dateTime).getTime() - new Date(a.data.dateTime).getTime(),
  );

  // Use the resolved base URL for the site
  const site = urls.getBaseUrl();

  return rss({
    title: `${SITE.name} - Events`,
    description: `Stay updated with the latest events from ${SITE.longName}`,
    site: site,
    items: sortedEvents.map((event) => ({
      title: event.data.title,
      description: `Event on ${formatDate(event.data.dateTime, "long")}`,
      pubDate: new Date(event.data.dateTime),
      link: urls.toAbsolute(`/events/${event.id}`),
    })),
    customData: `<language>en-us</language>`,
  });
}
