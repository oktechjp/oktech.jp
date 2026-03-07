import { test } from "@playwright/test";
import { VIEWPORTS } from "../helpers/viewports";
import { takeScreenshot } from "../helpers/screenshot";

const desktop = VIEWPORTS.find((v) => v.name === "desktop")!;
const mobile = VIEWPORTS.find((v) => v.name === "mobile")!;

test.describe("Article vs Events sort comparison", () => {
  test("articles list - desktop", async ({ page }) => {
    await page.setViewportSize({ width: desktop.width, height: desktop.height });
    await page.goto("/articles");
    await page.waitForLoadState("networkidle");
    await takeScreenshot(page, "articles_sort_desktop", false);
  });

  test("articles list - mobile", async ({ page }) => {
    await page.setViewportSize({ width: mobile.width, height: mobile.height });
    await page.goto("/articles");
    await page.waitForLoadState("networkidle");
    await takeScreenshot(page, "articles_sort_mobile", false);
  });

  test("events list - desktop", async ({ page }) => {
    await page.setViewportSize({ width: desktop.width, height: desktop.height });
    await page.goto("/events/list");
    await page.waitForLoadState("networkidle");
    await takeScreenshot(page, "events_sort_desktop", false);
  });

  test("events list - mobile", async ({ page }) => {
    await page.setViewportSize({ width: mobile.width, height: mobile.height });
    await page.goto("/events/list");
    await page.waitForLoadState("networkidle");
    await takeScreenshot(page, "events_sort_mobile", false);
  });
});
