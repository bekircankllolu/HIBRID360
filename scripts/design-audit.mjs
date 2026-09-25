/**
 * Tasarım dili denetim aracı — Faz 2 (B0…B9) için kalıcı önce/sonra aracı.
 *
 *   node scripts/design-audit.mjs shoot   --base <url> --out <klasör> [seçenekler]
 *   node scripts/design-audit.mjs compare --a <klasör> --b <klasör> [seçenekler]
 *   node scripts/design-audit.mjs --help
 *
 * NEDEN: Faz 2 sitenin bütün sayfalarını grup grup Service Chapter diline
 * taşıyor ve her grubun kapısı "grup DIŞI rotalarda piksel farkı ≈ 0".
 * Scratchpad'deki tek seferlik araçların yerine depoda duran, rota listesini
 * testlerle PAYLAŞAN (e2e/routes.json) tek araç.
 *
 * shoot — her rota × dil × viewport için:
 *   · çerez rızası tohumlanır (bant kompozisyonu örtmesin), hareket azaltma
 *     açık (`reducedMotion: reduce`), fontlar inince çekilir;
 *   · sayfa viewport adımlarıyla gezilir: `top`, `y01`, `y02`… ve `footer`
 *     (sayfanın dibi) — `<dil>__<rota-slug>__<vp>__<konum>.png`;
 *   · `metrics.json`: h1/h2/h3 (font, punto, ağırlık, espas, satır aralığı,
 *     renk, sol kenar), 4 karakterden uzun FUŞYA metinler, buton/CTA
 *     benzeri elemanların köşe yarıçapı, yatay taşma, MONA işaretleri,
 *     `<main>` sayısı ve her karede gizlenen dinamik yüzeylerin kutuları.
 *
 * compare — iki klasördeki aynı adlı kareleri piksel piksel karşılaştırır;
 * rota başına tablo basar; eşiği aşan (hariç tutulmamış) rota varsa 1 döner.
 *
 * GÜRÜLTÜ POLİTİKASI (neden gizleme/eşik):
 *   · WebGL (MONA, ana sayfa ekosistemi, hero) yazılım GL'de (SwiftShader)
 *     çiziliyor; parçacık bulutları her yüklemede rastgele tohumla kuruluyor,
 *     kare zamanlaması makinenin yüküne bağlı. Video karesi oynatma anına
 *     bağlı; harita (MapLibre) karoları ağdan geliyor. Bu yüzeyler
 *     (`canvas, video, iframe`) çekim anında `visibility: hidden` ile
 *     GİZLENİR: yerleşim değişmez, yerlerinde sayfa zemini görünür.
 *     MASKELENMEZ — ilk sürüm maskeliyordu ve ölçüldü: MonaShard canvas'ı
 *     hizmet sayfası hero'sunun, showreel videosu ana sayfa hero'sunun
 *     TAMAMINI kaplıyor; maske üstlerindeki H1'i (Faz 2'nin tam değiştirdiği
 *     yer) karşılaştırmanın dışında bırakıyordu. Yüzeylerin kutuları yine
 *     `metrics.json`'a yazılır; konumu/boyu değişirse compare ayrıca uyarır.
 *     Bedeli: medyanın KENDİ içeriğindeki değişiklik görünmez (Faz 2 medyaya
 *     dokunmuyor).
 *   · Kanal eşiği 16/255: alt piksel yumuşatma ve renk yuvarlaması fark
 *     sayılmaz; gerçek bir renk/konum değişikliği bunun çok üstünde.
 *   · Yüzde KARE başına ölçülür, sayfa ortalaması değil: uzun bir sayfada
 *     tek bir kaymış buton ortalamada kaybolurdu.
 *   · Ana sayfa: ekosistem sahnesi kareler çekilmeden önce görünür alana
 *     alınıp kurulması (`data-scene` webgl/fallback) beklenir. Ölçüm (25 Eylül
 *     2026): aynı build'in iki bağımsız çekimi ana sayfa dahil %0,000 fark —
 *     rota bazında gevşek eşik GEREKMEDİ.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { parseArgs } from "node:util";
import { chromium } from "playwright";
import sharp from "sharp";

const ROUTE_DATA = JSON.parse(
  fs.readFileSync(new URL("../e2e/routes.json", import.meta.url), "utf8"),
);

/** e2e testlerindeki `seedConsent` ile aynı değer. */
const CONSENT = JSON.stringify({
  necessary: true,
  analytics: false,
  decidedAt: "2026-01-01T00:00:00.000Z",
});

/** GPU'suz makinede de WebGL: SwiftShader (yazılım GL) — her koşuda aynı yol. */
const CHROMIUM_ARGS = [
  "--use-gl=angle",
  "--use-angle=swiftshader",
  "--enable-unsafe-swiftshader",
  "--ignore-gpu-blocklist",
];

const DEFAULT_VIEWPORTS = "1440x900,390x844";
const DEFAULT_THRESHOLD = 0.5;
/** Kanal başına fark eşiği (0-255). */
const CHANNEL_THRESHOLD = 16;
/** Sonsuz sayfaya karşı emniyet: en çok bu kadar viewport adımı. */
const MAX_STEPS = 60;
/** Her kaydırmadan sonra kaydırmaya bağlı sahnelerin oturması için. */
const SETTLE_MS = 250;
/**
 * Ekosistem (ana sayfa) yazılım GL'de yavaş: sahne `pending`'den çıktıktan
 * sonra da ilk sabit karenin çizilmesi zaman alıyor.
 */
