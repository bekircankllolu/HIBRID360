import { test, expect } from "@playwright/test";

/**
 * Service Chapter — Creative sözleşmesi (DECISIONS #31–#39,
 * docs/design/SERVICE_CHAPTER_SYSTEM.md).
 *
 * - Metin brief/deck'ten (CRE-01..04); `97f42fa`'nın kayıtsız metinleri
 *   ve stok ampul görseli geri gelmesin.
 * - Tek birincil eylem global CtaBand'de; sayfa kendi /contact linkini basmaz.
 * - Sayfa bir sonraki dereceye (Production) bağlanır.
 *
 * İnteraktif seçim çerçevesi (DECISIONS #38) beşinci geri bildirim
 * turunda kaldırıldı (DECISIONS #47) — o teste artık gerek yok.
 *
 * Son hizmet-sayfası turunda hizmet dizinindeki görsel/parallax alanı
 * kaldırıldı. MONA canvas'ı hero'nun altına uzuyor, MONA arada bir
 * nilüfere dönüşüyor, MonaDrift noktaları footer'a taşmıyor.
 *
 * Video: 13 Eylül 2026 ikinci geri bildirim turuyla S2 filmi kaldırıldı
 * (DECISIONS #39, "belki her sayfaya video eklemeyiz"). Film testleri
 * aşağıda `test.skip` — video döndüğünde tek satır değişiklikle açılır.
 *
 * Yatay taşma ve axe denetimi mevcut nöbetçilerde (canonical-routes,
 * accessibility) — burada tekrar edilmiyor.
 */

const PATH = "/what-we-do/creative";

/** CRE-03 — EN ve TR aynı (marka dili). */
const CRE_03 = [
  "BRAND CONSULTANCY",
  "CORPORATE IDENTITY",
  "MARKETING PLAN AND STRATEGY",
  "CONCEPT DEVELOPMENT",
  "CONTENT GENERATION",
  "COMMERCIALS",
  "PACKAGING",
  "TV",
  "PRESS",
  "RADIO CAMPAIGNS",
];

