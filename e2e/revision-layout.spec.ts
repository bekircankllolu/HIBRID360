import { expect, test } from "@playwright/test";
import { acceptCookies } from "./utils";

test("desktop shell, mega menu and ecosystem use the full viewport", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tr");
  await acceptCookies(page);

  const hero = page.locator('[class*="HeroTypography_hero"]');
  const heroBounds = (await hero.boundingBox())!;
  expect(heroBounds.x).toBeLessThanOrEqual(1);
  expect(heroBounds.width).toBeGreaterThanOrEqual(1439);
  expect(heroBounds.height).toBeGreaterThanOrEqual(800);

  await page
    .locator("#main-navigation")
    .getByRole("link", { name: "Ne Yapıyoruz", exact: true })
    .hover();
  const mega = page.locator("#desktop-mega-menu");
  await expect(mega).toBeVisible();
  const megaBounds = (await mega.boundingBox())!;
  expect(megaBounds.x).toBeLessThanOrEqual(1);
  expect(megaBounds.width).toBeGreaterThanOrEqual(1439);

  await page.screenshot({ path: testInfo.outputPath("desktop-header-hero.png") });

  const ecosystem = page.getByRole("region", {
    name: "One Hybrid Production Ecosystem.",
  });
  await ecosystem.scrollIntoViewIfNeeded();
  await expect(mega).toBeHidden();
  const stage = page.getByTestId("ecosystem-stage");
  await expect(stage).toHaveAttribute("data-motion", "running");
  await expect
    .poll(() =>
      stage.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
        const pixels = canvas
          .getContext("2d")!
          .getImageData(
            canvas.width * 0.42,
            canvas.height * 0.36,
            canvas.width * 0.16,
            canvas.height * 0.28,
          ).data;
        let bright = 0;
        for (let index = 0; index < pixels.length; index += 4) {
          if (pixels[index] > 100 && pixels[index + 1] > 60) bright += 1;
        }
        return bright;
      }),
    )
    .toBeGreaterThan(200);
  const stageBounds = (await stage.boundingBox())!;
  expect(stageBounds.x).toBeLessThanOrEqual(1);
  expect(stageBounds.width).toBeGreaterThanOrEqual(1439);
  await expect(
    ecosystem.getByRole("button", { name: "CLOUD TV", exact: true }),
  ).toBeVisible();
  await expect(ecosystem.getByText("CLOUD TV", { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("desktop-ecosystem.png") });

  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
  ).toBeLessThanOrEqual(0);
});

test("language dialog and mobile menu remain unclipped", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tr");
  await acceptCookies(page);

  await page.getByRole("button", { name: "Dil" }).click();
  const languageDialog = page.getByRole("dialog", { name: "Dil seçin" });
  await expect(languageDialog).toBeVisible();
  const dialogBounds = (await languageDialog.boundingBox())!;
  expect(dialogBounds.x).toBeLessThanOrEqual(1);
  expect(dialogBounds.width).toBeGreaterThanOrEqual(389);
  await page.waitForTimeout(250);
  await page.screenshot({ path: testInfo.outputPath("mobile-language.png") });

  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Menüyü aç" }).click();
  await expect(page.locator("#main-navigation")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("mobile-menu.png") });

  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
  ).toBeLessThanOrEqual(0);
});

test("service media and client index break out to viewport edges", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tr/what-we-do/digital");
  await acceptCookies(page);

  const visual = page.locator('[class*="service-page_visual"]').first();
  await visual.scrollIntoViewIfNeeded();
  const visualBounds = (await visual.boundingBox())!;
  expect(visualBounds.x).toBeLessThanOrEqual(1);
  expect(visualBounds.width).toBeGreaterThanOrEqual(1439);
  expect(visualBounds.height).toBeGreaterThanOrEqual(899);

  await page.goto("/tr/friends");
  const grid = page.locator('[class*="ClientLogoGrid_grid"]');
  await grid.scrollIntoViewIfNeeded();
  const gridBounds = (await grid.boundingBox())!;
  expect(gridBounds.x).toBeLessThanOrEqual(1);
  expect(gridBounds.width).toBeGreaterThanOrEqual(1439);
  await expect(grid.locator("li").first()).toHaveClass(/itemVisible/);
  await page.waitForTimeout(500);
  await page.screenshot({ path: testInfo.outputPath("desktop-clients.png") });
});