const HEAVY_ROUTES = new Set([""]);
const HEAVY_SCENE_TIMEOUT_MS = 45_000;
/** Ekosistem sahnesinin `webgl`/`fallback` olması için üst sınır. */
const ECOSYSTEM_TIMEOUT_MS = 60_000;
const HEAVY_EXTRA_MS = 2_000;
const SCENE_TIMEOUT_MS = 10_000;
/** Çekim anında gizlenen, zamana bağlı yüzeyler. */
const DYNAMIC_SURFACES = "canvas, video, iframe";
/** e2e/design-language.spec.ts'teki MONA_MARKERS ile aynı. */
const MONA_MARKERS = {
  "data-dots": "[data-dots]",
  MonaShard: '[class*="MonaShard_"]',
  MonaDrift: '[class*="MonaDrift_"]',
  MonaDots: '[class*="Mona_dots"]',
};

const FILE_PATTERN = /^([a-z]{2})__([a-z0-9_-]+)__(\d+x\d+)__(top|y\d{2}|footer)\.png$/;

const HELP = `Tasarım dili denetim aracı (Faz 2)

KULLANIM
  node scripts/design-audit.mjs shoot   --base <url> --out <klasör> [seçenekler]
  node scripts/design-audit.mjs compare --a <klasör> --b <klasör> [seçenekler]

shoot — tam sayfa görüntü + ölçüm
  --base <url>          Çalışan sunucu, ör. http://localhost:3200 (zorunlu)
  --out <klasör>        Çıktı, ör. .design-audit/b0-once (zorunlu; boş ya da yok olmalı)
  --routes /a,/b        Rota listesi, locale öneki OLMADAN; ana sayfa "/"
  --group <ad>          e2e/routes.json listesi: all (varsayılan) | migrated | chapters
                        (ayrıca canonical | overflow | monaAllowlist)
  --locales tr,en       Diller (varsayılan: tr,en)
  --viewports <liste>   Varsayılan: ${DEFAULT_VIEWPORTS}
  --block-fonts         /fonts/*.woff2 isteklerini iptal eder: yedek font sığıyor mu?

  Her rota × dil × viewport: çerez rızası tohumlu, hareket azaltma açık,
  fontlar inince; viewport adımlarıyla top, y01, y02… ve footer kareleri:
  <dil>__<rota-slug>__<vp>__<konum>.png  (slug: ana sayfa "home", yoldaki "/" → "_")
  metrics.json: h1–h3 ölçüleri, 4+ karakterlik fuşya metinler, buton köşe
  yarıçapları, yatay taşma, MONA işaretleri, <main> sayısı, gizlenen yüzeyler.

compare — piksel farkı
  --a <klasör>          "Önce" çekimi
  --b <klasör>          "Sonra" çekimi
  --exclude /a,/b       Farkı BEKLENEN rotalar: ayrı listelenir, çıkışı etkilemez
  --threshold <yüzde>   Kare başına izin verilen farklı piksel yüzdesi (varsayılan ${DEFAULT_THRESHOLD})
  --diff-dir <klasör>   Farkı olan kareler için fark görüntüsü (kırmızı = farklı)
  --json <dosya>        Sonucu JSON olarak da yaz

  Aynı adlı kareler aynı boyuta getirilir (eksik alan fark sayılır); kanal
  eşiği ${CHANNEL_THRESHOLD}/255; canvas/video/iframe çekimde gizlenir (üstlerindeki
  yazı karşılaştırılır); konumları değişirse ayrıca uyarılır. Yüzde kare başına; rotanın değeri en kötü kare.

ÇIKIŞ KODLARI
  0 temiz · 1 eşik aşıldı / eksik kare / çekim hatası · 2 kullanım hatası, sunucu yok

ÖRNEK
  NEXT_DIST_DIR=.next-audit npx next build && NEXT_DIST_DIR=.next-audit npx next start -p 3200
  MSYS_NO_PATHCONV=1 node scripts/design-audit.mjs shoot --base http://localhost:3200 \\
    --out .design-audit/b0-once --group all
  (değişiklik + yeniden build/start)
  MSYS_NO_PATHCONV=1 node scripts/design-audit.mjs shoot --base http://localhost:3200 \\
    --out .design-audit/b0-sonra --group all
  MSYS_NO_PATHCONV=1 node scripts/design-audit.mjs compare --a .design-audit/b0-once \\
    --b .design-audit/b0-sonra --exclude /what-we-do,/what-we-do/how-we-work

NOT (Git Bash): "/work" gibi argümanlar Windows yoluna çevrilir; komutun başına
MSYS_NO_PATHCONV=1 koyun. Araç çevrilmiş yolu görürse durur.
`;

class UsageError extends Error {}

function usage(message) {
  throw new UsageError(message);
}

function splitList(value) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Locale öneki olmadan yol; ana sayfa "". */
function normalizeRoute(raw) {
  const value = raw.trim();
  if (/^[a-z]:[\\/]/i.test(value) || value.includes("\\")) {
    usage(
      `"${raw}" Windows yoluna çevrilmiş (Git Bash). Komutun başına MSYS_NO_PATHCONV=1 koyun.`,
    );
  }
  const route = `/${value.replace(/^\/+|\/+$/g, "")}`;
  if (route === "/") return "";
  if (!/^(\/[a-z0-9]+(?:-[a-z0-9]+)*)+$/.test(route)) usage(`Geçersiz rota: "${raw}"`);
  if (ROUTE_DATA.locales.some((locale) => route === `/${locale}` || route.startsWith(`/${locale}/`))) {
    usage(`"${raw}": rota locale öneki olmadan yazılır (dil için --locales).`);
  }
  return route;
}

