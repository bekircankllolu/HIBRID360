import { test, expect } from "@playwright/test";

const CONSENT_KEY = "hibrid360-consent";

async function readConsent(page: import("@playwright/test").Page) {
  const raw = await page.evaluate(
    (key) => window.localStorage.getItem(key),
    CONSENT_KEY,
  );
  return raw ? JSON.parse(raw) : null;
}

test.describe("Çerez rızası", () => {
  test("kabul edince bant gizlenir, kalıcı olarak analytics=true kaydeder", async ({
    page,
  }) => {
    await page.goto("/tr");
    const banner = page.getByRole("dialog", { name: "Çerez tercihleri" });
    await expect(banner).toBeVisible();

    await page.getByRole("button", { name: "Tümünü kabul et" }).click();
    await expect(banner).toBeHidden();

    const consent = await readConsent(page);
    expect(consent?.analytics).toBe(true);

    // Yeniden yüklemede rıza kaydı hâlâ orada — bant tekrar çıkmaz.
    await page.reload();
    await expect(page.getByRole("dialog", { name: "Çerez tercihleri" })).toBeHidden();
  });

  test("reddet seçeneği analytics=false kaydeder", async ({ page }) => {
    await page.goto("/tr");
    await page
      .getByRole("button", { name: "Zorunlu olmayanları reddet" })
      .click();
    const consent = await readConsent(page);
    expect(consent?.analytics).toBe(false);
  });

  test("ayarlar panelinden analitik çerez açılıp kaydedilebilir", async ({
    page,
  }) => {
    await page.goto("/tr");
    await page.getByRole("button", { name: "Çerez ayarları" }).click();
    await page.getByLabel("Analitik çerezler").check();
    await page.getByRole("button", { name: "Tercihi kaydet" }).click();
    const consent = await readConsent(page);
    expect(consent?.analytics).toBe(true);
  });
});
