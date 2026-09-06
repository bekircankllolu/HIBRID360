import { expect, test, type Page } from "@playwright/test";
import posts from "../src/data/insights-posts.json";

async function seedConsent(page: Page) {
  await page.context().addInitScript(() => {
    window.localStorage.setItem(
      "hibrid360-consent",
      JSON.stringify({
        necessary: true,
        analytics: false,
        decidedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
  });
}

test.describe("Think & Thank", () => {
  for (const locale of ["tr", "en"] as const) {
    test(`${locale} list renders all imported articles`, async ({ page }) => {
      await seedConsent(page);
      await page.goto(`/${locale}/think-and-thank`);

      await expect(page.getByRole("heading", { level: 1 })).toHaveText("THINK & THANK");
      await expect(
        page.locator(`main a[href^="/${locale}/think-and-thank/"]`),
      ).toHaveCount(19);
      await expect(page.locator("main")).not.toContainText("�");
    });

    test(`${locale} article keeps its three-paragraph structure`, async ({ page }) => {
      await seedConsent(page);
      const post = posts[0];
      await page.goto(`/${locale}/think-and-thank/${post.slug}`);

      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        locale === "tr" ? post.title_tr : post.title_en,
      );
      await expect(page.locator("article div[class*='body'] > p")).toHaveCount(3);
      await expect(page.locator("main")).not.toContainText("�");
    });
  }
});