function slugOf(route) {
  return route === "" ? "home" : route.slice(1).replaceAll("/", "_");
}

function parseViewports(value) {
  return splitList(value).map((item) => {
    const match = /^(\d{3,4})x(\d{3,4})$/.exec(item);
    if (!match) usage(`Geçersiz viewport: "${item}" (ör. 1440x900)`);
    return { width: Number(match[1]), height: Number(match[2]), label: item };
  });
}

function ensureEmptyDir(directory) {
  if (fs.existsSync(directory) && fs.readdirSync(directory).length > 0) {
    usage(`${directory} dolu. Her çekim için yeni bir klasör adı verin (eski çekimi ezmeyelim).`);
  }
  fs.mkdirSync(directory, { recursive: true });
}

async function assertServer(base, locale) {
  try {
    const response = await fetch(`${base}/${locale}`, { signal: AbortSignal.timeout(20_000) });
    if (response.status >= 500) throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    usage(`Sunucuya ulaşılamadı: ${base}/${locale} (${reason})`);
  }
}

// ---------------------------------------------------------------- shoot

/** Kaydırmaya bağlı sahneler, görseller ve fontlar otursun (üst sınırlı). */
async function settle(page, heavy, notes) {
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  // Yalnız GÖRÜNÜR alandaki sahneler beklenir: ekosistem ve MONA sahneleri
  // görünür alana girince kuruluyor (IntersectionObserver), yakındaki ama
  // ekran dışındaki bir sahneyi beklemek hiç bitmeyen bir bekleme olur.
  const scenes = await page
    .waitForFunction(
      () =>
        [...document.querySelectorAll('[data-scene="pending"], [data-dots="pending"]')].every(
          (element) => {
            const rect = element.getBoundingClientRect();
            return rect.width === 0 || rect.bottom <= 0 || rect.top >= window.innerHeight;
          },
        ),
      undefined,
      { timeout: heavy ? HEAVY_SCENE_TIMEOUT_MS : SCENE_TIMEOUT_MS, polling: 250 },
    )
    .then(
      () => true,
      () => false,
    );
  if (!scenes) notes.add("WebGL sahnesi süre içinde kurulmadı (pending kaldı)");

  const images = await page
    .waitForFunction(
      () =>
        [...document.images].every((image) => {
          const rect = image.getBoundingClientRect();
          const visible = rect.width > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
          return !visible || image.complete;
        }),
      undefined,
      { timeout: 10_000, polling: 250 },
    )
    .then(
      () => true,
      () => false,
    );
  // Bilinen yerel sorun: /_next/image isteği sunucu belleğinde takılabiliyor
  // (memory: local-testing-gotchas #3) — kare yine çekilir, not düşülür.
  if (!images) notes.add("görünür görsel 10 sn içinde inmedi");

  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  const sceneInView = await page.evaluate(() =>
    [...document.querySelectorAll("[data-scene], [data-dots]")].some((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
    }),
  );
  await page.waitForTimeout(heavy && sceneInView ? HEAVY_EXTRA_MS : SETTLE_MS);
}

/** Karedeki zamana bağlı yüzeylerin (canvas/video/iframe) görünür kutuları. */
async function dynamicMasks(page) {
  return page.evaluate((selector) => {
    const masks = [];
    for (const element of document.querySelectorAll(selector)) {
      const style = getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const rect = element.getBoundingClientRect();
      const x0 = Math.max(0, Math.floor(rect.left));
      const y0 = Math.max(0, Math.floor(rect.top));
      const x1 = Math.min(window.innerWidth, Math.ceil(rect.right));
      const y1 = Math.min(window.innerHeight, Math.ceil(rect.bottom));
      if (x1 > x0 && y1 > y0) {
        masks.push({ kind: element.tagName.toLowerCase(), x: x0, y: y0, w: x1 - x0, h: y1 - y0 });
      }
    }
    return masks;
  }, DYNAMIC_SURFACES);
}

