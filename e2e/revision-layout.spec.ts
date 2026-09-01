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

test("representative showreel expands from the top-right frame to the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tr");
  await acceptCookies(page);

  const frame = page.locator('[class*="HeroTypography_showreelFrame"]');
  await expect(
    frame.getByRole("img", { name: /temsili AI showreel görseli/ }),
  ).toBeVisible();
  await expect(
    frame.getByText("AI ile üretilmiş temsili showreel görseli"),
  ).toBeVisible();

  const initial = (await frame.boundingBox())!;
  expect(initial.width).toBeLessThan(600);
  expect(initial.height).toBeLessThan(400);
  expect(initial.x).toBeGreaterThan(800);

  await page.evaluate(() => {
    const stage = document.querySelector('[class*="HeroTypography_stage"]');
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const stageTop = window.scrollY + rect.top;
    window.scrollTo(0, stageTop + rect.height - window.innerHeight);
  });

  await expect
    .poll(async () => (await frame.boundingBox())?.width ?? 0)
    .toBeGreaterThan(1438);
  const expanded = (await frame.boundingBox())!;
  expect(expanded.x).toBeLessThanOrEqual(1);
  expect(expanded.height).toBeGreaterThan(800);
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

  await page.goto("/tr/clients");
  const index = page.locator('[class*="ClientNameIndex_index"]');
  await index.scrollIntoViewIfNeeded();
  const indexBounds = (await index.boundingBox())!;
  expect(indexBounds.x).toBeLessThanOrEqual(1);
  expect(indexBounds.width).toBeGreaterThanOrEqual(1439);
  await expect(index.locator("li").first()).toBeVisible();
  await page.waitForTimeout(500);
  await page.screenshot({ path: testInfo.outputPath("desktop-clients.png") });
});
