import { expect, test } from "@playwright/test";
import { acceptCookies } from "./utils";

/**
 * Works hero'su — ekip filmi.
 *
 * DOSYA ADI ESKİ: bu spec bir zamanlar hero'daki etkileşimli nöron ağını
 * (`TeamworkField`) doğruluyordu. 20 Eylül 2026'da kullanıcı o sahneyi
 * kaldırtıp yerine gerçek bir set videosu istedi; testler o yüzden
 * tersine döndü. Dosya adı `work-hero.spec.ts` olmalı — yeniden
 * adlandırma silme onayı beklediği için şimdilik burada duruyor.
 *
 * Kullanıcı: *"'The Art of Teamwork' yazısının arkasındaki nöron
 * görselini değiştirelim, buraya takım çalışmasını anlatan özgün bir
 * video koyabilirsin."* Üç yön sunuldu, GERÇEK SET seçildi.
 */

test("hero'da nöron ağı yok, ekip filmi var", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tr/work");
  await acceptCookies(page);

  const hero = page.locator("header").filter({ hasText: "THE ART OF TEAMWORK" });
  await expect(hero).toBeVisible();

  // Kaldırılan parçacık sahnesi geri gelmemeli.
  await expect(hero.locator("canvas")).toHaveCount(0);

  const film = hero.locator("video");
  await expect(film).toHaveCount(1);
  await expect(film).toHaveAttribute("preload", "none");
  await expect(film).toHaveJSProperty("muted", true);
  // Poster kare şart: video ertelendiği için ilk boyanan o.
  await expect(film).toHaveAttribute("poster", /hero-crew-poster/);

  // Görüntü gerçek bir Hibrid 360 çekimi değil; sayfada öyle yazıyor.
  await expect(hero.getByText("AI ile üretilmiş temsili görsel")).toBeVisible();
});

test("film sayfa oturmadan indirilmiyor, sonra oynuyor", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tr/work", { waitUntil: "domcontentloaded" });
  // `domcontentloaded` anında dosya kritik yolda OLMAMALI: ana sayfada
  // ölçüldü, kadraja konan video LCP öğesi oluyordu.
  expect(requests.some((url) => url.includes("work-hero-crew"))).toBe(false);

  await acceptCookies(page);
  await expect
    .poll(() => requests.some((url) => url.includes("work-hero-crew")), { timeout: 15_000 })
    .toBe(true);

  const film = page.locator("header video");
  await expect.poll(() => film.evaluate((v: HTMLVideoElement) => v.paused), {
    timeout: 15_000,
  }).toBe(false);
});

test("hareket azaltmada film hiç indirilmiyor, poster duruyor", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tr/work");
  await acceptCookies(page);
  await page.waitForTimeout(2500);

  expect(requests.filter((url) => url.includes("work-hero-crew"))).toEqual([]);
  const film = page.locator("header video");
  await expect(film).toHaveCount(1);
  await expect(film).toHaveJSProperty("paused", true);
  // Poster yine de yüklenmiş olmalı — kadraj boş siyah kalmıyor.
  await expect
    .poll(() => requests.some((url) => url.includes("hero-crew-poster")))
    .toBe(true);
});
