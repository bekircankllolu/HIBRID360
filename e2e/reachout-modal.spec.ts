import { test, expect } from "@playwright/test";
import { acceptCookies } from "./utils";

/**
 * Sitedeki tek gerçek aria-modal="true" diyalog (ReachOut pop-up).
 * Klavye tuzağı denetimi: Tab/Shift+Tab diyalog içinde döner (arkadaki
 * sayfaya kaçmaz), Escape kapatır ve odak tetikleyici butona döner.
 */
test.describe("ReachOut pop-up — klavye erişilebilirliği", () => {
  test("Tab diyalog içinde döner, arkadaki sayfaya kaçmaz", async ({ page }) => {
    await page.goto("/tr");
    await acceptCookies(page);

    const trigger = page.getByRole("button", { name: "Bize ulaşın" });
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: "Merhaba." });
    await expect(dialog).toBeVisible();

    // Açılışta odak diyaloğun içinde (kapat butonu ilk odaklanabilir eleman).
    await expect(page.getByRole("button", { name: "Kapat" })).toBeFocused();

    // Diyalogdaki son odaklanabilir elemana kadar Tab'la, bir adım daha
    // Tab'a basınca ilk elemana dönmeli — arkadaki header/footer'a değil.
    const focusableCount = await dialog
      .locator(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled])',
      )
      .count();
    for (let i = 0; i < focusableCount; i++) {
      await page.keyboard.press("Tab");
    }
    const activeInsideDialog = await dialog.evaluate((el) =>
      el.contains(document.activeElement),
    );
    expect(activeInsideDialog).toBe(true);
  });

  test("Escape kapatır ve odağı tetikleyici butona döndürür", async ({ page }) => {
    await page.goto("/tr");
    await acceptCookies(page);

    const trigger = page.getByRole("button", { name: "Bize ulaşın" });
    await trigger.click();
    await expect(page.getByRole("dialog", { name: "Merhaba." })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Merhaba." })).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});
