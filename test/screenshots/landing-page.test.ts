import { expect, test } from "@playwright/test";

import { takeScreenshot } from "../helpers/screenshot";

test.describe("Landing Page Visual Tests", () => {
  test("should take minimal screenshots with correct data-theme attribute", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check light theme data-attribute (default)
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    // Take light theme screenshot
    await takeScreenshot(page, "landing-page-light", true);

    // Switch to dark theme
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
    });

    // Check dark theme data-attribute
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    // Take dark theme screenshot
    await takeScreenshot(page, "landing-page-dark", true);
  });
});