/** Sayfa ölçümü (tarayıcıda çalışır; dışarıdan yalnız argüman alır). */
function collectMetrics({ monaMarkers }) {
  const round = (value) => Math.round(value * 10) / 10;
  const snippet = (value, length) => value.replace(/\s+/g, " ").trim().slice(0, length);
  const fill = (style) => style.getPropertyValue("-webkit-text-fill-color") || style.color;
  const region = (element) =>
    element.closest("main")
      ? "main"
      : element.closest("footer")
        ? "footer"
        : element.closest("header")
          ? "header"
          : "other";
  const rendered = (element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== "none" && style.visibility === "visible" && rect.width > 0 && rect.height > 0;
  };
  const firstClass = (element) =>
    (typeof element.className === "string" ? element.className : "").split(/\s+/)[0] ?? "";

  const probe = document.createElement("div");
  probe.style.cssText =
    "position:absolute;top:0;left:0;visibility:hidden;padding-left:var(--page-gutter)";
  document.documentElement.appendChild(probe);
  const gutter = parseFloat(getComputedStyle(probe).paddingLeft);
  probe.remove();
  const viewport = document.documentElement.clientWidth;

  const headings = [...document.querySelectorAll("h1, h2, h3")].filter(rendered).map((element) => {
    const style = getComputedStyle(element);
    const range = document.createRange();
    range.selectNodeContents(element);
    const rects = [...range.getClientRects()].filter((rect) => rect.width > 1 && rect.height > 1);
    const lineLeft = rects.length ? Math.min(...rects.map((rect) => rect.left)) : null;
    const lineRight = rects.length ? Math.max(...rects.map((rect) => rect.right)) : null;
    return {
      tag: element.tagName.toLowerCase(),
      region: region(element),
      text: snippet(element.textContent ?? "", 80),
      family: style.fontFamily,
      size: style.fontSize,
      weight: style.fontWeight,
      letterSpacing: style.letterSpacing,
      lineHeight: style.lineHeight,
      textTransform: style.textTransform,
      color: fill(style),
      left: round(element.getBoundingClientRect().left),
      lineLeft: lineLeft === null ? null : round(lineLeft),
      lineRight: lineRight === null ? null : round(lineRight),
      cutAtViewport: lineLeft !== null && (lineLeft < -1 || lineRight > viewport + 1),
    };
  });

  const fuchsiaText = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = snippet(node.textContent ?? "", 80);
    const parent = node.parentElement;
    if (text.length <= 4 || !parent || !rendered(parent)) continue;
    if (fill(getComputedStyle(parent)) !== "rgb(255, 0, 255)") continue;
    const rect = parent.getBoundingClientRect();
    fuchsiaText.push({
      text,
      tag: parent.tagName.toLowerCase(),
      className: firstClass(parent),
      region: region(parent),
      top: round(rect.top + window.scrollY),
    });
  }

  const transparent = (color) => color === "transparent" || /rgba\(.*,\s*0\)$/.test(color);
  const buttons = [
    ...document.querySelectorAll('button, [role="button"], input[type="submit"], input[type="button"], a'),
  ]
    .filter(rendered)
    .map((element) => ({ element, style: getComputedStyle(element) }))
    .filter(({ element, style }) => {
      if (element.tagName !== "A") return true;
      // Bağlantı ancak kutuluysa (zemin ya da çerçeve) buton benzeri sayılır.
      const bordered = ["Top", "Right", "Bottom", "Left"].filter(
        (side) =>
          parseFloat(style[`border${side}Width`]) > 0 && !transparent(style[`border${side}Color`]),
      ).length;
      return !transparent(style.backgroundColor) || bordered >= 2;
    })
    .map(({ element, style }) => ({
      tag: element.tagName.toLowerCase(),
      text: snippet(element.textContent || element.getAttribute("aria-label") || "", 40),
      className: firstClass(element),
      region: region(element),
      radius: style.borderRadius,
      background: style.backgroundColor,
    }));
  const radii = {};
  for (const button of buttons) radii[button.radius] = (radii[button.radius] ?? 0) + 1;

  const mona = Object.fromEntries(
    Object.entries(monaMarkers).map(([name, selector]) => [
      name,
      document.querySelectorAll(selector).length,
    ]),
  );

  return {
    viewport: { width: window.innerWidth, height: window.innerHeight },
    documentHeight: document.documentElement.scrollHeight,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    gutter: round(gutter),
    horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    mainCount: document.querySelectorAll("main").length,
    h1Count: document.querySelectorAll("h1").length,
    headings,
    fuchsiaText,
    buttons,
    radii,
    mona,
    monaCanvases: document.querySelectorAll('[data-dots] canvas, [class*="MonaDrift_"] canvas')
      .length,
    canvases: document.querySelectorAll("canvas").length,
    videos: document.querySelectorAll("video").length,
    fonts: [...document.fonts].map((face) => ({
      family: face.family.replace(/^["']|["']$/g, ""),
      weight: face.weight,
      status: face.status,
    })),
    incompleteImages: [...document.images]
      .filter((image) => !image.complete)
      .map((image) => image.currentSrc || image.src),
  };
}

async function shootPage(context, job, out) {
  const { base, locale, route, viewport } = job;
  const slug = slugOf(route);
  const url = `${base}/${locale}${route}`;
  const heavy = HEAVY_ROUTES.has(route);
  const notes = new Set();
  const record = {
    locale,
    route,
    slug,
    viewport: viewport.label,
    url,
    status: null,
    finalUrl: null,
    error: null,
    ecosystemScene: null,
    notes: [],
    shots: [],
    metrics: null,
  };

  const page = await context.newPage();
  try {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const response = await page.goto(url, { waitUntil: "load", timeout: 60_000 });
    record.status = response?.status() ?? null;
    record.finalUrl = page.url();
    await page
      .waitForLoadState("networkidle", { timeout: 15_000 })
      .catch(() => notes.add("ağ 15 sn içinde durulmadı"));

    // Ana sayfa ekosistemi yalnız GÖRÜNÜR ALANA girince kuruluyor
    // (IntersectionObserver; ekran dışındayken `data-scene="pending"` normal).
    // Kareler çekilmeden önce sahne bir kez görünür alana alınıp kurulması
    // beklenir — yazılım GL'de bu onlarca saniye sürebilir. Süre aşılırsa not
    // düşülür ve çekim sürer (sahne yüzeyi karede zaten gizli).
    const ecosystem = page.locator('[data-testid="ecosystem-stage"]');
    if ((await ecosystem.count()) > 0) {
      await ecosystem.first().scrollIntoViewIfNeeded();
      const built = await page
        .waitForFunction(
          () => {
            const scene = document.querySelector('[data-testid="ecosystem-stage"]')?.getAttribute("data-scene");
            return scene === "webgl" || scene === "fallback";
          },
          undefined,
          { timeout: ECOSYSTEM_TIMEOUT_MS, polling: 500 },
        )
        .then(
          () => true,
          () => false,
        );
      record.ecosystemScene = await ecosystem.first().getAttribute("data-scene");
      if (!built) notes.add(`ekosistem sahnesi ${ECOSYSTEM_TIMEOUT_MS / 1000} sn içinde kurulmadı (${record.ecosystemScene})`);
      await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }));
    }

    const capture = async (position) => {
      await settle(page, heavy, notes);
      const scrollY = await page.evaluate(() => window.scrollY);
      const masks = await dynamicMasks(page);
      const file = `${locale}__${slug}__${viewport.label}__${position}.png`;
      await page.screenshot({
        path: path.join(out, file),
        animations: "disabled",
        caret: "hide",
        scale: "css",
        // Zamana bağlı yüzeyler yalnız bu karede gizli (gerekçe dosya başında).
        style: `${DYNAMIC_SURFACES} { visibility: hidden !important; }`,
        timeout: 30_000,
      });
      record.shots.push({ file, position, scrollY, masks });
    };
    const scrollTo = (top) =>
      page.evaluate((y) => window.scrollTo({ top: y, left: 0, behavior: "instant" }), top);
    const maxScroll = () =>
      page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);

    await capture("top");
    let step = 1;
    for (; step <= MAX_STEPS; step += 1) {
      const top = step * viewport.height;
      if (top >= (await maxScroll())) break;
      await scrollTo(top);
      await capture(`y${String(step).padStart(2, "0")}`);
    }
    if (step > MAX_STEPS && step * viewport.height < (await maxScroll())) {
      notes.add(`${MAX_STEPS} adımda sayfa bitmedi; aradaki kısım çekilmedi (footer yine çekildi)`);
    }
    await scrollTo(await maxScroll());
    await capture("footer");

    record.metrics = await page.evaluate(collectMetrics, { monaMarkers: MONA_MARKERS });
    if (!record.metrics.reducedMotion) notes.add("hareket azaltma etkin DEĞİL — kareler hareketli olabilir");
  } catch (error) {
    record.error = error instanceof Error ? error.message.split("\n")[0] : String(error);
  } finally {
    record.notes = [...notes];
    await page.close();
  }
  return record;
}

