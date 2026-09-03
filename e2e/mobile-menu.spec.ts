import { test, expect } from "@playwright/test";
import { acceptCookies } from "./utils";

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

test.describe("Mobil menü (390px)", () => {
  test("header taşmaz; hamburger tam ekran panel açar, Escape kapatır", async ({
    page,
  }) => {
    await page.goto("/tr");
    await acceptCookies(page);

    const inner = page.locator('[class*="Header_inner"]');
    const overflowing = await inner.evaluate(
      (el) => el.scrollWidth > el.clientWidth + 1,
    );
    expect(overflowing).toBe(false);

    const toggle = page.getByRole("button", { name: "Menüyü aç" });
    const nav = page.locator("#main-navigation");
    await expect(nav).toBeHidden();

    await toggle.click();
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("link", { name: "Kültür" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Dil" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(nav).toBeHidden();
  });

  test("panelde bir bağlantıya dokunmak sayfayı değiştirir", async ({ page }) => {
    await page.goto("/tr");
    await acceptCookies(page);

    await page.getByRole("button", { name: "Menüyü aç" }).click();
    const nav = page.locator("#main-navigation");
    await nav.getByRole("link", { name: "İletişim" }).click();

    await expect(page).toHaveURL(/\/tr\/contact$/);
  });
});
