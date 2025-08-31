import { expect, test } from "@playwright/test";
import * as fs from "fs";
import matter from "gray-matter";
import * as path from "path";

import { formatDate } from "@/utils/formatDate";

interface EventData {
  title: string;
  dateTime: string;
  duration: number;
  devOnly?: boolean;
  meetupId?: number;
  slug: string;
}

function getLatestEvent(): EventData | null {
  const eventsDir = path.join(process.cwd(), "content", "events");
  const eventFolders = fs.readdirSync(eventsDir);

  let latestEvent: EventData | null = null;
  let latestTime = 0;

  for (const folder of eventFolders) {
    const eventPath = path.join(eventsDir, folder, "event.md");
    if (!fs.existsSync(eventPath)) continue;

    const content = fs.readFileSync(eventPath, "utf-8");
    const { data } = matter(content);

    // Skip dev-only events
    if (data.devOnly) continue;

    // Parse date as JST (matching how events.ts handles it)
    const [date, time] = data.dateTime.split(" ");
    const eventDate = new Date(`${date}T${time}:00+09:00`);
    const eventTime = eventDate.getTime();

    if (eventTime > latestTime) {
      latestTime = eventTime;
      latestEvent = {
        title: data.title,
        dateTime: eventDate.toISOString(), // Store as ISO string for consistent handling
        duration: data.duration,
        meetupId: data.meetupId,
        slug: folder,
      };
    }
  }

  return latestEvent;
}

test.describe("Latest Event Visibility", () => {
  let latestEvent: EventData | null;

  test.beforeAll(() => {
    latestEvent = getLatestEvent();
    if (!latestEvent) {
      throw new Error("No events found in content directory");
    }
    console.log("Testing latest event:", latestEvent.title);
    console.log("Event date:", latestEvent.dateTime);
  });

  test("latest event appears on landing page", async ({ page }) => {
    await page.goto("/");

    // Simply check if the event title appears anywhere on the landing page
    const eventTitle = page.locator(`text="${latestEvent!.title}"`);
    await expect(eventTitle).toBeVisible();
  });

  test("latest event appears on events page", async ({ page }) => {
    await page.goto("/events");

    // Check if the event title appears on the events page
    const eventTitle = page.locator(`text="${latestEvent!.title}"`);
    await expect(eventTitle).toBeVisible();
  });

  test("latest event detail page exists with correct information", async ({ page }) => {
    const eventUrl = `/events/${latestEvent!.slug}`;
    await page.goto(eventUrl);

    // Check the title is on the page
    const title = page.locator(`text="${latestEvent!.title}"`);
    await expect(title).toBeVisible();

    // Check the date is displayed (using our formatDate utility with "long" format)
    const longDateString = formatDate(latestEvent!.dateTime, "long");

    // Check that the date text exists on the page (might be in desktop or mobile view)
    const dateElement = page.locator(`text="${longDateString}"`);
    await expect(dateElement).toHaveCount(2); // Should be present in both desktop and mobile views

    // Check for Meetup URL if meetupId exists
    if (latestEvent!.meetupId) {
      const meetupUrl = `https://www.meetup.com/osaka-web-designers-and-developers-meetup/events/${latestEvent!.meetupId}`;
      const meetupLink = page.locator(`a[href="${meetupUrl}"]`);
      await expect(meetupLink).toHaveCount(2); // Should be present in both desktop and mobile views
    }
  });
});
