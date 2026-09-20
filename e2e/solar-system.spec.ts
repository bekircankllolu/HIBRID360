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
 * 20 Eylül 2026: sahne Three.js'e taşındı (eşmerkezli halkalar, cilalı
 * küreler, yeni HIBRID 360° kristali, odakta HUD + cam kart, opt-in ses).
 * Gezegen dokuları (`/images/site/solar/`) artık yok; tembel yükleme nöbetçisi
 * kristal posteri/videosuna bakıyor. Yazılım GL'de (CI) ardıl işlem kurulmaz.
 *
 * Piksel kontrolleri MONA sahnesindeki kalıbı izliyor: canvas'tan 2B bağlam
 * okunamayacağı için ekran görüntüsü alınıp `sharp` ile ölçülüyor.
 */

const services = orbitStones.map((stone) => stone.label);

// Paylaşımlı 2 vCPU'lu CI koşucusunda yazılım WebGL her sayfa çağrısını
// yavaşlatıyor (yerelde ~10 sn süren testler orada 30-50 sn). Süre payı iki katı.
test.beforeEach(async ({}, testInfo) => {
  testInfo.setTimeout(testInfo.timeout * 2);
});

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
  // düşen bir gezegen tıklanamaz olurdu). TEK evaluate: yavaş CI koşucusunda
  // (yazılım WebGL) her Playwright çağrısı saniyeler sürüyor; sekiz ardışık
  // boundingBox testi 30 sn sınırına takılıyordu.
  const box = (await stage.boundingBox())!;
  const rects = await page.evaluate((labels) => {
    const root = document.querySelector("[data-testid='ecosystem-stage']")!;
    return labels.map((label) => {
      const el = [...root.querySelectorAll("button")].find((b) => b.getAttribute("aria-label") === label);
      const r = el?.getBoundingClientRect();
      return { label, found: Boolean(el), x: r?.left ?? 0, y: r?.top ?? 0, w: r?.width ?? 0, h: r?.height ?? 0 };
    });
  }, services);
  for (const target of rects) {
    expect(target.found, `${target.label} düğmesi DOM'da`).toBe(true);
    expect(target.x, target.label).toBeGreaterThanOrEqual(box.x - 4);
    expect(target.x + target.w, target.label).toBeLessThanOrEqual(box.x + box.width + 4);
    expect(target.y, target.label).toBeGreaterThanOrEqual(box.y - 4);
    expect(target.y + target.h, target.label).toBeLessThanOrEqual(box.y + box.height + 4);
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
  const asked = (needle: string) => requests.some((url) => url.includes(needle));
  expect(asked(CRYSTAL_MEDIA.interactive)).toBe(false);
  expect(asked(CRYSTAL_MEDIA.poster)).toBe(false);
  expect(asked("/audio/ecosystem/")).toBe(false);

  await page.getByTestId("ecosystem-stage").scrollIntoViewIfNeeded();
  // Görünür alana girince kristal posteri (doku) ve videosu isteniyor.
  await expect.poll(() => asked(CRYSTAL_MEDIA.poster), { timeout: 20_000 }).toBe(true);
  await expect.poll(() => asked(CRYSTAL_MEDIA.interactive), { timeout: 20_000 }).toBe(true);
  // Ses opt-in: ziyaretçi düğmeye basmadan hiçbir ses dosyası inmiyor.
  expect(asked("/audio/ecosystem/")).toBe(false);
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

    // Boş sahne alanında dikey kaydırma sahneye takılmamalı. Alt sayfa kart
    // dar ekranda sahnenin altını kaplıyor ve kendi içinde kayıyor (tasarım
    // gereği); bu yüzden kartın ÜSTÜNDEKİ boş alana dokunuyoruz.
    const box = (await stage.boundingBox())!;
    const before = await page.evaluate(() => window.scrollY);
    await page.touchscreen.tap(box.x + 20, box.y + 40);
    await page.mouse.move(box.x + 20, box.y + 50);
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(before);
  });
});

