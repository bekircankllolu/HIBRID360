import { test, expect, type Page } from "@playwright/test";
import { gotoSettled } from "./utils";
import { CANONICAL_ROUTES, LOCALES, OVERFLOW_ROUTES } from "./routes";

/**
 * Canonical rotalar ve eski yol yönlendirmeleri.
 *
 * Neden ayrı bir dosya: sayfa testleri eskiden eski URL'lerin üzerinden
 * yürüyordu (`/friends`, `/culture/who-we-are`, `/what-we-do/photography`).
 * Bunlar artık 308 ile yönlendiriliyor ve `page.goto` yönlendirmeyi
 * sessizce takip ediyor — yani test geçiyordu ama **hedef sayfayı**
 * ölçüyordu, yönlendirmenin kendisini hiç doğrulamıyordu. Ayrım net:
 *
 *   - Sayfa davranışı  → canonical rotalar üzerinden
 *   - Yönlendirme      → status + Location başlığı üzerinden, takip
 *                        edilmeden
 *
 * Rota listeleri (CANONICAL_ROUTES, OVERFLOW_ROUTES, LOCALES) Faz 2 B0'dan
 * beri `e2e/routes.json`'da — tasarım dili bekçisi ve denetim aracı
 * (`scripts/design-audit.mjs`) aynı listeyi okuyor.
 *
 * Yatay taşma kapsamı (OVERFLOW_ROUTES) — canonical üst sayfalar + What We
 * Do alt sayfalarının TAMAMI + görsel yoğun Culture rotaları + 6 yasal
 * sayfa + 404.
 *
 * 30 Ağustos 2026 QA denetimi: taşma testi yalnızca üst sayfaları
 * kapsadığı için hizmet detay rotalarındaki taşmalar (390px'te
 * /what-we-do/event-management +127px'e kadar) hiç yakalanmıyordu. Kök
 * neden ortak bir CSS kalıbıydı — hero başlığının clamp tabanı — ve o
 * kalıp yalnızca test edilmeyen sayfalarda yaşıyordu. Aynı ders Faz 2
 * B0'da yasal sayfalara ve 404'e uygulandı: B2 ve B5 bu sayfaların
 * başlıklarını büyük display kademesine taşıyacak, taşma riski ilk orada
 * doğar — nöbetçi o değişiklikten ÖNCE yerinde olmalı.
 */

/** next.config.mjs → LEGACY_ROUTE_MAP ile birebir aynı olmalı. */
const LEGACY_REDIRECTS = [
  ["/friends", "/clients"],
  ["/culture/who-we-are", "/who-we-are"],
  ["/culture/what-we-believe", "/what-we-believe"],
  ["/culture/partners", "/partners"],
  ["/insights", "/think-and-thank"],
  ["/what-we-do/photography", "/what-we-do"],
] as const;