async function shoot(values) {
  if (!values.base) usage("--base gerekli (ör. --base http://localhost:3200)");
  if (!values.out) usage("--out gerekli (ör. --out .design-audit/b0-once)");
  if (values.routes && values.group) usage("--routes ve --group birlikte kullanılmaz");
  if (values.a || values.b || values.exclude || values.threshold || values["diff-dir"] || values.json) {
    usage("--a/--b/--exclude/--threshold/--diff-dir/--json compare içindir");
  }

  const base = values.base.replace(/\/+$/, "");
  const group = values.group ?? "all";
  const groupRoutes = ROUTE_DATA[group];
  if (!values.routes && (!Array.isArray(groupRoutes) || group === "locales")) {
    usage(`Bilinmeyen grup: "${group}" (all | migrated | chapters | canonical | overflow | monaAllowlist)`);
  }
  const routes = [...new Set((values.routes ? splitList(values.routes) : groupRoutes).map(normalizeRoute))];
  if (routes.length === 0) usage("Rota listesi boş (ana sayfa için --routes /)");
  const slugs = new Map();
  for (const route of routes) {
    const other = slugs.get(slugOf(route));
    if (other !== undefined) usage(`"${other}" ve "${route}" aynı dosya adına düşüyor`);
    slugs.set(slugOf(route), route);
  }
  const locales = values.locales ? splitList(values.locales) : ROUTE_DATA.locales;
  for (const locale of locales) {
    if (!ROUTE_DATA.locales.includes(locale)) usage(`Bilinmeyen dil: "${locale}"`);
  }
  const viewports = parseViewports(values.viewports ?? DEFAULT_VIEWPORTS);
  const blockFonts = Boolean(values["block-fonts"]);
  const out = path.resolve(values.out);

  await assertServer(base, locales[0]);
  ensureEmptyDir(out);

  const summary = {
    tool: "design-audit",
    version: 1,
    createdAt: new Date().toISOString(),
    base,
    options: {
      routes,
      locales,
      viewports: viewports.map((viewport) => viewport.label),
      blockFonts,
      channelThreshold: CHANNEL_THRESHOLD,
    },
    pages: [],
  };
  const writeSummary = () =>
    fs.writeFileSync(path.join(out, "metrics.json"), `${JSON.stringify(summary, null, 2)}\n`);

  const total = routes.length * locales.length * viewports.length;
  console.log(
    `Çekim: ${routes.length} rota × ${locales.length} dil × ${viewports.length} viewport = ${total} sayfa → ${out}` +
      (blockFonts ? " (fontlar ENGELLİ)" : ""),
  );

  const browser = await chromium.launch({ args: CHROMIUM_ARGS });
  const started = Date.now();
  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        reducedMotion: "reduce",
      });
      await context.addInitScript((consent) => {
        try {
          window.localStorage.setItem("hibrid360-consent", consent);
        } catch {
          /* depolama kapalıysa bant görünür; çekim yine sürer */
        }
      }, CONSENT);
      if (blockFonts) await context.route("**/fonts/*.woff2", (route) => route.abort());

      for (const locale of locales) {
        for (const route of routes) {
          const record = await shootPage(context, { base, locale, route, viewport }, out);
          summary.pages.push(record);
          writeSummary();
          const state = record.error
            ? `HATA: ${record.error}`
            : `${record.shots.length} kare, HTTP ${record.status}`;
          const notes = record.notes.length ? ` — ${record.notes.join("; ")}` : "";
          console.log(`  [${summary.pages.length}/${total}] ${viewport.label} /${locale}${route}: ${state}${notes}`);
        }
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }

  const failed = summary.pages.filter((record) => record.error);
  const shots = summary.pages.reduce((sum, record) => sum + record.shots.length, 0);
  console.log(
    `Bitti: ${summary.pages.length} sayfa, ${shots} kare, ${Math.round((Date.now() - started) / 1000)} sn` +
      (failed.length ? ` — ${failed.length} sayfa HATALI` : ""),
  );
  return failed.length ? 1 : 0;
}

