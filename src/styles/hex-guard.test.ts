import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import baseline from "./hex-baseline.json";

/**
 * Renk literali bekçisi — RATCHET (Faz 2, B0).
 *
 * Marka kuralı (CLAUDE.md): marka renklerinin dışında hardcoded renk yok,
 * her şey `tokens.css`'teki değişkenlerden gelir. Faz 2 denetimi bugün
 * sayfalarda token dışı griler (#050505–#151515) ve elle yazılmış
 * `rgba(255, 255, 255, .12–.9)` buldu; gruplar (B1…B9) bunları
 * `--surface-1/-2`, `--color-hairline`, `--text-muted` ve marka
 * değişkenlerine taşıyacak.
 *
 * Bu test o işi ZORLAMAZ, yalnız geri kaymayı engeller: her CSS dosyasındaki
 * renk literali sayısı `hex-baseline.json`'daki sayıyı AŞAMAZ, listede
 * olmayan dosyada literal OLAMAZ. Sayı baseline'ın altına inerse test geçer;
 * baseline'ı her grup kendi dosyaları için ELLE düşürür (asla artırılmaz).
 *
 * Sayılanlar (yorumlar hariç): `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA` ve
 * `rgb()/rgba()/hsl()/hsla()` + modern renk fonksiyonları (hwb, lab, lch,
 * oklab, oklch, color). Argümanında `var(` geçen fonksiyon literal değildir
 * (`rgb(from var(--x) r g b / .5)` token'dan türer); `color-mix(...)` hiç
 * sayılmaz — token'la saydamlık için doğru yol o. `url(#id)` SVG
 * referansıdır, renk değil.
 *
 * Serbest dosyalar: `tokens.css` (renklerin kaynağı), `fonts.css` ve yolunda
 * `think-and-thank` geçen her CSS — Think & Thank'in krem/mint/pembe dünyası
 * Faz 2'de aynen kalıyor (kullanıcı kararı).
 *
 * Kapsam `src/**\/*.css`: TS içindeki renkler (WebGL/Three.js değerleri,
 * JS yedek renkleri) bu bekçinin konusu değil.
 */

const ROOT = process.cwd();
const BASELINE: Readonly<Record<string, number>> = baseline.files;

const RATCHET_NOTE =
  "Yeni renk için tokens.css'teki değişkenleri kullanın (var(--color-brand-*), " +
  "--color-hairline, --text-muted, --surface-*, color-mix(...)). Bu bir ratchet: " +
  "src/styles/hex-baseline.json yalnız AŞAĞI çekilir — bir grup (B1…B9) renkleri " +
  "token'a taşıdığında o dosyanın sayısını elle düşürün; sayıyı asla artırmayın.";

const HEX = /(?<![\w&#-])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\w-])/gi;
const COLOR_FUNCTION = /(?<![\w-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/gi;

function isExempt(file: string): boolean {
  return (
    file === "src/styles/tokens.css" ||
    file === "src/styles/fonts.css" ||
    file.includes("think-and-thank")
  );
}

/** Açılan parantezin kapandığı yere kadarki argüman metni. */
function argumentsFrom(css: string, open: number): string {
  let depth = 0;
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === "(") depth += 1;
    else if (css[index] === ")" && --depth === 0) return css.slice(open + 1, index);
  }
  return css.slice(open + 1);
}

/** Bir CSS metnindeki renk literali sayısı (yorumlar hariç). */
function countColorLiterals(source: string): number {
  const css = source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/url\(\s*(["']?)#[^)]*\)/gi, "url()");
  const hex = css.match(HEX)?.length ?? 0;
  let functions = 0;
  for (const match of css.matchAll(COLOR_FUNCTION)) {
    const open = (match.index ?? 0) + match[0].length - 1;
    // Yalnız göreli renk sözdizimi (`rgb(from var(--x) r g b)`) literal sayılmaz;
    // `rgba(255 255 255 / var(--a))` gerçek bir renk literalidir.
    if (!/^\s*from\s+var\(/i.test(argumentsFrom(css, open))) functions += 1;
  }
  return hex + functions;
}

function cssFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return cssFiles(full);
    return entry.name.endsWith(".css") ? [full] : [];
  });
}

/** Serbest olmayan her CSS dosyası → renk literali sayısı (depo köküne göre yol). */
function currentCounts(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const full of cssFiles(path.join(ROOT, "src"))) {
    const file = path.relative(ROOT, full).split(path.sep).join("/");
    if (!isExempt(file)) counts.set(file, countColorLiterals(fs.readFileSync(full, "utf8")));
  }
  return counts;
}

describe("renk literali sayacı", () => {
  it("hex biçimlerini ve renk fonksiyonlarını sayar", () => {
    expect(countColorLiterals("a { color: #fff; border-color: #FFFC00; }")).toBe(2);
    expect(countColorLiterals("a { color: #ffff; background: #ff00ff80; }")).toBe(2);
    expect(countColorLiterals("a { color: rgba(255, 255, 255, 0.55); fill: RGB(0 0 0 / 72%); }")).toBe(2);
    expect(countColorLiterals("a { color: hsl(0 0% 100%); background: oklch(0.9 0.2 100); }")).toBe(2);
  });

  it("yorumları, token türevlerini, color-mix'i ve SVG referanslarını saymaz", () => {
    expect(countColorLiterals("/* #fff rgba(0,0,0,.5) */ a { color: var(--color-brand-white); }")).toBe(0);
    expect(countColorLiterals("a { color: rgb(from var(--color-brand-white) r g b / 0.5); }")).toBe(0);
    expect(
      countColorLiterals("a { color: color-mix(in srgb, var(--color-brand-white) 60%, transparent); }"),
    ).toBe(0);
    expect(countColorLiterals('a { filter: url("#think-title-threshold") url(#fade); }')).toBe(0);
  });

  it("renk olmayan # dizilerini saymaz", () => {
    expect(countColorLiterals("a { grid-area: #12345; } b { content: '#1'; }")).toBe(0);
    expect(countColorLiterals("a { animation-name: fade-in; } #main-nav { color: inherit; }")).toBe(0);
  });
});

describe("renk literali ratchet'ı (hex-baseline.json)", () => {
  const counts = currentCounts();

  it("hiçbir dosya baseline'daki sayısını aşmıyor", () => {
    const over = [...counts]
      .filter(([file, count]) => file in BASELINE && count > BASELINE[file]!)
      .map(([file, count]) => `  ${file}: ${count} > baseline ${BASELINE[file]}`);
    expect(over, `Token dışı renk eklendi:\n${over.join("\n")}\n${RATCHET_NOTE}`).toEqual([]);
  });

  it("baseline'da olmayan dosyada renk literali yok", () => {
    const fresh = [...counts]
      .filter(([file, count]) => !(file in BASELINE) && count > 0)
      .map(([file, count]) => `  ${file}: ${count}`);
    expect(
      fresh,
      `Baseline'da olmayan dosyada renk literali var (yeni dosyada 0 olmalı):\n${fresh.join("\n")}\n${RATCHET_NOTE}`,
    ).toEqual([]);
  });

  it("baseline'da serbest dosya ya da sıfır sayı yok", () => {
    const noise = Object.entries(BASELINE)
      .filter(([file, count]) => isExempt(file) || count <= 0)
      .map(([file, count]) => `  ${file}: ${count}`);
    expect(noise, `Gereksiz baseline satırı (silin):\n${noise.join("\n")}`).toEqual([]);
  });
});