for (const locale of ["tr", "en"] as const) {
  test.describe(`Creative (${locale})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/${locale}${PATH}`);
    });

    test("brief/deck metni: slogan başlık, 10 hizmet, kaldırılan metinler yok", async ({
      page,
    }) => {
      const h1 = page.getByRole("heading", { level: 1 });
      // Karıştırma efekti sırasında görünen metin geçici olarak farklı olsa
      // da erişilebilir ad `aria-label` ile baştan kilitli (DECISIONS #49).
      await expect(h1).toHaveAccessibleName("CREATIVITY WITHOUT LIMITS");
      // Slogan TR sayfada da İngilizce: büyük harf dönüşümü "İ" üretmesin.
      await expect(h1).toHaveAttribute("lang", "en");

      const items = page.locator('article ol[role="list"] > li');
      await expect(items).toHaveCount(CRE_03.length);
      await expect(items.locator('span[lang="en"]')).toHaveText(CRE_03);

      await expect(page.getByText("PURE. SIMPLE. POWERFUL.")).toHaveCount(0);
      await expect(page.getByText(/WE EXPAND IT/i)).toHaveCount(0);
      await expect(page.getByText("Hibrid 360 is building that future today.")).toHaveCount(0);
      await expect(page.locator('img[src*="services/creative.webp"]')).toHaveCount(0);
    });

    test("tek birincil eylem: /contact yalnızca global CtaBand'de", async ({ page }) => {
      const contact = `a[href="/${locale}/contact"]`;
      await expect(page.locator(`article[data-chapter="creative"] ${contact}`)).toHaveCount(0);
      await expect(page.locator(`main ${contact}`).first()).toBeVisible();
    });

    test("CRE-02 bant sloganı iki dilde de İngilizce ve lang=en", async ({ page }) => {
      const slogan = page.getByRole("heading", {
        level: 2,
        name: "Your Brand’s DNA is the Ultimate AI Differentiator.",
      });
      await expect(slogan).toBeVisible();
      await expect(slogan).toHaveAttribute("lang", "en");
    });

    test("manifesto iki bağımsız scroll sahnesi olarak akar", async ({ page }) => {
      await expect(page.locator("[data-manifesto-scene]")).toHaveCount(2);
    });

    test("hizmet dizini görsel, parallax veya AI etiketi üretmez", async ({ page }) => {
      const services = page.locator("article section").filter({ has: page.locator('ol[role="list"]') });
      await expect(services).toHaveCount(1);
      await expect(services.locator('ol[role="list"] > li')).toHaveCount(CRE_03.length);
      await expect(services.locator("figure, img, figcaption")).toHaveCount(0);
      await expect(services.locator("[data-visual]")).toHaveCount(0);
    });

    test("geçici galeri sahte proje göstermeden dört karelik contact sheet sunar", async ({ page }) => {
      await expect(page.locator("[data-archive-frame]")).toHaveCount(4);
      await expect(page.getByRole("status")).toContainText(
        locale === "tr" ? "Kampanya galerisi hazırlanıyor." : "The campaign gallery is on the way.",
      );
    });

    test.skip("her film AI etiketini kendi figcaption'ında taşır", async ({ page }) => {
      const label = locale === "tr" ? "AI ile üretilmiş temsili görseldir" : "AI-generated representative visual";
      const videos = page.locator("article video");
      const count = await videos.count();
      expect(count).toBeGreaterThan(0);
      for (let index = 0; index < count; index += 1) {
        await expect(videos.nth(index).locator("xpath=ancestor::figure[1]/figcaption")).toHaveText(label);
      }
    });

    test("sayfa bir sonraki dereceye, Production'a bağlanır — satırın tamamı tıklanır", async ({
      page,
    }) => {
      const next = page.getByRole("navigation", { name: locale === "tr" ? "Sıradaki" : "Next" });
      await expect(next.getByRole("link", { name: "Production" })).toHaveAttribute(
        "href",
        `/${locale}/what-we-do/production`,
      );

      // Açıklama satırının üstüne gelip tıklamak da gider (hover'da bile —
      // transform bağlantıya verilirse tıklama alanı küçülüyordu). Satırı
      // kaplayan bağlantı katmanı açıklamayı "örttüğü" için locator
      // eylemleri değil, gerçek fare koordinatı kullanılıyor.
      const blurb = next.locator("p").last();
      await blurb.scrollIntoViewIfNeeded();
      const box = await blurb.boundingBox();
      expect(box).not.toBeNull();
      const x = box!.x + box!.width / 2;
      const y = box!.y + box!.height / 2;
      await page.mouse.move(x, y);
      await page.waitForTimeout(450);
      await page.mouse.click(x, y);
      await expect(page).toHaveURL(new RegExp(`/${locale}/what-we-do/production$`));
    });
  });
}

test("320px: başlık, hizmetler ve sıradaki servis ekranın içinde kalır", async ({ page }) => {
  // `.chapter { overflow-x: clip }` iç taşmayı genel yatay taşma nöbetçisinden
  // gizler; kutular burada tek tek ölçülüyor. Hareket azaltmada ölçülür:
  // başlığın giriş kayması bitmiş, final yerleşim.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(`/tr${PATH}`);
  await expect(page.locator("[data-dots]")).toHaveAttribute("data-dots", "none");

  const boxes = [
    page.getByRole("heading", { level: 1 }),
    ...(await page.locator('article ol[role="list"] > li').all()),
    page.getByRole("navigation", { name: "Sıradaki" }).getByRole("link"),
  ];
  for (const box of boxes) {
    const rect = await box.boundingBox();
    expect(rect).not.toBeNull();
    expect(rect!.x).toBeGreaterThanOrEqual(0);
    expect(rect!.x + rect!.width).toBeLessThanOrEqual(320);
  }
});

test.skip("filmler görünür alana gelmeden yüklenmez, görünürken oynar, duraklatılabilir", async ({
  page,
}) => {
  const mediaRequests: string[] = [];
  page.on("request", (request) => {
    if (/\.(webm|mp4)(\?|$)/.test(request.url())) mediaRequests.push(request.url());
  });

  await page.goto(`/en${PATH}`, { waitUntil: "networkidle" });
  expect(mediaRequests).toEqual([]);

  const videos = page.locator("article video");
  const count = await videos.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index += 1) {
    await expect(videos.nth(index)).toHaveAttribute("preload", "none");
    await expect(videos.nth(index)).not.toHaveAttribute("autoplay", /.*/);
  }

  const film = videos.first();
  await film.scrollIntoViewIfNeeded();
  await expect(film).toHaveAttribute("data-playback", "playing");

  await page.getByRole("button", { name: "Pause film" }).first().click();
  await expect(film).toHaveAttribute("data-playback", "paused");
});