// -------------------------------------------------------------- compare

function readShootDir(directory) {
  const file = path.join(directory, "metrics.json");
  if (!fs.existsSync(file)) usage(`${directory} bir çekim klasörü değil (metrics.json yok)`);
  const metrics = JSON.parse(fs.readFileSync(file, "utf8"));
  const shots = new Map();
  const routes = new Map();
  // Çekimde hata veren sayfalar: kare üretmedikleri için karşılaştırma tablosunda
  // hiç görünmezlerdi (iki tarafta da yoksa "AYNI" bile sayılmaz, sessizce düşer).
  const failed = [];
  for (const record of metrics.pages ?? []) {
    routes.set(record.slug, record.route);
    if (record.error) failed.push({ slug: record.slug, error: record.error });
    for (const shot of record.shots ?? []) shots.set(shot.file, shot);
  }
  const files = new Set(fs.readdirSync(directory).filter((name) => FILE_PATTERN.test(name)));
  return { metrics, shots, routes, files, failed };
}

async function decode(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

/** İki kareyi aynı boyuta getirip piksel farkını ölçer (eksik alan fark sayılır). */
async function diffImages(fileA, fileB, diffFile) {
  const [a, b] = await Promise.all([decode(fileA), decode(fileB)]);
  const width = Math.max(a.width, b.width);
  const height = Math.max(a.height, b.height);
  const image = diffFile ? Buffer.alloc(width * height * 4) : null;
  let different = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const inA = x < a.width && y < a.height;
      const inB = x < b.width && y < b.height;
      const ia = (y * a.width + x) * 4;
      const ib = (y * b.width + x) * 4;
      const changed =
        !inA ||
        !inB ||
        [0, 1, 2, 3].some((channel) => Math.abs(a.data[ia + channel] - b.data[ib + channel]) > CHANNEL_THRESHOLD);
      if (changed) different += 1;
      if (image) {
        // Kırmızı = farklı; gerisi "önce" karesinin soluk grisi.
        const o = (y * width + x) * 4;
        const gray = inA ? Math.round((a.data[ia] + a.data[ia + 1] + a.data[ia + 2]) / 12) : 0;
        image[o] = changed ? 255 : gray;
        image[o + 1] = changed ? 0 : gray;
        image[o + 2] = changed ? 0 : gray;
        image[o + 3] = 255;
      }
    }
  }
  if (image && different > 0) {
    await sharp(image, { raw: { width, height, channels: 4 } }).png().toFile(diffFile);
  }
  return { different, percent: (different / (width * height)) * 100 };
}

/** Gizlenen yüzey kutuları farklı mı (2px tolerans)? Medya taşınmış/büyümüş olabilir. */
function masksDiffer(first, second) {
  if (first.length !== second.length) return true;
  const order = (p, q) => p.kind.localeCompare(q.kind) || p.y - q.y || p.x - q.x;
  const sortedB = [...second].sort(order);
  return [...first].sort(order).some((mask, index) => {
    const other = sortedB[index];
    return (
      mask.kind !== other.kind ||
      ["x", "y", "w", "h"].some((key) => Math.abs(mask[key] - other[key]) > 2)
    );
  });
}

/** Sayfa ölçümlerinden h1 ve sayfa düzeyi farkları (bilgi amaçlı). */
function metricNotes(metricsA, metricsB) {
  const notes = [];
  const index = (metrics) =>
    new Map((metrics.pages ?? []).map((record) => [`${record.locale}|${record.slug}|${record.viewport}`, record]));
  const pagesB = index(metricsB);
  for (const [key, recordA] of index(metricsA)) {
    const recordB = pagesB.get(key);
    if (!recordA.metrics || !recordB?.metrics) continue;
    const where = `/${recordA.locale}${recordA.route} ${recordA.viewport}`;
    const h1 = (record) => record.metrics.headings.find((heading) => heading.tag === "h1");
    const [first, second] = [h1(recordA), h1(recordB)];
    for (const field of ["family", "size", "weight", "letterSpacing", "color", "left"]) {
      if (first && second && first[field] !== second[field]) {
        notes.push(`${where}: h1 ${field} ${first[field]} → ${second[field]}`);
      }
    }
    for (const field of ["horizontalOverflow", "mainCount", "h1Count"]) {
      if (recordA.metrics[field] !== recordB.metrics[field]) {
        notes.push(`${where}: ${field} ${recordA.metrics[field]} → ${recordB.metrics[field]}`);
      }
    }
    const fuchsia = (record) => record.metrics.fuchsiaText.length;
    if (fuchsia(recordA) !== fuchsia(recordB)) {
      notes.push(`${where}: 4+ karakterlik fuşya metin ${fuchsia(recordA)} → ${fuchsia(recordB)}`);
    }
  }
  return notes;
}

