/**
 * Metin kontrastı taraması — WCAG AA, DOM üzerinden ölçülür.
 *
 *   node scripts/audit-contrast.mjs [taban-url]
 *
 * NEDEN BU ARAÇ VAR (19 Eylül 2026): Friends sayfasındaki
 * "WORK WITH THE CHAMPIONS" başlığı SARI ZEMİN ÜZERİNDE SARI çıkıyordu,
 * yani hiç görünmüyordu. Kullanıcı bunu "çok büyük bir boşluk var" diye
 * bildirdi — boşluk sanılan şey görünmeyen başlıktı.
 *
 * Kök neden sistemik: `globals.css` içinde `h1, h2, h3 { color:
 * var(--color-brand-yellow) }` var. Sarı zeminli bir panelde başlık rengi
 * ayrıca ezilmezse başlık kayboluyor. Sitede 20'den fazla sarı zeminli
 * blok olduğu için tek tek CSS okuyarak aramak güvenilir değil; bu araç
 * TARAYICIDA hesaplanmış renkleri ölçüyor.
 *
 * Ölçüm: her metin düğümü için hesaplanmış `color`, ve arka plan için
 * saydam olmayan ilk ata elemanın `background-color`'ı. Alfa varsa ata
 * zemine karıştırılıyor. Eşik WCAG AA: normal metin 4.5:1, büyük metin
 * (>=24px, ya da >=18.66px + kalın) 3:1.
 *
 * SINIRI: görsel/video üzerindeki metni ölçmez (arka plan renk değil,
 * piksel). O durum ayrı bir taramanın işi; burada yalnız düz renk
 * zeminler bağlanıyor.
 */

import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3100";

const ROUTES = [
  "/tr",
  "/tr/work",
  "/tr/what-we-do",
  "/tr/what-we-do/creative",
  "/tr/what-we-do/production",
  "/tr/what-we-do/post-production",
  "/tr/what-we-do/digital",
  "/tr/what-we-do/live-broadcast",
  "/tr/what-we-do/cloud-tv",
  "/tr/what-we-do/event-management",
  "/tr/what-we-do/ai-creative-production",
  "/tr/what-we-do/how-we-work",
  "/tr/what-we-do/service-production",
  "/tr/culture",
  "/tr/culture/directors",
  "/tr/culture/sustainability",
  "/tr/who-we-are",
  "/tr/what-we-believe",
  "/tr/partners",
  "/tr/clients",
  "/tr/think-and-thank",
  "/tr/insights",
  "/tr/contact",
  "/tr/solutions",
  "/tr/yok-boyle-bir-sayfa",
];

/** sRGB bağıl parlaklık (WCAG). */
function luminance([r, g, b]) {
  const channel = (value) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => {
  try {
    window.localStorage.setItem(
      "hibrid360-consent",
      JSON.stringify({ necessary: true, analytics: false, decidedAt: "2026-01-01T00:00:00.000Z" }),
    );
  } catch {
    /* özel pencere: banner kalır, tarama yine çalışır */
  }
});

const findings = [];

for (const route of ROUTES) {
  const response = await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
  if (!response || response.status() >= 500) {
    console.log(`ATLANDI ${route} (${response?.status()})`);
    continue;
  }
  await page.waitForTimeout(400);

  const samples = await page.evaluate(() => {
    const parse = (value) => {
      const m = /rgba?\(([^)]+)\)/.exec(value);
      if (!m) return null;
      const parts = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
      return { rgb: parts.slice(0, 3), a: parts.length > 3 ? parts[3] : 1 };
    };

    /** Saydam olmayan ilk ata zemini; alfa varsa üstüne karıştırır. */
    const backgroundOf = (element) => {
      const stack = [];
      let node = element;
      while (node && node !== document.documentElement) {
        const bg = parse(getComputedStyle(node).backgroundColor);
        if (bg && bg.a > 0) {
          stack.push(bg);
          if (bg.a >= 0.999) break;
        }
        node = node.parentElement;
      }
      let base = [0, 0, 0];
      for (let i = stack.length - 1; i >= 0; i -= 1) {
        const { rgb, a } = stack[i];
        base = base.map((c, k) => Math.round(rgb[k] * a + c * (1 - a)));
      }
      return base;
    };

    const out = [];
    for (const element of document.querySelectorAll("body *")) {
      // Yalnız KENDİ metnini taşıyan elemanlar: iç içe sayım olmasın.
      const own = [...element.childNodes]
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent.trim())
        .join(" ")
        .trim();
      if (own.length < 2) continue;

      const rect = element.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) continue;

      const cs = getComputedStyle(element);
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      if (Number(cs.opacity) < 0.15) continue;
      // Görsel/video üzerindeki metin bu aracın kapsamı dışında.
      if (cs.backgroundImage !== "none" && cs.backgroundImage.includes("url(")) continue;

      const fg = parse(cs.color);
      if (!fg || fg.a < 0.15) continue;

      const bg = backgroundOf(element);
      const blended = fg.rgb.map((c, k) => Math.round(c * fg.a + bg[k] * (1 - fg.a)));
      const size = parseFloat(cs.fontSize);
      const weight = Number(cs.fontWeight) || 400;
      const large = size >= 24 || (size >= 18.66 && weight >= 700);

      out.push({
        text: own.slice(0, 60),
        tag: element.tagName.toLowerCase(),
        cls: (element.className || "").toString().slice(0, 48),
        fg: blended,
        bg,
        size: Math.round(size),
        large,
      });
    }
    return out;
  });

  for (const s of samples) {
    const ratio = contrast(s.fg, s.bg);
    const threshold = s.large ? 3 : 4.5;
    if (ratio < threshold) {
      findings.push({ route, ratio: Number(ratio.toFixed(2)), threshold, ...s });
    }
  }
}

await browser.close();

findings.sort((a, b) => a.ratio - b.ratio);

if (findings.length === 0) {
  console.log("Kontrast taraması temiz — AA eşiğinin altında metin yok.");
} else {
  console.log(`${findings.length} sorun:\n`);
  for (const f of findings) {
    console.log(
      `${f.ratio.toFixed(2)}:1 (gereken ${f.threshold})  ${f.route}\n` +
        `    <${f.tag} class="${f.cls}"> ${f.size}px\n` +
        `    metin: "${f.text}"\n` +
        `    renk rgb(${f.fg}) / zemin rgb(${f.bg})\n`,
    );
  }
  process.exitCode = 1;
}
