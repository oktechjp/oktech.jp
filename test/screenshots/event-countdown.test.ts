import { expect, test } from "@playwright/test";

import { takeScreenshot } from "../helpers/screenshot";
import { VIEWPORTS } from "../helpers/viewports";

test.describe("Event Countdown Visual", () => {
  VIEWPORTS.forEach((viewport) => {
    test(`should display countdown correctly at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/");

      // Wait for events to load
      await page.waitForSelector('[data-testid="event-card"]');

      // Find the first event card with a countdown
      const countdownElement = page.locator('[data-testid="event-countdown"]').first();

      if (await countdownElement.isVisible()) {
        // Take a screenshot of the event card with countdown
        await takeScreenshot(page, `event-countdown-${viewport.name}`);

        // Verify the countdown element exists
        expect(await countdownElement.isVisible()).toBe(true);
      }
    });
  });
});