function pad(value, width, alignRight = false) {
  const text = String(value);
  return alignRight ? text.padStart(width) : text.padEnd(width);
}

async function compare(values) {
  if (!values.a || !values.b) usage("--a ve --b gerekli");
  if (values.base || values.out || values.routes || values.group || values["block-fonts"]) {
    usage("--base/--out/--routes/--group/--block-fonts shoot içindir");
  }
  const threshold = values.threshold === undefined ? DEFAULT_THRESHOLD : Number(values.threshold);
  if (!Number.isFinite(threshold) || threshold < 0) usage(`Geçersiz eşik: "${values.threshold}"`);
  const excluded = new Set(splitList(values.exclude).map(normalizeRoute).map(slugOf));
  const dirA = path.resolve(values.a);
  const dirB = path.resolve(values.b);
  const diffDir = values["diff-dir"] ? path.resolve(values["diff-dir"]) : null;
  if (diffDir) fs.mkdirSync(diffDir, { recursive: true });

  const shotA = readShootDir(dirA);
  const shotB = readShootDir(dirB);
  // Yazım hatalı --exclude rotası sessizce kabul edilmesin.
  const knownSlugs = new Set([...shotA.routes.keys(), ...shotB.routes.keys()]);
  for (const slug of excluded) {
    if (!knownSlugs.has(slug)) usage(`--exclude rotası çekimlerde yok: "${slug}"`);
  }
  const routeOf = (slug) => shotA.routes.get(slug) ?? shotB.routes.get(slug) ?? slug;
  const names = [...new Set([...shotA.files, ...shotB.files])].sort();
  if (names.length === 0) usage("Karşılaştırılacak kare yok");

  // slug → Map(sütun "tr 1440x900" → hücre). Hücrenin değeri EN KÖTÜ karesi.
  const rows = new Map();
  const columns = new Set();
  const maskWarnings = [];
  for (const [processed, name] of names.entries()) {
    const [, locale, slug, viewport, position] = FILE_PATTERN.exec(name);
    const column = `${locale} ${viewport}`;
    columns.add(column);
    if (!rows.has(slug)) rows.set(slug, new Map());
    const cells = rows.get(slug);
    if (!cells.has(column)) cells.set(column, { worst: 0, worstShot: null, missing: [], shots: 0 });
    const cell = cells.get(column);
    process.stderr.write(`\r  ${processed + 1}/${names.length} kare`);

    if (!shotA.files.has(name) || !shotB.files.has(name)) {
      cell.missing.push(`${position} (${shotA.files.has(name) ? "yalnız A'da" : "yalnız B'de"})`);
      continue;
    }
    const masksA = shotA.shots.get(name)?.masks ?? [];
    const masksB = shotB.shots.get(name)?.masks ?? [];
    if (masksDiffer(masksA, masksB)) {
      maskWarnings.push(`${name}: A ${masksA.length} yüzey, B ${masksB.length} yüzey`);
    }
    const result = await diffImages(
      path.join(dirA, name),
      path.join(dirB, name),
      diffDir ? path.join(diffDir, name) : null,
    );
    cell.shots += 1;
    if (cell.worstShot === null || result.percent > cell.worst) {
      cell.worst = result.percent;
      cell.worstShot = position;
    }
  }
  process.stderr.write("\n");

  const columnList = [...columns].sort();
  const verdict = (slug, cells) => {
    let worst = 0;
    let where = null;
    for (const [column, cell] of cells) {
      if (cell.worstShot !== null && (where === null || cell.worst > worst)) {
        worst = cell.worst;
        where = `${column} ${cell.worstShot}`;
      }
    }
    const missing = [...cells.values()].some((cell) => cell.missing.length > 0);
    if (missing) return { worst, where, status: "EKSİK KARE", failing: true };
    if (worst === 0) return { worst, where, status: "AYNI", failing: false };
    if (worst <= threshold) return { worst, where, status: "EŞİK ALTI", failing: false };
    return { worst, where, status: "EŞİK AŞILDI", failing: true };
  };
  const label = (slug) => {
    const route = routeOf(slug);
    return route === "" ? "/ (ana sayfa)" : route;
  };
  const routeWidth = Math.max(24, ...[...rows.keys()].map((slug) => label(slug).length)) + 2;
  const header =
    pad("Rota", routeWidth) +
    columnList.map((column) => pad(column, 14, true)).join("") +
    "  durum";
  const line = (slug, cells) => {
    const { worst, where, status } = verdict(slug, cells);
    const values = columnList.map((column) => {
      const cell = cells.get(column);
      if (!cell) return pad("—", 14, true);
      if (cell.missing.length) return pad("eksik", 14, true);
      return pad(`${cell.worst.toFixed(3)}%`, 14, true);
    });
    const worstShot = worst > 0 ? ` ← en kötü kare: ${where}` : "";
    return `${pad(label(slug), routeWidth)}${values.join("")}  ${status}${worstShot}`;
  };

  // Satırlar çekimdeki rota sırasıyla (routes.json), bilinmeyenler sonda.
  const order = [...(shotA.metrics.options?.routes ?? []), ...(shotB.metrics.options?.routes ?? [])]
    .map(slugOf);
  const rank = (slug) => (order.includes(slug) ? order.indexOf(slug) : order.length);
  const sorted = [...rows].sort(([p], [q]) => rank(p) - rank(q) || p.localeCompare(q));
  const included = sorted.filter(([slug]) => !excluded.has(slug));
  const expected = sorted.filter(([slug]) => excluded.has(slug));
  console.log(`\nKarşılaştırma: A=${dirA}\n               B=${dirB}`);
  console.log(`Eşik: kare başına %${threshold} · kanal eşiği ${CHANNEL_THRESHOLD}/255 · canvas/video/iframe çekimde gizli\n`);
  console.log(header);
  for (const [slug, cells] of included) console.log(line(slug, cells));
  if (expected.length) {
    console.log("\nBeklenen fark (--exclude, çıkış kodunu etkilemez):");
    for (const [slug, cells] of expected) console.log(line(slug, cells));
  }

  const missingLines = [];
  for (const [slug, cells] of sorted) {
    for (const [column, cell] of cells) {
      for (const item of cell.missing) missingLines.push(`${label(slug)} ${column}: ${item}`);
    }
  }
  if (missingLines.length) {
    console.log(`\nEksik/fazla kareler (sayfa boyu değişmiş olabilir):\n  ${missingLines.slice(0, 40).join("\n  ")}`);
  }
  if (maskWarnings.length) {
    console.log(
      `\nDinamik yüzey (canvas/video) konumu/sayısı değişen kareler — bilgi:\n  ${maskWarnings.slice(0, 20).join("\n  ")}` +
        (maskWarnings.length > 20 ? `\n  … +${maskWarnings.length - 20}` : ""),
    );
  }
  const notes = metricNotes(shotA.metrics, shotB.metrics);
  if (notes.length) {
    console.log(
      `\nÖlçüm farkları (metrics.json) — bilgi:\n  ${notes.slice(0, 40).join("\n  ")}` +
        (notes.length > 40 ? `\n  … +${notes.length - 40}` : ""),
    );
  }

  const failing = included.filter(([slug, cells]) => verdict(slug, cells).failing);
  // Çekimi HATA veren (kare üretmeyen) sayfalar tabloda görünmez; hariç
  // tutulmadıkça başarısızlık sayılır.
  const failedCaptures = [
    ...shotA.failed.map((item) => ({ ...item, side: "A" })),
    ...shotB.failed.map((item) => ({ ...item, side: "B" })),
  ].filter((item) => !excluded.has(item.slug));
  if (failedCaptures.length) {
    console.log(
      `\nÇekimi HATALI sayfalar (karşılaştırılamadı):\n  ${failedCaptures
        .map((item) => `${routeOf(item.slug) || "/"} [${item.side}] ${item.error}`)
        .join("\n  ")}`,
    );
  }
  if (values.json) {
    const report = {
      a: dirA,
      b: dirB,
      threshold,
      channelThreshold: CHANNEL_THRESHOLD,
      routes: sorted.map(([slug, cells]) => ({
        route: routeOf(slug),
        excluded: excluded.has(slug),
        ...verdict(slug, cells),
        cells: Object.fromEntries(cells),
      })),
      maskWarnings,
      metricNotes: notes,
    };
    fs.writeFileSync(path.resolve(values.json), `${JSON.stringify(report, null, 2)}\n`);
  }
  const bad = failing.length + failedCaptures.length;
  console.log(
    bad
      ? `\nSONUÇ: ${failing.length} rota eşiği aştı ya da karesi eksik, ${failedCaptures.length} sayfanın çekimi hatalı → çıkış 1`
      : `\nSONUÇ: hariç tutulmayan ${included.length} rotada eşik aşılmadı → çıkış 0`,
  );
  return bad ? 1 : 0;
}

