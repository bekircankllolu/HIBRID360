import { test, expect } from "@playwright/test";
import { acceptCookies } from "./utils";

/**
 * Kapanış videosu (bisikletli adam / ay) scroll ile sarılır.
 *
 * 19 EYLÜL 2026 — SÖZLEŞME DEĞİŞTİ. Kullanıcı: *"Ana sayfadaki bisikletli
 * adam videosuna hâlâ takılıyorum. Sayfadan aşağı inerken tam adamın
 * bölümüne gelmemizi beklemeyelim; kaydırırken adamın da aynı anda
 * kaydığını görelim."*
 *
 * ESKİ model (sticky): ilerleme bölüm ekranın TEPESİNE YAPIŞTIĞI an
 * başlıyordu — `-rect.top / (yükseklik - ekran)`. Bölüm yaklaşırken video
 * 0. karede donuyor, ancak yapıştıktan sonra ilerliyordu; kullanıcının
 * "deneyim bölünüyor" dediği his buydu.
 *
 * YENİ model (pass): ilerleme bölüm ekrana GİRDİĞİ an başlar —
 *   progress = (innerHeight - rect.top) / offsetHeight
 * yani üst kenar ekranın altına değdiğinde 0, bölüm yukarıdan çıkarken 1.
 *
 * Bu test o formülü doğrudan ölçmüyor (o zaman kendi kendini doğrulardı);
 * gözlemlenebilir DAVRANIŞI ölçüyor: bölüm daha ekranın altındayken
 * kaydırma videoyu ilerletiyor mu, geri kaydırınca geri sarıyor mu.
 */
test("kapanış videosu bölüme varmadan ilerler ve geri kaydırınca geri sarar", async ({
  page,
}) => {
  await page.goto("/tr");
  await acceptCookies(page);

  const section = page.locator("section[data-scroll-scrub]");
  const video = section.locator("video");

  await expect(section).toBeVisible();

  /** İstenen ilerlemeyi veren scroll konumu (yeni formülün tersi). */
  const scrollForProgress = async (progress: number) =>
    page.evaluate((p) => {
      const element = document.querySelector<HTMLElement>("section[data-scroll-scrub]");
      if (!element) return;
      const top = element.offsetTop + p * element.offsetHeight - window.innerHeight;
      window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
    }, progress);

  await scrollForProgress(0);
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.duration))
    .toBeGreaterThan(0);

  const duration = await video.evaluate((element: HTMLVideoElement) => element.duration);

  // Bölüm henüz ekranın ALTINDA: video başında.
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime))
    .toBeLessThan(duration * 0.08);

  /*
   * ASIL İDDİA: bölüm ekranın tepesine YAPIŞMADAN önce video ilerlemiş
   * olmalı. İlerleme .45'te bölümün üst kenarı hâlâ ekranın içinde
   * (yükseklik 150svh olduğu için üst kenar ekranın altından yukarı
   * çıkmaya yeni başlamış olur) — eski modelde bu noktada video hâlâ
   * 0. karede olurdu.
   */
  await scrollForProgress(0.45);
  const sectionTopAtMid = await section.evaluate(
    (element) => element.getBoundingClientRect().top,
  );
  expect(sectionTopAtMid).toBeGreaterThan(0);
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime))
    .toBeGreaterThan(duration * 0.3);

  await scrollForProgress(0.85);
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime))
    .toBeGreaterThan(duration * 0.7);

  // Geri kaydırma geri sarar.
  await scrollForProgress(0.25);
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime))
    .toBeLessThan(duration * 0.4);
});
