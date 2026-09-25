import { test, expect, type Page } from "@playwright/test";
import {
  ALL_ROUTES,
  CANONICAL_ROUTES,
  CHAPTER_ROUTES,
  LOCALES,
  MIGRATED_ROUTES,
  MONA_ALLOWLIST,
  NOT_FOUND_ROUTE,
  OVERFLOW_ROUTES,
  type RoutePath,
} from "./routes";

/**
 * Tasarım dili bekçisi — Faz 2 (plan: ~/.claude/plans/shimmering-yawning-spark.md).
 *
 * Referans What We Do "Service Chapter" sayfaları: Space Grotesk 700, büyük
 * harf, tracking 0, sola yaslı, sol kenar = `--page-gutter` (1440px'te 41px,
 * 390px'te 20px), beyaz başlık + tek sarı satır. Faz 2 sitenin geri kalanını
 * grup grup (B1…B9) bu dile taşıyor; bu dosya taşınan her rotanın dilde
 * KALDIĞINI kilitliyor.
 *
 * RATCHET: kapsam `MIGRATED_ROUTES` (e2e/routes.json → "migrated"). B0'da
 * 7 hizmet sayfasıyla tohumlandı; her grup kendi rotalarını ekler, hiçbir
 * rota çıkarılmaz. Yeni rota eklemek = o rotanın H1'i bu kuralların hepsini
 * geçiyor demek.
 *
 * Ölçüm notları:
 *  - Hareket azaltma EMÜLE ediliyor (`page.emulateMedia`; bu projede
 *    `test.use({ reducedMotion })` bağlama ulaşmıyor). Hizmet sayfası
 *    başlıklarındaki karıştırma efekti (ScrambleLine) ilk ~1 sn metni rastgele
 *    harflerle yazıyor ve her kelimenin görünmez bir "hayalet" kopyasını
 *    taşıyor; ölçüm, başlıkta görünmez eleman kalmayınca başlar.
 *  - Taşma ELEMAN bazlı: `scrollWidth`, `overflow: clip` sarmalayıcıların
 *    (ör. `.chapter`) kestiği metni göremez. Başlığın satır kutuları
 *    (`Range.getClientRects`) sayfanın içerik kutusunda — sol ve sağ
 *    `--page-gutter` arasında — kalmalı.
 *  - Satır rengi MANTIKSAL satır üzerinden: blok sınırı (ya da `<br>`) yeni
 *    satır açar. Görsel kırılma kuralı bozmaz — "BUILT FOR THE FEED." dar
 *    ekranda iki görsel satıra kırılır ama tek beyaz satırdır. Kural (plan,
 *    "Başlık rengi"): tek satır beyaz; 2+ satırda sonuncu sarı, gerisi beyaz.
 *  - "Büyük harf" = görünen sonuç: `text-transform: uppercase` YA DA metnin
 *    kendisi büyük harf. Creative'in başlığı kaynağında büyük harf yazılı
 *    (CreativeTitle, text-transform yok) — referans sayfanın kendisi.
 *
 * MONA izin listesi: MONA = nokta yapısı (MonaShard köşe parçası, MonaDrift,
 * AI sayfasındaki MonaDots). Faz 2 kesin kararı: yalnız `MONA_ALLOWLIST`'te
 * (hizmet sayfaları, What We Do hub'ı, AI Creative Production). Ana sayfa,
 * Brief ve diğer her rota MONA'sız. Bilgisayar kafalı karakter MONA sayılmıyor
 * (Who We Are'daki döngü videosu bu bekçinin konusu değil).
 */

const WHITE = "rgb(255, 255, 255)";
const YELLOW = "rgb(255, 252, 0)";
const DISPLAY_FAMILY = "Space Grotesk";

/** Stil + renk + kenar + taşma bu iki viewport'ta ölçülür. */
const STYLE_VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
] as const;
/** Bu genişliklerde yalnız taşma (satır kutuları içerik kutusunda mı). */
const OVERFLOW_WIDTHS = [320, 375, 768] as const;

const GUTTER_TOLERANCE_PX = 2;
/** Alt piksel yuvarlaması için. */
const BOX_TOLERANCE_PX = 1;
/** Satır aralığı / punto alt sınırı (hizmet başlıkları .86). */
const MIN_LEADING = 0.85;

/**
 * MONA'nın DOM işaretleri (kaynak: src/components/mona/*):
 *  - `data-dots`: MonaShard ve MonaDots kökü — sunucu çıktısında da var,
 *    canvas yalnız masaüstünde kurulsa bile kök her zaman render ediliyor.
 *  - CSS modülü sınıf parçaları (`Dosya_sınıf__hash`): MonaDrift'in `data-*`
 *    özniteliği yok, onu yalnız sınıf adı tanıtıyor.
 * Canvas sayısı KULLANILMIYOR: Work'teki TeamworkField ve ana sayfa ekosistemi
 * de canvas, ikisi de MONA değil. Seçicilerin eskimesine karşı pozitif
 * kontrol aşağıda (izinli sayfalarda her işaret bulunmalı).
 */
