import { test, expect } from "@playwright/test";
import { acceptCookies } from "./utils";

const ITEM = 'li[class*="ClientLogoGrid_item"]';

/**
 * Friends müşteri ızgarası — kutucuklar ekrana girdikçe belirir.
 * Buradaki asıl güvence içeriğin KAYBOLMAMASI: beliriş animasyonu
 * kutucukları CSS'te opacity:0 ile başlattığı için, animasyonun
 * tetiklenmediği her durumda (hareket azaltma, IntersectionObserver
 * yok, JS yok) 70 müşteri adının yine de görünür olması gerekir.
 */
test.describe("Friends müşteri ızgarası", () => {
  test("kutucuklar ekrana girince belirir", async ({ page }) => {
    await page.goto("/tr/friends");
    await acceptCookies(page);

    const grid = page.locator('ul[class*="ClientLogoGrid_grid"]');
    const items = page.locator(ITEM);
    expect(await items.count()).toBeGreaterThan(50);

    // Sayfanın en üstündeyken ızgaranın alt sıraları henüz görünmemeli.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const lastOpacity = await items
      .last()
      .evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(lastOpacity)).toBe(0);

    // Izgaraya inince açılır.
    await grid.scrollIntoViewIfNeeded();
    await expect(items.first()).toHaveCSS("opacity", "1", { timeout: 3000 });
  });

  test("hareket azaltmada tüm kutucuklar anında görünür", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/tr/friends");
    await acceptCookies(page);

    const items = page.locator(ITEM);
    const count = await items.count();

    // Hiç scroll etmeden, sayfanın en altındaki kutucuk bile görünür olmalı.
    const opacities = await items.evaluateAll((els) =>
      els.map((el) => Number(getComputedStyle(el).opacity)),
    );
    expect(opacities).toHaveLength(count);
    // Teyit bekleyenler kasıtlı olarak 0.75; hiçbiri 0 olmamalı.
    expect(opacities.every((o) => o > 0)).toBe(true);
  });

  test("JS olmadan da bütün müşteri adları görünür kalır", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/tr/friends");

    const items = page.locator(ITEM);
    expect(await items.count()).toBeGreaterThan(50);
    // <noscript> gizlemeyi geri alır — hiçbir kutucuk saydam kalmaz.
    // (Teyit bekleyenler kasıtlı olarak 0.75, o ayrım JS'siz de korunur.)
    await expect(items.first()).toBeVisible();
    await expect(items.last()).toBeVisible();
    const opacities = await items.evaluateAll((els) =>
      els.map((el) => Number(getComputedStyle(el).opacity)),
    );
    expect(opacities.every((o) => o > 0)).toBe(true);

    await context.close();
  });
});
