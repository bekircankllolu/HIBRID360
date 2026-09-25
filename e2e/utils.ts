import type { Page } from "@playwright/test";

/**
 * Çerez bandını kabul eder — her testte fresh context olduğu için bant
 * her seferinde çıkar. Bant beklenmedik şekilde yoksa (gerçek regresyon)
 * sessizce geçmez: kısa bir görünürlük denemesi yapar, yoksa devam eder
 * (bandın kendi testi ayrı dosyada, burada engelleyici olmasın diye var).
 */
export async function acceptCookies(page: Page) {
  const button = page.getByRole("button", { name: "Tümünü kabul et" });
  const visible = await button.isVisible({ timeout: 3000 }).catch(() => false);
  if (visible) await button.click();
}

/**
 * `waitUntil: "networkidle"` yerine: `load` + ağın boşalması için KISA bir
 * bekleme. Ana sayfa showreel'i (61 sn, 43 MB) oynarken tarayıcı tek bir uzun
 * akış isteğini açık tutar; H.264 çalabilen tarayıcıda "ağ boşaldı" anı hiç
 * gelmez ve test zaman aşımına düşerdi (CI'daki Chromium H.264 çalamadığı için
 * orada görünmüyordu). Boşalma gelmezse test devam eder.
 */
export async function gotoSettled(page: Page, url: string) {
  const response = await page.goto(url, { waitUntil: "load" });
  await page.waitForLoadState("networkidle", { timeout: 4000 }).catch(() => undefined);
  return response;
}
