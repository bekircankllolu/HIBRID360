import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * WCAG AA denetimi — CLAUDE.md "WCAG AA kontrast kontrolü yayın öncesi
 * tüm sayfalarda yapılır" kuralı burada otomatikleştirildi. Site
 * genelindeki tüm rotalar (tr+en) axe-core ile taranır; yalnızca
 * kontrast değil, WCAG2A/2AA'nın tamamı (etiket, landmark, isim vb.)
 * kontrol edilir — ama başarısızlık mesajında hangi kural olduğu görünür.
 *
 * Bant açık haldeyken taranır (ilk ziyaretçinin gerçekten gördüğü durum).
 *
 * reducedMotion: 'reduce' emüle edilir — WCAG 1.4.3 sabit (steady-state)
 * sunuma bakar, geçiş animasyonunun ortasındaki geçici opaklığa değil.
 * Doğrulandı: RotatingSlogans'ın 600ms'lik giriş animasyonu ortasında
 * tarama yapılınca axe yanlış pozitif "color-contrast" veriyordu (metin
 * o an gerçekten opacity 0→1 arası); animasyon bitince veya
 * reduced-motion'da (CLAUDE.md zaten zorunlu kılıyor) sorun yok. Bu ayrıca
 * reduced-motion'daki statik yolun da erişilebilir olduğunu doğruluyor.
 */
const ROUTES = [
  "",
  "/work",
  "/what-we-do",
  "/what-we-do/ai-creative-production",
  "/what-we-do/cloud-tv",
  "/what-we-do/creative",
  "/what-we-do/digital",
  "/what-we-do/event-management",
  "/what-we-do/how-we-work",
  "/what-we-do/live-broadcast",
  "/what-we-do/photography",
  "/what-we-do/post-production",
  "/what-we-do/production",
  "/what-we-do/service-production",
  "/culture",
  "/culture/directors",
  "/culture/partners",
  "/culture/sustainability",
  "/culture/what-we-believe",
  "/culture/who-we-are",
  "/friends",
  "/insights",
  "/contact",
  "/brief",
  "/privacy",
  "/cookie-policy",
  "/kvkk",
  "/terms",
  "/ai-policy",
  "/accessibility",
];

for (const locale of ["tr", "en"] as const) {
  for (const route of ROUTES) {
    const url = `/${locale}${route}`;
    test(`WCAG AA — ${url}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(url, { waitUntil: "networkidle" });

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const summary = results.violations.map(
        (v) =>
          `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} eleman)\n` +
          v.nodes
            .slice(0, 3)
            .map((n) => `  → ${n.target.join(" ")}`)
            .join("\n"),
      );

      expect(summary, summary.join("\n\n")).toEqual([]);
    });
  }
}
