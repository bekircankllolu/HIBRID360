import { test, expect } from "@playwright/test";

/**
 * Hidrasyon uyuşmazlığı nöbetçisi.
 *
 * Belirti: her sayfa açılışında konsola "A tree hydrated but some
 * attributes of the server rendered HTML didn't match the client
 * properties" düşüyordu. Kaynak, çerez rızası init script'inin <html>
 * üzerine sunucu çıktısında hiç bulunmayan bir `data-consent` özniteliği
 * yazmasıydı (bkz. ConsentInitScript).
 *
 * Bu suite iki katmandan oluşuyor, çünkü React'in üretim derlemesi
 * uyuşmazlığı konsola YAZMIYOR — yalnızca dev'de görünüyor. E2E üretim
 * sunucusuna karşı koştuğu için tek başına konsol dinlemek regresyonu
 * yakalamaya yetmez:
 *
 *   1. Sözleşme testi (deterministik): sunucudan gelen ham HTML'de
 *      `data-consent` özniteliği BULUNMALI. Düzeltmeden önce bu test
 *      düşerdi; öznitelik yalnızca istemcide vardı.
 *   2. Konsol testi: gerçek çalışma zamanı hatalarını (ve dev'de
 *      hidrasyon uyarısını) yakalar.
 */
const ROUTES = ["", "/who-we-are", "/contact", "/solutions"];

test.describe("Hidrasyon", () => {
  for (const route of ROUTES) {
    test(`sunucu HTML'i data-consent taşıyor — /tr${route}`, async ({
      request,
    }) => {
      const response = await request.get(`/tr${route}`);
      expect(response.ok()).toBe(true);
      const html = await response.text();

      // <html ...> açılış etiketi — öznitelik istemcide değil, burada olmalı.
      // Kapanış ">" belgenin ilki değil, <html'den SONRAKİ ilk olanı
      // (belgenin ilki doctype'ınki).
      const start = html.indexOf("<html");
      expect(start, "<html etiketi bulunamadı").toBeGreaterThan(-1);
      const openingTag = html.slice(start, html.indexOf(">", start) + 1);
      expect(openingTag).toContain('data-consent="pending"');
    });
  }

  test("rıza kaydı olan ziyaretçide bant hiç boyanmıyor ve konsol temiz", async ({
    page,
    context,
  }) => {
    await context.addInitScript(() => {
      window.localStorage.setItem(
        "hibrid360-consent",
        JSON.stringify({
          necessary: true,
          analytics: false,
          decidedAt: "2026-01-01T00:00:00.000Z",
        }),
      );
    });

    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/tr", { waitUntil: "networkidle" });

    // Bant DOM'da var ama CSS ile gizli — gecikmeli girip LCP'yi kendine
    // çekmesin diye işaretleme ilk HTML'de geliyor (bkz. CookieBanner).
    const banner = page.getByRole("dialog", { name: "Çerez tercihleri" });
    await expect(banner).toBeHidden();
    await expect(page.locator("html")).toHaveAttribute("data-consent", "set");

    expect(errors, errors.join("\n")).toEqual([]);
  });
});