test("ses varsayılan kapalı; düğmeye basılınca dosyalar iniyor (otomatik ses yasak)", async ({ page }) => {
  const audioRequests: string[] = [];
  const audioOk: boolean[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/audio/ecosystem/")) audioRequests.push(request.url());
  });
  page.on("response", (response) => {
    if (response.url().includes("/audio/ecosystem/")) audioOk.push(response.ok());
  });
  const stage = await openScene(page);
  await page.waitForTimeout(1500);
  expect(audioRequests).toHaveLength(0);

  const off = stage.getByRole("button", { name: "Sesi aç", exact: true });
  await expect(off).toHaveAttribute("aria-pressed", "false");
  await off.click();
  await expect(stage.getByRole("button", { name: "Sesi kapat", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect.poll(() => audioRequests.length, { timeout: 15_000 }).toBeGreaterThanOrEqual(4);
  // Dosyalar gerçekten var: istek sayısı 404'lerle de tutardı.
  await expect.poll(() => audioOk.length, { timeout: 15_000 }).toBeGreaterThanOrEqual(4);
  expect(audioOk.every(Boolean)).toBe(true);

  await stage.getByRole("button", { name: "Sesi kapat", exact: true }).click();
  await expect(stage.getByRole("button", { name: "Sesi aç", exact: true })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

test("küre adı yalnız imleç/odak üstündeyken görünüyor (referansta küreler etiketsiz)", async ({ page }) => {
  await openScene(page);
  const label = page
    .getByRole("button", { name: "CLOUD TV", exact: true })
    .locator("[class*='dotLabel']");
  await expect(label).toHaveCSS("opacity", "0");
  await page.getByRole("button", { name: "CLOUD TV", exact: true }).hover({ force: true });
  await expect(label).toHaveCSS("opacity", "1");
});

test("odaktaki küre butonun tam üstünde ve HUD çiziliyor", async ({ page }) => {
  const stage = await openScene(page);
  await page.waitForTimeout(1500);
  const button = page.getByRole("button", { name: "DIGITAL", exact: true });
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(stage).toHaveAttribute("data-focus", "DIGITAL");

  // HUD (süs): N-### rozeti ve hedefleme halkası odakta beliriyor.
  await expect(page.locator("[class*='hudTag']")).toContainText("N-417");

  // Kamera oturunca butonun merkezi çevresinde DIGITAL'in fuşya küresi olmalı
  // (WebGL çizimi ile DOM izdüşümü aynı noktada mı — kayma en sinsi hata).
  const magentaNearButton = async () => {
    const box = (await stage.boundingBox())!;
    const target = (await button.boundingBox())!;
    const cx = target.x + target.width / 2 - box.x;
    const cy = target.y + target.height / 2 - box.y;
    const shot = await page.screenshot({ clip: box });
    const { data, info } = await sharp(shot).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    let count = 0;
    const r = 60;
    for (let y = Math.max(0, Math.round(cy - r)); y < Math.min(info.height, Math.round(cy + r)); y++) {
      for (let x = Math.max(0, Math.round(cx - r)); x < Math.min(info.width, Math.round(cx + r)); x++) {
        const i = (y * info.width + x) * 3;
        // Beyaz dolgu ışığı yeşili yükseltir: eşik GPU'dan bağımsız sağlam kalsın.
        if (data[i] > 150 && data[i + 2] > 150 && data[i + 1] < 160 && data[i] - data[i + 1] > 60) count++;
      }
    }
    return count;
  };
  await expect.poll(magentaNearButton, { timeout: 30_000, intervals: [1000] }).toBeGreaterThan(800);
});

test("sahne açıkken hareket-azaltma ayarı değişince sahne siyah kalmıyor", async ({ page }) => {
  // Regresyon: hook önce `false` döner, ayar sonradan değişince efekt yeniden
  // kurulur. Eski canvas'ın bağlamı kaybettirilmişti → kalıcı siyah kutu.
  const stage = await openScene(page);
  await page.waitForTimeout(1500);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(stage).toHaveAttribute("data-motion", "paused");
  await expect(stage).toHaveAttribute("data-scene", "webgl", { timeout: 30_000 });
  await page.waitForTimeout(2500);
  expect(await litFraction(await stage.screenshot())).toBeGreaterThan(0.04);
});

test("çizim katmanı sahne kutusunu aşıyor: başlığın arkasına ve alttaki bölümün içine taşıyor, yazılar önde", async ({ page }) => {
  await openScene(page);
  const m = await page.evaluate(() => {
    const section = document.querySelector("section[aria-labelledby='solar-system-title']")!;
    const canvas = section.querySelector("canvas")!;
    const stage = document.querySelector("[data-testid='ecosystem-stage']")!;
    const heading = section.querySelector("h2")!.parentElement!;
    const field = canvas.parentElement!;
    const reachOut = section.nextElementSibling as HTMLElement;
    const box = (e: Element) => e.getBoundingClientRect();
    return {
      canvasTop: box(canvas).top,
      canvasBottom: box(canvas).bottom,
      canvasHeight: box(canvas).height,
      sectionTop: box(section).top,
      sectionBottom: box(section).bottom,
      stageTop: box(stage).top,
      stageHeight: box(stage).height,
      reachOutBottom: box(reachOut).bottom,
      fieldZ: getComputedStyle(field).zIndex,
      headingZ: getComputedStyle(heading).zIndex,
      stageZ: getComputedStyle(stage).zIndex,
      reachOutPosition: getComputedStyle(reachOut).position,
      sectionOverflowY: getComputedStyle(section).overflowY,
      hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
    };
  });
  // Katman bölümün tepesinden başlar (başlığı da kapsar) ve sahne kutusundan büyük.
  expect(m.canvasTop).toBeLessThanOrEqual(m.sectionTop + 1);
  expect(m.canvasHeight).toBeGreaterThan(m.stageHeight * 1.3);
  // Alta doğru bölümün dışına, sonraki bölümün içine taşıyor — ama onu aşmıyor.
  expect(m.canvasBottom).toBeGreaterThan(m.sectionBottom + 100);
  expect(m.canvasBottom).toBeLessThan(m.reachOutBottom);
  // Dikey taşma kırpılmıyor; yatay taşma (kaydırma çubuğu) oluşmuyor.
  expect(m.sectionOverflowY).toBe("visible");
  expect(m.hasHorizontalScroll).toBe(false);
  // Katman yazıların ARKASINDA: başlık ve sahne kutusu daha yüksek, alt bölüm konumlu.
  expect(Number(m.fieldZ)).toBeLessThan(Number(m.headingZ));
  expect(Number(m.fieldZ)).toBeLessThan(Number(m.stageZ));
  expect(m.reachOutPosition).toBe("relative");
});
