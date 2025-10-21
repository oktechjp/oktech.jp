import { defineConfig, devices } from "@playwright/test";

// Get a random port between 10000 and 65000
const getRandomPort = () => Math.floor(Math.random() * (65000 - 10000) + 10000);

// Check if we're testing against production build
const isTestingBuild = process.env.TEST_BUILD === "true";

// Check which type of tests to run
const testType = process.env.TEST_TYPE || "e2e"; // "e2e" or "visuals"

// Use TEST_PORT environment variable if set, otherwise generate a random port
const port = process.env.TEST_PORT
  ? parseInt(process.env.TEST_PORT)
  : process.env.PLAYWRIGHT_TEST_PORT
    ? parseInt(process.env.PLAYWRIGHT_TEST_PORT)
    : getRandomPort();

// Set it in env to ensure consistency across config reloads
process.env.PLAYWRIGHT_TEST_PORT = String(port);

// console.log(
//   `Using port ${port} for Playwright ${testType} tests (${isTestingBuild ? "preview" : "dev"} mode)`,
// );

// Get base path from environment variable
const basePath = process.env.BASE_PATH || "";

export default defineConfig({
  testDir: testType === "screenshots" ? "./test/screenshots" : "./test/e2e",
  outputDir:
    testType === "screenshots" ? "./test/results/screenshots" : "./test/results/test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // reporter: [
  //   [
  //     "html",
  //     {
  //       outputFolder:
  //         testType === "visuals"
  //           ? "./test/results/playwright-visual-report"
  //           : "./test/results/playwright-report",
  //     },
  //   ],
  // ],
  use: {
    baseURL: `http://localhost:${port}${basePath}`,
    trace: "on-first-retry",
    // Visual tests typically need more time for screenshot operations
    ...(testType === "visuals" && {
      navigationTimeout: 30000,
      actionTimeout: 15000,
    }),
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: isTestingBuild
      ? `npm run preview -- --port ${port}${basePath ? ` --base ${basePath}` : ""}`
      : `npm run dev -- --port ${port}`,
    port: port,
    timeout: 120 * 1000,
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      ...process.env,
      DEV_PORT: String(port), // Pass the test port as DEV_PORT to the server
      BASE_PATH: basePath,
    },
  },
});
