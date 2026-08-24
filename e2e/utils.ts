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
