import { expect, test } from "@playwright/test";

test.describe("Sitemap and Metadata Validation", () => {
  test("sitemap page loads without 404 images", async ({ page, baseURL }) => {
    const failedImages: string[] = [];

    page.on("response", (response) => {
      const url = response.url();
      const isImage =
        url.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i) ||
        url.includes("/og/") ||
        url.includes("og-image") ||
        url.includes("og.png");

      if (isImage && response.status() === 404) {
        failedImages.push(url);
      }
    });

    // Just load the sitemap HTML page itself
    await page.goto(`${baseURL}/sitemap`);
    await page.waitForTimeout(500); // Give time for any lazy-loaded images

    expect(
      failedImages,
      `Found 404 images on sitemap page: ${failedImages.join(", ")}`,
    ).toHaveLength(0);
  });

  // TODO add more comprehensive tests
});