const MONA_MARKERS: Readonly<Record<string, string>> = {
  "data-dots": "[data-dots]",
  MonaShard: '[class*="MonaShard_"]',
  MonaDrift: '[class*="MonaDrift_"]',
  MonaDots: '[class*="Mona_dots"]',
};
/** Pozitif kontrol: MonaShard + MonaDrift (Creative), MonaDots (AI). */
const MONA_REFERENCE_ROUTES: readonly RoutePath[] = [
  "/what-we-do/creative",
  "/what-we-do/ai-creative-production",
];

/** Rızayı önceden yazar: çerez bandı ölçülen düzeni örtmesin. */
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

type TitleLine = { text: string; color: string };
type LineBox = { text: string; left: number; right: number };
type TitleMeasure = {
  count: number;
  text: string;
  lang: string;
  fontFamily: string;
  primaryFamily: string;
  familyLoaded: boolean;
  fontWeight: string;
  letterSpacing: string;
  textTransform: string;
  textAlign: string;
  fontSize: number;
  lineHeight: string;
  left: number;
  gutter: number;
  contentLeft: number;
  contentRight: number;
  lines: TitleLine[];
  boxes: LineBox[];
};

/**
 * Başlık yerine oturdu mu: fontlar inmiş, karıştırma efektinin görünmez
 * hayalet kopyaları kalkmış. Tarayıcıda çalışır — dış değişken kullanmaz.
 */
function titleSettled(): boolean {
  const h1 = document.querySelector("h1");
  if (!h1 || document.fonts.status !== "loaded") return false;
  return Array.from(h1.querySelectorAll("*")).every(
    (element) => getComputedStyle(element).visibility !== "hidden",
  );
}

