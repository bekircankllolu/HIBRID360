import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import sharp from "sharp";
import { acceptCookies } from "./utils";
import { CRYSTAL_MEDIA, orbitStones } from "../src/data/solar-system";
import { SERVICE_OFFERINGS } from "../src/data/service-offerings";

/**
 * Hibrid ekosistemi — 3B uzay sahnesi (18 Eylül 2026).
 *
 * Sahne Canvas 2B'den WebGL'e taşındı: düz noktalar yerine gerçek gezegenler,
 * gerçek Kepler yörüngeleri, tıklanınca kameranın uçtuğu bir odak kipi.
 * Bu dosya o yeni sözleşmeyi bekçiliyor. Eski sürümün sürükleme ve
 * "kristali kaydırarak sar" testleri KALDIRILDI — o etkileşimler artık yok
 * (gezegen sürüklenmiyor, kamera döndürülüyor).
 *
 * Korunan sözleşmeler (eski dosyadan taşındı, hâlâ geçerli):
 * - medya görünür alana girmeden indirilmiyor,
 * - duraklat düğmesi sahneyi gerçekten donduruyor,
 * - hareket azaltmada tek statik kare,
 * - klavyeyle gezinme + Escape ile kapanış ve odak dönüşü,
 * - üç ekran genişliğinde sahne boş değil ve detay paneli kırpılmıyor.
 *
 * Piksel kontrolleri MONA sahnesindeki kalıbı izliyor: canvas'tan 2B bağlam
 * okunamayacağı için ekran görüntüsü alınıp `sharp` ile ölçülüyor.
 */

const services = orbitStones.map((stone) => stone.label);

async function openScene(page: Page, locale = "tr", reduced = false) {
  await page.goto(`/${locale}`);
  await acceptCookies(page);
  const stage = page.getByTestId("ecosystem-stage");
  await stage.scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute("data-motion", reduced ? "paused" : "running");
  // WebGL kurulmalı; kurulamazsa bileşen poster'a düşer ve bunu söyler.
  await expect(stage).toHaveAttribute("data-scene", "webgl", { timeout: 30_000 });
  if (!reduced) {
    await expect(stage).toHaveAttribute("data-running", "true", { timeout: 30_000 });
  }
  return stage;
}

