import { expect, test } from "@playwright/test";

import { PAGE_PATHS, SPECIAL_PAGE_PATHS } from "../helpers/url";

test.describe("Page Rendering Sanity Test", () => {
  test.describe("Regular Pages", () => {
    Object.values(PAGE_PATHS).forEach((path) => {
      test(`should render a page at ${path}`, async ({ page }) => {
        const response = await page.goto(path);

        // Check that the page loads successfully
        expect(response?.status()).toBeLessThan(400);

        // Wait for the page to be fully loaded
        await page.waitForLoadState("networkidle");

        // Check that the page has content
        const bodyContent = await page.locator("body").textContent();
        expect(bodyContent).toBeTruthy();

        // HTML pages should have a title
        const title = await page.title();
        expect(title).toContain("OKTech");
      });
    });
  });

  test.describe("RSS Feed", () => {
    test(`should render RSS feed at ${SPECIAL_PAGE_PATHS.RSS_FEED}`, async ({ page }) => {
      const response = await page.goto(SPECIAL_PAGE_PATHS.RSS_FEED);

      // Check that the page loads successfully
      expect(response?.status()).toBeLessThan(400);

      // Wait for the page to be fully loaded
      await page.waitForLoadState("networkidle");

      // RSS feed should have content (browser may render it as HTML)
      const content = await page.content();
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(100);
    });
  });

  test.describe("ICS Calendar", () => {
    test(`should render calendar at ${SPECIAL_PAGE_PATHS.ICS_CALENDAR}`, async ({ page }) => {
      // Fetch ICS file directly via API (browsers can't navigate to .ics files)
      const response = await page.request.get(SPECIAL_PAGE_PATHS.ICS_CALENDAR);

      // Check that the file loads successfully
      expect(response.status()).toBeLessThan(400);

      // Check content type header
      const contentType = response.headers()["content-type"];
      expect(contentType).toContain("text/calendar");

      // Verify ICS structure
      const content = await response.text();
      expect(content).toMatch(/BEGIN:VCALENDAR/);
      expect(content).toMatch(/BEGIN:VEVENT/);
      expect(content).toMatch(/END:VCALENDAR/);
    });
  });

  test.describe("XML Sitemap", () => {
    test(`should render XML sitemap at ${SPECIAL_PAGE_PATHS.XML_SITEMAP}`, async ({ page }) => {
      const response = await page.goto(SPECIAL_PAGE_PATHS.XML_SITEMAP);

      // Check that the page loads successfully
      expect(response?.status()).toBeLessThan(400);

      // Check content type header - accept both application/xml and text/xml
      const contentType = response?.headers()["content-type"];
      expect(contentType).toMatch(/(?:application|text)\/xml/);

      // Fetch raw content via API to verify XML structure
      const rawResponse = await page.request.get(SPECIAL_PAGE_PATHS.XML_SITEMAP);
      const rawContent = await rawResponse.text();
      expect(rawContent).toContain("<?xml");
      expect(rawContent).toContain("<urlset");
      expect(rawContent).toContain("<url>");
      expect(rawContent).toContain("<loc>");
    });
  });
});
