import { test, type Page } from "@playwright/test";

const MOBILE_VIEWPORT = { width: 390, height: 844 };

async function scrollToSection(page: Page, sectionId: string | null, top: number | null) {
  await page.waitForTimeout(400);
  await page.mouse.wheel(0, 200);
  await page.waitForTimeout(200);
  await page.evaluate(
    ({ sectionId, top }) => {
      let target = top ?? 0;
      if (sectionId) {
        const el = document.getElementById(sectionId);
        if (el) target = el.getBoundingClientRect().top + window.scrollY;
      }
      window.scrollTo({ top: target, behavior: "instant" as ScrollBehavior });
    },
    { sectionId, top }
  );
  await page.mouse.wheel(0, 10);
  await page.waitForTimeout(1500);
}

async function shotToggle(page: Page, name: string) {
  const toggle = page.locator('button[aria-label*="menu" i]').first();
  const box = await toggle.boundingBox();
  if (!box) throw new Error(`toggle not visible for ${name}`);
  const pad = 60;
  await page.screenshot({
    path: `tests/screenshots/${name}.png`,
    clip: { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: box.width + pad * 2, height: box.height + pad * 2 },
  });
}

test("mobile toggle over warm-white (gallery)", async ({ browser }) => {
  const context = await browser.newContext({ viewport: MOBILE_VIEWPORT });
  const page = await context.newPage();
  await page.goto("http://localhost:3001/", { waitUntil: "domcontentloaded" });
  await scrollToSection(page, "galeria", null);
  await page.evaluate(() => window.scrollBy({ top: 200, behavior: "instant" as ScrollBehavior }));
  await page.mouse.wheel(0, 10);
  await page.waitForTimeout(500);
  await shotToggle(page, "nav-blend-light");
  await context.close();
});

test("mobile toggle over injected pure white backdrop", async ({ browser }) => {
  const context = await browser.newContext({ viewport: MOBILE_VIEWPORT });
  const page = await context.newPage();
  await page.goto("http://localhost:3001/", { waitUntil: "domcontentloaded" });
  await scrollToSection(page, "galeria", null);
  await page.evaluate(() => {
    const d = document.createElement("div");
    d.style.cssText = "position:fixed;inset:0;background:#ffffff;z-index:10;pointer-events:none;";
    d.id = "white-backdrop";
    document.body.appendChild(d);
  });
  await page.waitForTimeout(300);
  await shotToggle(page, "nav-blend-pure-white");
  await context.close();
});

test("mobile toggle over warm-white (about)", async ({ browser }) => {
  const context = await browser.newContext({ viewport: MOBILE_VIEWPORT });
  const page = await context.newPage();
  await page.goto("http://localhost:3001/", { waitUntil: "domcontentloaded" });
  await scrollToSection(page, "o-mnie", null);
  await page.evaluate(() => window.scrollBy({ top: 300, behavior: "instant" as ScrollBehavior }));
  await page.mouse.wheel(0, 10);
  await page.waitForTimeout(500);
  await shotToggle(page, "nav-blend-about");
  await context.close();
});

test("mobile toggle over coral (hero)", async ({ browser }) => {
  const context = await browser.newContext({ viewport: MOBILE_VIEWPORT });
  const page = await context.newPage();
  await page.goto("http://localhost:3001/", { waitUntil: "domcontentloaded" });
  await scrollToSection(page, null, 400);
  await shotToggle(page, "nav-blend-coral");
  await context.close();
});

test("mobile toggle over yellow (contact)", async ({ browser }) => {
  const context = await browser.newContext({ viewport: MOBILE_VIEWPORT });
  const page = await context.newPage();
  await page.goto("http://localhost:3001/", { waitUntil: "domcontentloaded" });
  await scrollToSection(page, "kontakt", null);
  await shotToggle(page, "nav-blend-yellow");
  await context.close();
});
