import { expect, test } from "@playwright/test";
import { acceptCookies } from "./utils";

/**
 * Works sayfasının kapanışa yakın bandı — ekip fotoğrafı.
 *
 * DOSYA ADI ESKİ: burası önce dönen bir parçacık küresi videosu, sonra
 * parçacıkların "HIBRID 360" yazdığı bir sahne taşıyordu ve bu spec onu
 * doğruluyordu. 20 Eylül 2026'da kullanıcı: *"partiküllerden oluşan
 * hibrit yazısını da kaldırabiliriz, buraya güzel bir görsel koyalım —
 * takım çalışmasını anlatan siyah beyaz, doğal ve samimi bir lifestyle
 * görsel."* Dosya adı `work-team-band.spec.ts` olmalı; yeniden
 * adlandırma silme onayı bekliyor.
 */

const BAND = '[class*="TeamBand_band"]';

test("bant parçacık sahnesi değil, ekip fotoğrafı taşıyor", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tr/work");
  await acceptCookies(page);

  const band = page.locator(BAND);
  await expect(band).toHaveCount(1);

  // Kaldırılan sahneler geri gelmemeli.
  await expect(band.locator("canvas")).toHaveCount(0);
  await expect(band.locator("video")).toHaveCount(0);
  await expect(page.locator('[class*="BrandIdent"]')).toHaveCount(0);

  const image = band.locator("img");
  await expect(image).toHaveCount(1);
  await expect(image).toHaveAttribute("src", /team-band/);
  await expect(image).toHaveAttribute("loading", "lazy");

  // Alt metin görseli betimliyor, boş geçmiyor.
  const alt = await image.getAttribute("alt");
  expect((alt ?? "").length).toBeGreaterThan(20);

  // AI açıklaması: bu gerçek Hibrid 360 ekibi değil.
  await expect(band.getByText("AI ile üretilmiş temsili görsel")).toBeAttached();
});

test("bant gerçekten çözülüyor ve oranı sabit", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tr/work");
  await acceptCookies(page);

  const band = page.locator(BAND);
  await band.scrollIntoViewIfNeeded();
  const image = band.locator("img");

  // Kırık görsel nöbetçisi: tarayıcı gerçekten çözebilmeli.
  await expect
    .poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth), {
      timeout: 15_000,
    })
    .toBeGreaterThan(100);

  // Oran görselin kendi oranı → CLS 0.
  const box = (await band.boundingBox())!;
  expect(box.width / box.height).toBeCloseTo(2400 / 1050, 1);
});

test("en sürümünde alt metin İngilizce", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/work");
  await acceptCookies(page);

  const alt = await page.locator(`${BAND} img`).getAttribute("alt");
  expect(alt).toMatch(/design studio/i);
});