/** Sahnenin ne kadarı aydınlık — "boş siyah kutu" nöbetçisi. */
async function litFraction(buffer: Buffer): Promise<number> {
  const { data } = await sharp(buffer).removeAlpha().resize(160, 100, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
  let lit = 0;
  for (let i = 0; i < data.length; i += 3) {
    if (data[i] > 40 || data[i + 1] > 40 || data[i + 2] > 40) lit++;
  }
  return lit / (data.length / 3);
}

test("sahne yıldız, gezegenler ve yörüngelerle çiziliyor", async ({ page }, info) => {
  const stage = await openScene(page);
  await page.waitForTimeout(2500);
  const shot = await stage.screenshot();
  await page.screenshot({ path: info.outputPath("solar-wide.png") });
  // Yıldız + gezegenler + yıldız alanı: kareye dağılmış aydınlık pikseller.
  expect(await litFraction(shot)).toBeGreaterThan(0.04);

  // Sekiz gezegenin etiketi de sahnenin İÇİNDE duruyor (kadraj dışına
  // düşen bir gezegen tıklanamaz olurdu).
  const box = (await stage.boundingBox())!;
  for (const label of services) {
    const button = page.getByRole("button", { name: label, exact: true });
    const target = (await button.boundingBox())!;
    expect(target.x).toBeGreaterThanOrEqual(box.x - 4);
    expect(target.x + target.width).toBeLessThanOrEqual(box.x + box.width + 4);
    expect(target.y).toBeGreaterThanOrEqual(box.y - 4);
    expect(target.y + target.height).toBeLessThanOrEqual(box.y + box.height + 4);
  }
});

test("gezegene odaklanınca kamera yaklaşıyor, panel hizmetin tamamını gösteriyor", async ({ page }) => {
  const stage = await openScene(page);
  await page.waitForTimeout(2000);
  // Gezegenin ekrandaki yarıçapı: bileşen her karede `--ring` değişkenine
  // yazıyor (odak halkasının çapı). Kameranın yaklaşıp yaklaşmadığının
  // doğrudan ölçüsü bu — "aydınlık piksel oranı" yanıltıcı, çünkü odakta
  // yıldız ve yörüngeler kadraj dışında kalıyor.
  const ringPx = async () =>
    Number.parseFloat(
      await page
        .locator("[data-testid='ecosystem-stage'] [class*='point__']")
        .nth(5)
        .evaluate((el) => getComputedStyle(el).getPropertyValue("--ring")),
    );
  const wideRing = await ringPx();

  const button = page.getByRole("button", { name: "CLOUD TV", exact: true });
  // Gezegen hareket ediyor: klavye yolu hem kararlı hem erişilebilir yol.
  await button.focus();
  await page.keyboard.press("Enter");

  await expect(stage).toHaveAttribute("data-focus", "CLOUD TV");
  const detail = page.locator("#ecosystem-detail");
  await expect(detail).toBeVisible();
  await expect(detail.getByRole("heading", { level: 3 })).toHaveText("CLOUD TV");

  // Panel artık tek satırlık tanımla yetinmiyor: hizmet kapsamının tamamı.
  for (const offering of SERVICE_OFFERINGS.cloudTv) {
    await expect(detail.getByText(offering, { exact: true })).toBeVisible();
  }
  await expect(detail.getByRole("link")).toHaveAttribute("href", "/tr/what-we-do/cloud-tv");

  // Kamera gerçekten yaklaşmalı: Cloud TV (6. gezegen) ekranda en az üç
  // katına çıkmalı.
  await page.waitForTimeout(2800);
  expect(await ringPx()).toBeGreaterThan(wideRing * 3);
});

test("boşluğa tıklayınca odak bırakılıyor", async ({ page }) => {
  const stage = await openScene(page);
  await page.getByRole("button", { name: "CREATIVE", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(stage).toHaveAttribute("data-focus", "CREATIVE");

  const box = (await stage.boundingBox())!;
  // Sahnenin sol alt köşesi: gezegen de panel de orada değil.
  await page.mouse.click(box.x + 40, box.y + box.height - 40);
  await expect(stage).toHaveAttribute("data-focus", "none");
  await expect(page.locator("#ecosystem-detail")).toBeHidden();
});

for (const locale of ["tr", "en"] as const) {
  test(`${locale}: klavyeyle gezinme, gerçek bağlantılar, Escape ile kapanış`, async ({ page }) => {
    const stage = await openScene(page, locale);
    for (const [index, stone] of orbitStones.entries()) {
      const button = page.getByRole("button", { name: stone.label, exact: true });
      await button.focus();
      await expect(button).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(stage).toHaveAttribute("data-focus", stone.label);
      const detail = page.locator("#ecosystem-detail");
      await expect(detail.getByRole("link")).toHaveAttribute(
        "href",
        `/${locale}${stone.href}`,
      );
      // Escape kapatır ve odağı tetikleyen düğmeye geri verir.
      await page.keyboard.press("Escape");
      await expect(detail).toBeHidden();
      await expect(button).toBeFocused();
      if (index === 0) {
        const accessibility = await new AxeBuilder({ page })
          .include("[data-testid='ecosystem-stage']")
          .analyze();
        expect(accessibility.violations).toEqual([]);
      }
    }
  });
}

test("duraklat düğmesi sahneyi donduruyor", async ({ page }) => {
  const stage = await openScene(page);
  await page.waitForTimeout(1500);
  const before = (await page.getByRole("button", { name: "PRODUCTION", exact: true }).boundingBox())!;
  await page.waitForTimeout(1500);
  const moving = (await page.getByRole("button", { name: "PRODUCTION", exact: true }).boundingBox())!;
  expect(Math.hypot(moving.x - before.x, moving.y - before.y)).toBeGreaterThan(1);

  await page.getByRole("button", { name: /duraklat/i }).click();
  await expect(stage).toHaveAttribute("data-motion", "paused");
  await page.waitForTimeout(600);
  const paused = (await page.getByRole("button", { name: "PRODUCTION", exact: true }).boundingBox())!;
  await page.waitForTimeout(1800);
  const still = (await page.getByRole("button", { name: "PRODUCTION", exact: true }).boundingBox())!;
  expect(Math.hypot(still.x - paused.x, still.y - paused.y)).toBeLessThan(1);
});

test("hareket azaltmada tek statik kare çiziliyor, video hiç indirilmiyor", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  const media: string[] = [];
  page.on("request", (request) => {
    if (/hibrid-stone.*\.(mp4|webm)/.test(request.url())) media.push(request.url());
  });
  const stage = await openScene(page, "tr", true);
  await page.waitForTimeout(1500);
  const first = await stage.screenshot();
  expect(await litFraction(first)).toBeGreaterThan(0.02);

  // Sahne donuk: iki kare arasında fark yok.
  await page.waitForTimeout(1500);
  const second = await stage.screenshot();
  expect(Buffer.compare(first, second)).toBe(0);

  // Yeniden boyutlandırmadan sonra da boş kalmıyor.
  await page.setViewportSize({ width: 900, height: 800 });
  await page.waitForTimeout(800);
  expect(await litFraction(await stage.screenshot())).toBeGreaterThan(0.03);

  expect(media).toEqual([]);
  await context.close();
});

test("medya görünür alana girmeden indirilmiyor", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/tr");
  await acceptCookies(page);
  await page.waitForTimeout(1200);
  expect(requests.some((url) => url.includes(CRYSTAL_MEDIA.interactive))).toBe(false);
  expect(requests.some((url) => url.includes("/images/site/solar/"))).toBe(false);

  await page.getByTestId("ecosystem-stage").scrollIntoViewIfNeeded();
  await expect
    .poll(() => requests.some((url) => url.includes("/images/site/solar/")), { timeout: 20_000 })
    .toBe(true);
});

test("sahne uzun süre çizmeye devam ediyor", async ({ page }) => {
  test.setTimeout(90_000);
  const stage = await openScene(page);
  await page.waitForTimeout(2000);
  const early = await litFraction(await stage.screenshot());
  await page.waitForTimeout(30_000);
  const late = await litFraction(await stage.screenshot());
  expect(late).toBeGreaterThan(0.03);
  // Sahne kararmamalı: geç kare erken kareyle aynı mertebede.
  expect(Math.abs(late - early)).toBeLessThan(0.06);
});

for (const width of [390, 768, 1440]) {
  test(`${width}px: sahne dolu, panel kırpılmıyor`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const stage = await openScene(page);
    await page.waitForTimeout(2200);
    expect(await litFraction(await stage.screenshot())).toBeGreaterThan(0.03);

    await page.getByRole("button", { name: "PRODUCTION", exact: true }).focus();
    await page.keyboard.press("Enter");
    const detail = page.locator("#ecosystem-detail");
    await expect(detail).toBeVisible();
    const panel = (await detail.boundingBox())!;
    const box = (await stage.boundingBox())!;
    expect(panel.x).toBeGreaterThanOrEqual(box.x - 1);
    expect(panel.x + panel.width).toBeLessThanOrEqual(box.x + box.width + 1);
    expect(panel.y + panel.height).toBeLessThanOrEqual(box.y + box.height + 1);
  });
}

test.describe("dokunmatik", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });

  test("dokunuş paneli açıyor, dikey kaydırma sayfayı kaydırmaya devam ediyor", async ({ page }) => {
    const stage = await openScene(page);
    await page.getByRole("button", { name: "DIGITAL", exact: true }).tap({ force: true });
    await expect(page.locator("#ecosystem-detail")).toBeVisible();
    await expect(page).toHaveURL(/\/tr$/);

    // Boş alanda dikey kaydırma sahneye takılmamalı.
    const box = (await stage.boundingBox())!;
    const before = await page.evaluate(() => window.scrollY);
    await page.touchscreen.tap(box.x + 20, box.y + box.height - 20);
    await page.mouse.move(box.x + 20, box.y + box.height - 30);
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(before);
  });
});
