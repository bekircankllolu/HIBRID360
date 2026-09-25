import { expect, test } from "@playwright/test";
import sharp from "sharp";
import { acceptCookies } from "./utils";

test("desktop shell, mega menu and ecosystem use the full viewport", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tr");
  await acceptCookies(page);

  const navigation = page.locator("#main-navigation");
  await expect(navigation.locator(":scope > ul > li > a")).toHaveText([
    "Our Culture",
    "What We Do",
    "Works",
    "Friends",
    "Partners",
    "Think & Thank",
    "Contact",
  ]);
  await expect(
    navigation.getByRole("link", { name: "Çözümler", exact: true }),
  ).toHaveCount(0);

  const hero = page.locator('[class*="HeroTypography_hero"]');
  const heroBounds = (await hero.boundingBox())!;
  expect(heroBounds.x).toBeLessThanOrEqual(1);
  expect(heroBounds.width).toBeGreaterThanOrEqual(1439);
  expect(heroBounds.height).toBeGreaterThanOrEqual(800);

  await page
    .locator("#main-navigation")
    .getByRole("link", { name: "What We Do", exact: true })
    .hover();
  const mega = page.locator("#desktop-mega-menu");
  await expect(mega).toBeVisible();
  await expect(mega).toHaveCSS("background-color", "rgb(255, 252, 0)");
  await expect(mega).toHaveCSS("color", "rgb(0, 0, 0)");
  const megaBounds = (await mega.boundingBox())!;
  expect(megaBounds.x).toBeLessThanOrEqual(1);
  expect(megaBounds.width).toBeGreaterThanOrEqual(1439);

  await navigation
    .getByRole("link", { name: "Our Culture", exact: true })
    .hover();
  await expect(mega.getByRole("link", { name: "WHO WE ARE" })).toBeVisible();
  await expect(
    mega.getByRole("link", { name: "WHAT WE BELIEVE" }),
  ).toBeVisible();
  await expect(
    mega.getByRole("link", { name: "THINK & THANK" }),
  ).toBeVisible();

  await navigation.getByRole("link", { name: "Partners", exact: true }).hover();
  await expect(mega.getByRole("link", { name: "Studio Food Room" })).toBeVisible();
  await expect(
    mega.getByRole("link", { name: "MARRY ME KITCHEN" }),
  ).toBeVisible();

  await page.screenshot({ path: testInfo.outputPath("desktop-header-hero.png") });

  const ecosystem = page.getByRole("region", {
    name: "One Hybrid Production Ecosystem.",
  });
  await ecosystem.scrollIntoViewIfNeeded();
  // Menü scroll olayında kapanıyor; olay, sahne kurulurken (Three.js parse +
  // shader derleme) ana iş parçacığı meşgulken geç işlenebilir — yavaş CI'da 5 sn
  // yetmedi. Davranış aynı, yalnız süre payı geniş.
  await expect(mega).toBeHidden({ timeout: 20_000 });
  const stage = page.getByTestId("ecosystem-stage");
  await expect(stage).toHaveAttribute("data-motion", "running");
  // Sahne 18 Eylül 2026'da WebGL'e geçti: canvas'tan 2B bağlam okunamıyor,
  // parlaklık ekran görüntüsünden ölçülüyor (MONA sahnesindeki kalıp).
  await expect(stage).toHaveAttribute("data-scene", "webgl", { timeout: 30_000 });
  await expect
    .poll(
      async () => {
        const { data } = await sharp(await stage.screenshot())
          .removeAlpha()
          .resize(160, 100, { fit: "fill" })
          .raw()
          .toBuffer({ resolveWithObject: true });
        let bright = 0;
        for (let index = 0; index < data.length; index += 3) {
          if (data[index] > 100 && data[index + 1] > 60) bright += 1;
        }
        return bright;
      },
      { timeout: 30_000 },
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

test("homepage revision order, copy and footer details stay intact", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tr");
  await acceptCookies(page);

  const etScene = page.locator("section[data-scroll-scrub]");
  const reachOut = page.getByRole("region", {
    name: "Sizin için ne yapabiliriz?",
  });
  const lessTalk = page.getByRole("region", { name: "Az Laf, Çok İş" });
  const positions = await Promise.all(
    [etScene, reachOut, lessTalk].map((locator) =>
      locator.evaluate((element) => (element as HTMLElement).offsetTop),
    ),
  );

  expect(positions[0]).toBeLessThan(positions[1]);
  expect(positions[1]).toBeLessThan(positions[2]);
  await expect(etScene).toContainText(
    "The future of creativity isn’t artificial.It’s hybrid.",
  );
  await expect(reachOut).toContainText(
    "Hibrid 360’ta işin son rötuşunu, o parlak bitişi ciddiye alıyoruz.",
  );
  await expect(lessTalk.getByRole("heading")).toHaveCSS(
    "color",
    "rgb(255, 252, 0)",
  );

  await expect(
    page.getByRole("link", { name: "Birlikte sıra dışı bir şey üretelim." }),
  ).toHaveCount(0);

  // Kaynak metin "Hibrid 360" (tek marka yazımı); caps görünüm CSS'ten gelir.
  const headerLogo = page.locator("header").getByRole("link", {
    name: "Hibrid 360",
  });
  const footerLogo = page.locator("footer").getByText("Hibrid 360", {
    exact: true,
  });
  expect(await footerLogo.evaluate((element) => getComputedStyle(element).fontSize)).toBe(
    await headerLogo.evaluate((element) => getComputedStyle(element).fontSize),
  );
  await expect(page.locator("footer address").locator("span > span")).toHaveText([
    "Feneryolu Mahallesi, Ebru Sokak, Manolya Apt. No: 3A-3B",
    "İstanbul | Türkiye",
  ]);
});

test("showreel expands from the top-right frame to the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tr");
  await acceptCookies(page);

  /*
   * 25 Eylül 2026: müşterinin gerçek showreel'i (61 sn, müzikli). Temsili
   * AI videosu ve "AI ile üretilmiş temsili…" açıklaması kalktı. Video
   * sessiz başlar (otomatik ses yasak); kadrajdaki düğme sesi açar/kapatır.
   */
  const frame = page.locator('[class*="HeroTypography_showreelFrame"]');
  const showreel = frame.locator("video");
  await expect(showreel).toHaveCount(1);
  await expect(showreel).toHaveAttribute("preload", "none");
  await expect(showreel).toHaveJSProperty("muted", true);
  await expect(frame.getByText("AI ile üretilmiş temsili showreel videosu")).toHaveCount(0);

  // Ses düğmesi: varsayılan kapalı; basınca açılır, tekrar basınca kapanır.
  const soundOn = frame.getByRole("button", { name: "Sesi aç", exact: true });
  await expect(soundOn).toHaveAttribute("aria-pressed", "false");
  await soundOn.click();
  const soundOff = frame.getByRole("button", { name: "Sesi kapat", exact: true });
  await expect(soundOff).toHaveAttribute("aria-pressed", "true");
  await expect(showreel).toHaveJSProperty("muted", false);
  await soundOff.click();
  await expect(frame.getByRole("button", { name: "Sesi aç", exact: true })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(showreel).toHaveJSProperty("muted", true);

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
  await expect(languageDialog).toHaveCSS("background-color", "rgb(255, 252, 0)");
  await expect(languageDialog).toHaveCSS("color", "rgb(0, 0, 0)");
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

  const visual = page.locator('[class*="ChapterVisualDeck_frame"]').first();
  await visual.scrollIntoViewIfNeeded();
  const visualBounds = (await visual.boundingBox())!;
  expect(visualBounds.width).toBeGreaterThan(500);
  expect(visualBounds.height).toBeGreaterThan(500);

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
