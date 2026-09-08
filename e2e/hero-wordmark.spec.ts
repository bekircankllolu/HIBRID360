import { test, expect } from "@playwright/test";

/**
 * Hero wordmark iki katmanlidir: ilk boyamada Arial Black ile cizilen
 * yedek metin, ustune de marka fontunun maskesiyle calisan WebGL canvas.
 *
 * WebGL devreye girdiginde yedek GIZLENMELI. Gizlenmezse iki farkli font
 * ust uste binip cift kontur / kaymis golge olusturuyor -- 8 Eylul 2026
 * regresyonu (0c33610 yedegi PNG'den metne cevirirken .fallbackHidden
 * mantigi dusmustu). Sahne etkilesimle acildigi icin bozukluk ancak fare
 * hareket ettikten sonra gorunuyordu; bu test o anı yakalar.
 */
test.describe("Hero wordmark", () => {
  test("WebGL devreye girince yedek metin gizlenir", async ({ page }) => {
    await page.goto("/tr", { waitUntil: "networkidle" });

    const fallback = page.getByRole("img", { name: "HIBRID", exact: true });

    // Ilk boyamada yedek gorunur olmali (LCP ogesi).
    await expect(fallback).toHaveCSS("opacity", "1");

    // Sahne yalnizca gercek etkilesimle aciliyor.
    await page.mouse.move(700, 500);

    // Maske hazir olunca yedek cekilmeli -- ustuste binme olmamali.
    await expect(fallback).toHaveCSS("opacity", "0", { timeout: 15000 });
  });
});
