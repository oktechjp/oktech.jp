import { expect, test } from "@playwright/test";

test.describe("Navigation Flow", () => {
  test("navigate through events, filter, and venue pages", async ({ page }) => {
    await page.goto("/");

    const eventsLink = page.locator('nav a[href="/events"]').first();
    await eventsLink.click();
    await page.waitForURL("/events");

    const searchInput = page.locator('input[type="search"]');
    await searchInput.fill("agentic");
    await page.waitForTimeout(500);

    const agenticEvent = page.locator('text="Agentic Sentiments"').first();
    await expect(agenticEvent).toBeVisible();
    await agenticEvent.click();

    await page.waitForURL(/\/events\/308580120-agentic-sentiments/);

    const cybozuLink = page.locator('a[href="/venue/24529555-cybozu-osaka-office"]').last();
    await cybozuLink.click();
    await expect(page.locator('h1:has-text("Cybozu")')).toBeVisible();

    const pandasEventLink = page.locator('a:has-text("Data with Pandas")').first();
    await pandasEventLink.click();

    await page.waitForURL(/\/events\/305361716-data-with-pandas/);
    await expect(page.locator('text="Data with Pandas"').first()).toBeVisible();
  });
});