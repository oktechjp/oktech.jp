import type { Page } from "@playwright/test";

/**
 * Takes a screenshot with standardized path and naming conventions
 * @param page - Playwright page object
 * @param name - Name for the screenshot (without extension)
 * @param fullPage - Whether to capture the full page (default: false)
 */
export async function takeScreenshot(
  page: Page,
  name: string,
  fullPage: boolean = false,
): Promise<void> {
  await page.screenshot({
    path: `test/screenshots/output/${name}.png`,
    fullPage,
  });
}
