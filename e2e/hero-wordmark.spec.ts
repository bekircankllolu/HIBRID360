import { test, expect } from "@playwright/test";

/**
 * Hero wordmark iki katmanlidir: ilk boyamada Arial Black ile cizilen
 * yedek metin, ustune de marka fontunun maskesiyle calisan WebGL canvas
 * (shader'da hash grain -- dokulu marka gorunumu).
 *
 * Musteri karari (8 Eylul 2026): ziyaretci sayfayi actiginda DOKULU hali
 * gormeli. Once duz fuksya yedegin durup imlec oynayinca dokulu hale
 * gecmesi kabul edilmedi; sahne ilk boyamanin hemen ardindan acilir.
 *
 * Yedek, WebGL devreye girdiginde GIZLENMELI: yedek Arial Black, maske
 * ise marka fontu -- glif sekilleri ortusmedigi icin ust uste binerlerse
 * kaymis cift kontur olusuyor (8 Eylul regresyonu).
 */
test.describe("Hero wordmark", () => {
  test("sayfa acilir acilmaz dokulu sahne devreye girer, yedek gizlenir", async ({
    page,
  }) => {
    await page.goto("/tr", { waitUntil: "networkidle" });

    const fallback = page.getByRole("img", { name: "HIBRID", exact: true });

    // HICBIR etkilesim olmadan: sahne acilmis, yedek cekilmis olmali.
    await expect(fallback).toHaveCSS("opacity", "0", { timeout: 10000 });
    await expect(page.locator("canvas").first()).toBeVisible();
  });

  test("hareket azaltmada sahne kurulmaz, yedek gorunur kalir", async ({
    page,
  }) => {
    // CLAUDE.md: prefers-reduced-motion destegi zorunlu.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/tr", { waitUntil: "networkidle" });

    const fallback = page.getByRole("img", { name: "HIBRID", exact: true });
    await expect(fallback).toHaveCSS("opacity", "1");

    // Imlec oynasa bile sahne acilmamali.
    await page.mouse.move(700, 500);
    await page.waitForTimeout(1000);
    await expect(fallback).toHaveCSS("opacity", "1");
  });
});
