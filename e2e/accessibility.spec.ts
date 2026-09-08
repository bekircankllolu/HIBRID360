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
/**
 * 29 Ağustos 2026 revizyonu: liste canonical rotalara getirildi. Eskiden
 * `/friends`, `/culture/who-we-are`, `/culture/what-we-believe`,
 * `/culture/partners` ve `/what-we-do/photography` buradaydı — hepsi
 * artık 308 ile yönlendiriliyor ve `page.goto` yönlendirmeyi sessizce
 * takip ettiği için bu satırlar hedef sayfayı iki kez tarıyordu.
 * Yönlendirmelerin kendisi e2e/canonical-routes.spec.ts'te doğrulanıyor.
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
  "/what-we-do/post-production",
  "/what-we-do/production",
  "/what-we-do/service-production",
  "/who-we-are",
  "/what-we-believe",
  "/solutions",
  "/clients",
  "/partners",
  "/culture",
  "/culture/directors",
  "/culture/sustainability",
  "/think-and-thank",
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
        // Ucuncu taraf gomulerin ic DOM'u kapsam disi. @axe-core/playwright
        // her frame'e axe'i ayri ayri enjekte eder (runPartialRecursive), bu
        // yuzden YouTube oynaticisinin kendi markup'i bizim ihlalimiz gibi
        // raporlaniyordu: /think-and-thank'te aria-allowed-attr,
        // aria-prohibited-attr ve button-name — ucu de YouTube'un player
        // DOM'unda, bizim duzeltemeyecegimiz yerde. axe-core'un kendi
        // `iframes: false` secenegi bu akista ise yaramiyor (AxeBuilder
        // frame'leri Playwright API'siyle kendi geziyor), context exclude
        // gerekiyor.
        //
        // Bunun bedeli: iframe ETIKETININ kendisi de taramadan cikar, yani
        // frame-title artik burada kontrol edilmez. Telafisi asagidaki
        // "gomulu iframe'lerin erisilebilir adi var" testi — kaybi kapatmak
        // icin eklendi, silinmemeli.
        .exclude("iframe")
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

/**
 * frame-title telafisi: yukaridaki taramada `.exclude("iframe")` oldugu icin
 * axe artik iframe etiketlerini gormuyor. Gomulu oynaticinin ICI bizim
 * sorumlulugumuz degil ama ETIKETIN erisilebilir adi bizim — ekran okuyucu
 * kullanicisi "iframe" diye adsiz bir bolgeye dusmemeli (WCAG 2.4.1 / 4.1.2).
 */
const EMBED_ROUTES = ["/think-and-thank", "/contact"];
for (const locale of ["tr", "en"] as const) {
  for (const route of EMBED_ROUTES) {
    const url = `/${locale}${route}`;
    test(`gomulu iframe'lerin erisilebilir adi var — ${url}`, async ({ page }) => {
      await page.goto(url, { waitUntil: "networkidle" });

      const frames = page.locator("iframe");
      const count = await frames.count();

      for (let i = 0; i < count; i += 1) {
        const frame = frames.nth(i);
        const title = (await frame.getAttribute("title")) ?? "";
        const ariaLabel = (await frame.getAttribute("aria-label")) ?? "";
        const src = (await frame.getAttribute("src")) ?? "(src yok)";

        expect(
          title.trim() || ariaLabel.trim(),
          `${url} icindeki iframe'in title/aria-label'i yok: ${src}`,
        ).not.toBe("");
      }
    });
  }
}
