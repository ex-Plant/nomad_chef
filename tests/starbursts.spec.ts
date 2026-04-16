import { test } from "@playwright/test";

test("screenshot starburst variants", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();
  await page.goto("http://localhost:3001/experiments/starbursts", {
    waitUntil: "load",
  });
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: "tests/screenshots/starbursts.png",
    fullPage: true,
  });
  await context.close();
});