/** Rızayı önceden yazar: bant testlerin ölçtüğü düzeni etkilemesin. */
async function seedConsent(page: Page) {
  await page.context().addInitScript(() => {
    window.localStorage.setItem(
      "hibrid360-consent",
      JSON.stringify({
        necessary: true,
        analytics: false,
        decidedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
  });
}

test.describe("Canonical rotalar", () => {
  for (const locale of LOCALES) {
    for (const route of CANONICAL_ROUTES) {
      const url = `/${locale}${route}`;

      test(`${url} — 200 döner ve konsol temiz`, async ({ page }) => {
        await seedConsent(page);

        const errors: string[] = [];
        page.on("console", (message) => {
          if (message.type() === "error") errors.push(message.text());
        });
        page.on("pageerror", (error) => errors.push(error.message));

        const response = await page.goto(url, { waitUntil: "networkidle" });

        // Yönlendirilmeden doğrudan ulaşılmalı.
        expect(response?.status(), `${url} durum kodu`).toBe(200);
        expect(new URL(page.url()).pathname, `${url} son adres`).toBe(url);

        // Her sayfanın tek bir h1'i olmalı — canonical rotanın gerçekten
        // bir sayfa olduğunun (boş kabuk değil) en ucuz kanıtı.
        await expect(page.locator("h1")).toHaveCount(1);

        expect(errors, errors.join("\n")).toEqual([]);
      });
    }
  }
});

test.describe("Eski yol yönlendirmeleri", () => {
  for (const locale of LOCALES) {
    for (const [from, to] of LEGACY_REDIRECTS) {
      test(`/${locale}${from} → /${locale}${to}`, async ({ request }) => {
        const response = await request.get(`/${locale}${from}`, {
          // Yönlendirmeyi TAKİP ETME: doğrulanan şey yönlendirmenin
          // kendisi, hedef sayfanın açılması değil.
          maxRedirects: 0,
        });

        // next.config.mjs'te `permanent: true` → 308 (307 değil: metot ve
        // gövde korunur, kalıcı olduğu için arama motoru devreder).
        expect(response.status()).toBe(308);
        expect(response.headers().location).toBe(`/${locale}${to}`);
      });
    }
  }
});

test.describe("İçerik ve düzen sözleşmeleri", () => {
  for (const locale of LOCALES) {
    test(`/${locale}/work — hero, iş arşivi ve üçlü filtre çubuğu`, async ({
      page,
    }) => {
      await seedConsent(page);
      await page.goto(`/${locale}/work`, { waitUntil: "networkidle" });

      // Musteri revizyonu: hero basligi "RECENT" iken "THE ART OF TEAMWORK"
      // oldu. Marka slogani oldugu icin TR sayfada da Ingilizce kalir
      // (CLAUDE.md i18n kurali: sloganlar marka dilidir). Kaynagi
      // DECISIONS.md madde 25'te. Son isler listesi artik ayri bir h2
      // altinda -- asagida onu da dogruluyoruz.
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "THE ART OF TEAMWORK",
      );
      await expect(
        page.getByRole("heading", {
          level: 2,
          name: locale === "tr" ? "Son İşler" : "Recent Works",
        }),
      ).toBeVisible();
      const filters = page.getByRole("group", {
        name: locale === "tr" ? "Filtre" : "Filter",
      });
      await expect(filters.locator("select")).toHaveCount(3);
      await expect(filters.getByText(locale === "tr" ? "Yıl" : "Year")).toBeVisible();
      await expect(filters.getByText(locale === "tr" ? "Hizmet" : "Service")).toBeVisible();
      await expect(filters.getByText(locale === "tr" ? "Sektör" : "Industry")).toBeVisible();
    });

    test(`/${locale}/solutions — on beş yetenek listeleniyor`, async ({
      page,
    }) => {
      await seedConsent(page);
      await page.goto(`/${locale}/solutions`, { waitUntil: "networkidle" });

      // Eski hibrid360.com/solutions on beş kutucuk taşıyordu; sayı
      // sözleşme: madde eklemek/çıkarmak müşteri kararı.
      await expect(page.locator("main li")).toHaveCount(15);
    });

    test(`/${locale}/what-we-do/how-we-work — metin sayfa diliyle yazılı, "belirlenecek" rozetleri yayında`, async ({
      page,
    }) => {
      await seedConsent(page);
      await page.goto(`/${locale}/what-we-do/how-we-work`, { waitUntil: "networkidle" });

      // "NO BLACK BOX." marka sloganı: iki dilde de İngilizce (DECISIONS: sloganlar marka dili).
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("NO BLACK BOX.");

      // Karışık dil yasak: adım başlıkları ve tablo başlıkları sayfa dilinde,
      // diğer dilin karşılığı hiçbir yerde yok.
      const isTr = locale === "tr";
      await expect(page.getByRole("heading", { level: 3 }).first()).toHaveText(
        isTr ? "Brief ve uyum" : "Brief & fit",
      );
      await expect(
        page.getByRole("columnheader", { name: isTr ? "Başlangıç" : "Starting from" }),
      ).toBeVisible();
      await expect(page.getByText(isTr ? "Pre-production" : "Prodüksiyon öncesi")).toHaveCount(0);

      // Karar bekleyen alanlar (DECISIONS #15) uydurma rakam yerine görünür rozet:
      // 1 (adım 2: "[X] iş günü") + 6 başlangıç + 6 süre hücresi.
      await expect(
        page.locator("main").getByText(isTr ? "belirlenecek" : "to be set", { exact: true }),
      ).toHaveCount(13);
    });
  }

  test('hiçbir canonical sayfada "Photo pending" görünmüyor', async ({
    request,
  }) => {
    // Kurucu fotoğrafı yer tutucusu bir geliştirme notuydu ve production
    // arayüzüne sızmıştı. Nöbetçi: hiçbir sayfada geri gelmesin.
    const offenders: string[] = [];
    for (const locale of LOCALES) {
      for (const route of ["", ...CANONICAL_ROUTES]) {
        const url = `/${locale}${route}`;
        const html = await (await request.get(url)).text();
        if (html.includes("Photo pending")) offenders.push(url);
      }
    }
    expect(offenders, offenders.join(", ")).toEqual([]);
  });

  for (const locale of LOCALES) {
    test(`/${locale}/contact — harita sayfayla birlikte yükleniyor`, async ({
      page,
    }) => {
      await seedConsent(page);
      await page.goto(`/${locale}/contact`, { waitUntil: "networkidle" });

      const mapSection = page.locator(
        'section[aria-labelledby="contact-map"]',
      );

      // 9 Eylul 2026: Google Maps iframe'i CARTO/MapLibre vektor
      // haritasina cevrildi (bkz. src/data/contact.ts karar notu).
      // Musteri revizyonu geregi ara yukleme ekrani yok, harita
      // dogrudan gorunur -- artik bir <canvas>, iframe degil.
      const canvas = mapSection.locator("canvas");
      await expect(canvas).toBeVisible({ timeout: 15000 });

      // CARTO/OpenStreetMap atif metni -- haritanin gercekten
      // yuklendigini (bos bir kabuk olmadigini) dogrular.
      await expect(mapSection.getByText("CARTO", { exact: false })).toBeVisible({
        timeout: 15000,
      });

      // Harita yüklenmese/engellense de adrese ulaşılabilmeli.
      const fallback = page.locator('a[href*="google.com/maps/dir"]');
      expect(await fallback.count()).toBeGreaterThan(0);
    });
  }
});

test.describe("Yatay taşma", () => {
  // 320px en dar gerçekçi cihaz; 375/390 en yaygın telefonlar; 768 tablet;
  // 1440 masaüstü. Taşmanın kaynağı hero başlıklarının clamp tabanı olduğu
  // için en dar uç şart: orada geçen ölçü yukarıda da geçiyor.
  for (const width of [320, 375, 390, 768, 1440]) {
    test(`${width}px — hiçbir rota yatay taşmıyor`, async ({ page }) => {
      // 31 rota × 2 dil ardışık gezinme: yük altında 30 sn'ye yaklaşıyordu.
      test.setTimeout(120_000);
      await seedConsent(page);
      await page.setViewportSize({ width, height: 900 });

      const overflowing: string[] = [];
      for (const locale of LOCALES) {
        for (const route of OVERFLOW_ROUTES) {
          const url = `/${locale}${route}`;
          await page.goto(url, { waitUntil: "domcontentloaded" });
          const overflow = await page.evaluate(() => {
            const root = document.documentElement;
            return root.scrollWidth - root.clientWidth;
          });
          // 1px yuvarlama payı.
          if (overflow > 1) overflowing.push(`${url} (+${overflow}px)`);
        }
      }

      expect(overflowing, overflowing.join("\n")).toEqual([]);
    });
  }
});

test.describe("Menü hedefleri", () => {
  for (const locale of LOCALES) {
    test(`/${locale} — header ve footer bağlantıları canonical rotalara gidiyor`, async ({
      page,
      request,
    }) => {
      await seedConsent(page);
      await gotoSettled(page, `/${locale}`);

      const hrefs = await page
        .locator("header a[href], footer a[href]")
        .evaluateAll((anchors) =>
          anchors
            .map((anchor) => (anchor as HTMLAnchorElement).getAttribute("href"))
            .filter((href): href is string => !!href && href.startsWith("/")),
        );

      expect(hrefs.length).toBeGreaterThan(10);

      // Yönlendirme takip EDİLMİYOR: bir menü maddesi 308 veriyorsa
      // canonical olmayan bir hedefe bakıyor demektir.
      const redirecting: string[] = [];
      for (const href of [...new Set(hrefs)]) {
        const response = await request.get(href, { maxRedirects: 0 });
        if (response.status() !== 200) {
          redirecting.push(`${href} → ${response.status()}`);
        }
      }

      expect(redirecting, redirecting.join("\n")).toEqual([]);
    });
  }
});

test.describe("Görseller", () => {
  // Sessiz kırılma nöbetçisi: <picture> içindeki AVIF kaynağı tarayıcı
  // TARAFINDAN ÇÖZÜLEMEZSE `type` fallback'i devreye girmez (sorun destek
  // değil, çözümleme) ve görsel sessizce kırık kalır — istek 200 döndüğü
  // için ağ testleri de yakalamaz. Gerçekten yaşandı: kaynak JPEG'in tek
  // kanallı ICC profili AVIF çıktısına taşınıyordu.
  for (const route of ["/what-we-believe", "/contact"]) {
    test(`/tr${route} — bütün görseller çözülebiliyor`, async ({ page }) => {
      await seedConsent(page);
      await page.goto(`/tr${route}`, { waitUntil: "networkidle" });

      // Tembel görseller yüklensin diye sayfayı baştan sona gez.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 80));
        }
      });
      await page.waitForTimeout(1500);

      const broken = await page.$$eval("img", (images) =>
        images
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => (image as HTMLImageElement).currentSrc || image.src),
      );

      expect(broken, broken.join("\n")).toEqual([]);
    });
  }

  /*
   * 19 Eylül 2026'da güncellendi. İki sözleşme değişti:
   *
   * 1. Temsili kurucu videosu (BeliefFounderVideo) sayfadan KALDIRILDI —
   *    kullanıcı isteği. "anonim yaratıcı profesyoneli" görseli ve onun
   *    AI açıklaması artık bu sayfada YOK; testin onları araması, kaldırma
   *    işleminin sessizce geri alınmasını da fark etmez hâle getirirdi.
   *    Bu yüzden yokluk AÇIKÇA doğrulanıyor.
   *
   * 2. Alt metinlerden "duotone" ibaresi çıktı: görseller artık nötr
   *    siyah-beyaz (sarı efekt kaldırıldı).
   */
  test("What We Believe görsel alt metinleri sayfa diliyle eşleşiyor", async ({
    page,
  }) => {
    await seedConsent(page);

    await page.goto("/tr/what-we-believe");
    await expect(
      page.getByRole("img", { name: /bir pencerenin yanında/ }),
    ).toHaveCount(1);
    await expect(
      page.getByRole("img", { name: /Küçük Prens illüstrasyonu/ }),
    ).toHaveCount(1);
    // Duotone kalktı: alt metin artık sarıdan değil, siyah-beyazdan söz ediyor.
    await expect(page.getByRole("img", { name: /duotone/i })).toHaveCount(0);
    // Kaldırılan temsili kurucu videosu geri gelmemeli.
    await expect(
      page.getByRole("img", { name: /anonim yaratıcı profesyoneli/ }),
    ).toHaveCount(0);

    await page.goto("/en/what-we-believe");
    await expect(
      page.getByRole("img", { name: /sitting thoughtfully beside a window/ }),
    ).toHaveCount(1);
    await expect(
      page.getByRole("img", { name: /The Little Prince/ }),
    ).toHaveCount(1);
    await expect(page.getByRole("img", { name: /duotone/i })).toHaveCount(0);
    await expect(
      page.getByRole("img", { name: /anonymous creative professional/ }),
    ).toHaveCount(0);
  });
});
