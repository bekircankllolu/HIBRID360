import { test, expect } from "@playwright/test";
import { acceptCookies } from "./utils";

test("kapanış videosu sayfa kaydırmasıyla ileri ve geri sarılır", async ({
  page,
}) => {
  await page.goto("/tr");
  await acceptCookies(page);

  const section = page.locator("section[data-scroll-scrub]");
  const video = section.locator("video");

  await expect(section).toBeVisible();
  const metrics = await section.evaluate((element) => ({
    top: element.offsetTop,
    travel: element.offsetHeight - window.innerHeight,
  }));

  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), metrics.top);
  await expect
    .poll(() => video.evaluate((element) => element.duration))
    .toBeGreaterThan(0);

  await expect.poll(() => video.evaluate((element) => element.currentTime)).toBeLessThan(0.25);

  await page.evaluate(
    ({ top, travel }) =>
      window.scrollTo({ top: top + travel * 0.8, behavior: "instant" }),
    metrics,
  );
  await expect.poll(() => video.evaluate((element) => element.currentTime)).toBeGreaterThan(3.5);

  await page.evaluate(
    ({ top, travel }) =>
      window.scrollTo({ top: top + travel * 0.25, behavior: "instant" }),
    metrics,
  );
  await expect.poll(() => video.evaluate((element) => element.currentTime)).toBeLessThan(2);
});