test("MONA hero'nun altına taşıyor, düz çizgiyle kesilmiyor; noktalar footer'a girmiyor", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 827 });
  await page.goto(`/en${PATH}`);
  const shard = page.locator("[data-dots]");
  await expect(shard).toHaveAttribute("data-dots", "webgl");

  const { hero, canvas, clip } = await page.evaluate(() => {
    const root = document.querySelector("[data-dots]")!;
    const box = (element: Element) => element.getBoundingClientRect().toJSON() as DOMRect;
    return {
      hero: box(root.closest("header")!),
      canvas: box(root.querySelector("canvas")!),
      clip: getComputedStyle(document.querySelector("article[data-chapter]")!).overflowY,
    };
  });
  expect(canvas.top).toBeCloseTo(hero.top, 0);
  expect(canvas.bottom).toBeGreaterThan(hero.bottom + hero.height * 0.5);
  // MonaDrift'in ekran boyu canvas'ı makalenin dışına (CtaBand, Footer) çizmesin.
  expect(clip).toBe("clip");
});

test("MONA arada bir nilüfere dönüşür ve geri döner", async ({ page }) => {
  test.slow();
  await page.setViewportSize({ width: 1440, height: 827 });
  await page.goto(`/en${PATH}`);
  const shard = page.locator("[data-dots]");
  await expect(shard).toHaveAttribute("data-dots", "webgl");
  // İlk çiçek sahne başladıktan 12–15 sn sonra, 2,6 sn'de açılır.
  await expect(shard).toHaveAttribute("data-lotus", "open", { timeout: 30_000 });
  // WebGL/rAF headless tarayıcıda gerçek zamandan daha yavaş akabilir;
  // açık kalma + kapanma programını tamamlaması için güvenli pay.
  await expect(shard).toHaveAttribute("data-lotus", "closed", { timeout: 25_000 });
});

test("başlık karıştırma efekti: normal harekette çözülüp yerleşir, hareket azaltmada hiç karışmaz", async ({
  page,
}) => {
  const flat = (text: string) => text.replace(/\s+/g, " ");
  const titleText = () => page.getByRole("heading", { level: 1 }).innerText();

  // Hareket azaltmada efekt hiç tetiklenmiyor (useScrambleReveal `active=false`):
  // metin ilk kareden itibaren düz ve süre boyunca sabit.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/what-we-do/creative", { waitUntil: "commit" });
  expect(flat(await titleText())).toBe("CREATIVITY WITHOUT LIMITS");
  await page.waitForTimeout(500);
  expect(flat(await titleText())).toBe("CREATIVITY WITHOUT LIMITS");

  // Normal hareket: gecikme + süre kesin geçtikten sonra tam metne yerleşir
  // ve orada kalır (mid-flight karışık karakterler ayrı unit testte, bkz.
  // src/hooks/useScrambleReveal.test.tsx — burada yalnız son durumu doğrula).
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/en/what-we-do/creative", { waitUntil: "commit" });
  await page.waitForTimeout(2000);
  expect(flat(await titleText())).toBe("CREATIVITY WITHOUT LIMITS");
  await page.waitForTimeout(500);
  expect(flat(await titleText())).toBe("CREATIVITY WITHOUT LIMITS");
});

test("hareket azaltma: sahneler statik", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`/en${PATH}`, { waitUntil: "networkidle" });

  const motions = await page
    .locator("article [data-motion]")
    .evaluateAll((elements) => elements.map((element) => element.getAttribute("data-motion")));
  expect(motions.length).toBeGreaterThan(0);
  expect(motions.every((motion) => motion === "static")).toBe(true);
});

test.skip("hareket azaltma: filmler kendiliğinden oynamaz", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`/en${PATH}`, { waitUntil: "networkidle" });

  const film = page.locator("article video").first();
  await film.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  expect(await film.evaluate((video) => (video as HTMLVideoElement).paused)).toBe(true);
  await expect(page.getByRole("button", { name: "Play film" }).first()).toBeVisible();
});