// ----------------------------------------------------------------- main

async function main() {
  let parsed;
  try {
    parsed = parseArgs({
      allowPositionals: true,
      options: {
        help: { type: "boolean", short: "h" },
        base: { type: "string" },
        out: { type: "string" },
        routes: { type: "string" },
        group: { type: "string" },
        locales: { type: "string" },
        viewports: { type: "string" },
        "block-fonts": { type: "boolean" },
        a: { type: "string" },
        b: { type: "string" },
        exclude: { type: "string" },
        threshold: { type: "string" },
        "diff-dir": { type: "string" },
        json: { type: "string" },
      },
    });
  } catch (error) {
    throw new UsageError(error instanceof Error ? error.message : String(error));
  }
  const { values, positionals } = parsed;
  const [command] = positionals;
  if (values.help || !command || command === "help") {
    console.log(HELP);
    return values.help || command === "help" ? 0 : 2;
  }
  if (positionals.length > 1) usage(`Fazla argüman: ${positionals.slice(1).join(" ")}`);
  if (command === "shoot") return shoot(values);
  if (command === "compare") return compare(values);
  return usage(`Bilinmeyen komut: "${command}" (shoot | compare)`);
}

main().then(
  (code) => {
    process.exitCode = code;
  },
  (error) => {
    if (error instanceof UsageError) {
      console.error(`HATA: ${error.message}\nYardım: node scripts/design-audit.mjs --help`);
      process.exitCode = 2;
      return;
    }
    console.error(error);
    process.exitCode = 1;
  },
);