/** İlk h1'in ölçümü. Tarayıcıda çalışır — dış değişken kullanmaz. */
function measureTitle(): TitleMeasure | null {
  const headings = document.querySelectorAll("h1");
  const h1 = headings[0];
  if (!h1) return null;
  const style = getComputedStyle(h1);

  // Gutter'ı tarayıcı çözsün (clamp + vw): kök üzerinde aynı token'la dolgu.
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:absolute;top:0;left:0;visibility:hidden;padding-left:var(--page-gutter)";
  document.documentElement.appendChild(probe);
  const gutter = parseFloat(getComputedStyle(probe).paddingLeft);
  probe.remove();
  const viewport = document.documentElement.clientWidth;

  const isBlockLevel = (element: Element) => {
    const display = getComputedStyle(element).display;
    return display !== "contents" && !display.startsWith("inline");
  };
  // Metnin mantıksal satırı: h1 içindeki en yakın blok düzeyli ata.
  const lineOwner = (node: Node): Element => {
    let element = node.parentElement;
    while (element && element !== h1 && !isBlockLevel(element)) element = element.parentElement;
    return element ?? h1;
  };

  const lines: { text: string; colors: Set<string>; owner: Element }[] = [];
  const boxes: LineBox[] = [];
  let breakBefore = false;
  const walker = document.createTreeWalker(h1, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeName === "BR") {
      breakBefore = true;
      continue;
    }
    if (node.nodeType !== Node.TEXT_NODE) continue;
    const text = (node.textContent ?? "").trim();
    const parent = node.parentElement;
    if (!text || !parent) continue;
    const parentStyle = getComputedStyle(parent);
    if (parentStyle.visibility !== "visible") continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    // 1px'lik ekran okuyucu kopyaları görünür metin sayılmaz.
    const rects = Array.from(range.getClientRects()).filter(
      (rect) => rect.width > 1 && rect.height > 1,
    );
    if (rects.length === 0) continue;
    for (const rect of rects) boxes.push({ text, left: rect.left, right: rect.right });

    // Boyanan renk: `-webkit-text-fill-color` (çözülmüş `currentcolor` dahil).
    const color = parentStyle.getPropertyValue("-webkit-text-fill-color") || parentStyle.color;
    const owner = lineOwner(node);
    const current = lines[lines.length - 1];
    if (!current || breakBefore || current.owner !== owner) {
      lines.push({ text, colors: new Set([color]), owner });
    } else {
      current.text += ` ${text}`;
      current.colors.add(color);
    }
    breakBefore = false;
  }

  const unquote = (value: string) => value.trim().replace(/^["']|["']$/g, "");
  const primaryFamily = unquote(style.fontFamily.split(",")[0] ?? "");
  const box = h1.getBoundingClientRect();

  return {
    count: headings.length,
    text: lines.map((line) => line.text).join(" "),
    lang: h1.closest("[lang]")?.getAttribute("lang") || document.documentElement.lang || "en",
    fontFamily: style.fontFamily,
    primaryFamily,
    familyLoaded: Array.from(document.fonts).some(
      (face) => unquote(face.family) === primaryFamily && face.status === "loaded",
    ),
    fontWeight: style.fontWeight,
    letterSpacing: style.letterSpacing,
    textTransform: style.textTransform,
    textAlign: style.textAlign,
    fontSize: parseFloat(style.fontSize),
    lineHeight: style.lineHeight,
    left: box.left,
    gutter,
    contentLeft: gutter,
    contentRight: viewport - gutter,
    lines: lines.map((line) => ({ text: line.text, color: Array.from(line.colors).join(" + ") })),
    boxes,
  };
}

/** Sayfayı hareket azaltmada açar, başlık yerine oturana kadar bekler, ölçer. */
async function openAndMeasure(
  page: Page,
  url: string,
  viewport: { width: number; height: number },
): Promise<TitleMeasure> {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize(viewport);
  await page.goto(url, { waitUntil: "load" });
  await expect
    .poll(() => page.evaluate(titleSettled), {
      message: `${url}: h1 yok ya da yerine oturmadı (font inmedi / karıştırma efekti sürüyor)`,
      timeout: 10_000,
    })
    .toBe(true);
  const title = await page.evaluate(measureTitle);
  if (!title) throw new Error(`${url}: h1 bulunamadı`);
  return title;
}

/** İçerik kutusunun (sol/sağ gutter arası) dışına taşan satır kutuları. */
function boxesOutside(title: TitleMeasure): string[] {
  return title.boxes
    .filter(
      (box) =>
        box.left < title.contentLeft - BOX_TOLERANCE_PX ||
        box.right > title.contentRight + BOX_TOLERANCE_PX,
    )
    .map(
      (box) =>
        `"${box.text}" [${box.left.toFixed(1)}, ${box.right.toFixed(1)}] ⊄ ` +
        `[${title.contentLeft.toFixed(1)}, ${title.contentRight.toFixed(1)}]`,
    );
}

/** Tek satır beyaz; 2+ satırda sonuncu sarı, gerisi beyaz. */
function expectedLineColors(count: number): string[] {
  return Array.from({ length: count }, (_, index) =>
    count > 1 && index === count - 1 ? YELLOW : WHITE,
  );
}

function isZeroTracking(letterSpacing: string): boolean {
  return letterSpacing === "normal" || Math.abs(parseFloat(letterSpacing)) < 0.01;
}

function leadingRatio(title: TitleMeasure): number {
  // `normal` ≈ 1.2: alt sınırı zaten geçer.
  if (title.lineHeight === "normal") return 1.2;
  return parseFloat(title.lineHeight) / title.fontSize;
}

test.describe("Tasarım dili — göç eden rotalarda H1", () => {
  for (const viewport of STYLE_VIEWPORTS) {
    for (const locale of LOCALES) {
      for (const route of MIGRATED_ROUTES) {
        const url = `/${locale}${route}`;

        test(`${viewport.width}px ${url} — H1 Service Chapter dilinde`, async ({ page }) => {
          await seedConsent(page);
          const title = await openAndMeasure(page, url, viewport);
          const where = `${viewport.width}px ${url}`;

          expect.soft(title.count, `${where}: tam olarak bir h1`).toBe(1);
          expect
            .soft(title.primaryFamily, `${where}: font-family = ${title.fontFamily}`)
            .toBe(DISPLAY_FAMILY);
          expect
            .soft(title.familyLoaded, `${where}: ${DISPLAY_FAMILY} dosyası yüklenmedi, yedek fontla çiziliyor`)
            .toBe(true);
          expect.soft(title.fontWeight, `${where}: font-weight`).toBe("700");
          expect
            .soft(isZeroTracking(title.letterSpacing), `${where}: letter-spacing = ${title.letterSpacing} (0 olmalı)`)
            .toBe(true);
          expect
            .soft(
              title.textTransform === "uppercase" ||
                title.text === title.text.toLocaleUpperCase(title.lang),
              `${where}: büyük harf değil (text-transform: ${title.textTransform}, metin "${title.text}")`,
            )
            .toBe(true);
          expect.soft(["start", "left"], `${where}: text-align = ${title.textAlign}`).toContain(title.textAlign);
          expect
            .soft(
              Math.abs(title.left - title.gutter),
              `${where}: h1 sol kenarı ${title.left.toFixed(1)}px, gutter ${title.gutter.toFixed(1)}px`,
            )
            .toBeLessThanOrEqual(GUTTER_TOLERANCE_PX);
          expect
            .soft(
              leadingRatio(title),
              `${where}: satır aralığı ${title.lineHeight} / punto ${title.fontSize}px`,
            )
            .toBeGreaterThanOrEqual(MIN_LEADING);
          expect
            .soft(
              title.lines.map((line) => line.color),
              `${where}: satır renkleri ${JSON.stringify(title.lines)}`,
            )
            .toEqual(expectedLineColors(title.lines.length));
          expect.soft(boxesOutside(title), `${where}: içerik kutusundan taşan satır`).toEqual([]);
        });
      }
    }
  }

  for (const locale of LOCALES) {
    for (const route of MIGRATED_ROUTES) {
      const url = `/${locale}${route}`;

      test(`${OVERFLOW_WIDTHS.join("/")}px ${url} — H1 satırları içerik kutusunda`, async ({
        page,
      }) => {
        await seedConsent(page);
        const overflowing: string[] = [];
        for (const width of OVERFLOW_WIDTHS) {
          const title = await openAndMeasure(page, url, { width, height: 900 });
          for (const line of boxesOutside(title)) overflowing.push(`${width}px: ${line}`);
        }
        expect(overflowing, `${url}\n${overflowing.join("\n")}`).toEqual([]);
      });
    }
  }
});

test.describe("MONA izin listesi", () => {
  async function countMonaMarkers(page: Page): Promise<Record<string, number>> {
    return page.evaluate(
      (markers) =>
        Object.fromEntries(
          Object.entries(markers).map(([name, selector]) => [
            name,
            document.querySelectorAll(selector).length,
          ]),
        ),
      MONA_MARKERS,
    );
  }

  // Hareket azaltma EMÜLE EDİLMİYOR: MonaDrift o ayarda hiç render edilmez,
  // yani emülasyon açıkken olası bir sızıntı görünmez kalırdı.
  test("işaretler izinli sayfalarda bulunuyor (seçici eskimedi)", async ({ page }) => {
    await seedConsent(page);
    const found: Record<string, number> = {};
    for (const route of MONA_REFERENCE_ROUTES) {
      expect(MONA_ALLOWLIST, `${route} izin listesinde olmalı`).toContain(route);
      await page.goto(`/tr${route}`, { waitUntil: "networkidle" });
      for (const [name, count] of Object.entries(await countMonaMarkers(page))) {
        found[name] = (found[name] ?? 0) + count;
      }
    }
    for (const name of Object.keys(MONA_MARKERS)) {
      expect
        .soft(found[name] ?? 0, `"${name}" (${MONA_MARKERS[name]}) izinli sayfalarda yok — seçici eskimiş`)
        .toBeGreaterThan(0);
    }
  });

  const forbidden = ALL_ROUTES.filter((route) => !MONA_ALLOWLIST.includes(route));
  for (const locale of LOCALES) {
    for (const route of forbidden) {
      const url = `/${locale}${route}`;

      test(`${url} — MONA yok`, async ({ page }) => {
        await seedConsent(page);
        await page.goto(url, { waitUntil: "networkidle" });
        const present = Object.entries(await countMonaMarkers(page))
          .filter(([, count]) => count > 0)
          .map(([name, count]) => `${name} ×${count}`);
        expect(present, `${url} izin listesinde değil ama MONA var: ${present.join(", ")}`).toEqual(
          [],
        );
      });
    }
  }
});

test.describe("Rota verisi", () => {
  test("listeler birbiriyle tutarlı (e2e/routes.json)", () => {
    const missing = (subset: readonly RoutePath[], superset: readonly RoutePath[]) =>
      subset.filter((route) => !superset.includes(route));

    expect(
      missing(CHAPTER_ROUTES, MIGRATED_ROUTES),
      "ratchet: hizmet sayfaları göç listesinden çıkarılamaz",
    ).toEqual([]);
    expect(missing(CHAPTER_ROUTES, MONA_ALLOWLIST), "hizmet sayfaları MONA'nın yeri").toEqual([]);
    expect(
      missing(MIGRATED_ROUTES, ALL_ROUTES),
      "göç eden her rota denetim ve MONA kapsamında olmalı",
    ).toEqual([]);
    expect(missing(MONA_ALLOWLIST, ALL_ROUTES)).toEqual([]);
    expect(missing(CANONICAL_ROUTES, ALL_ROUTES)).toEqual([]);
    expect(
      missing(ALL_ROUTES, OVERFLOW_ROUTES),
      "denetlenen her rota yatay taşma nöbetçisinde olmalı",
    ).toEqual([]);
    expect(ALL_ROUTES).toContain(NOT_FOUND_ROUTE);
  });
});
