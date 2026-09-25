// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ReactElement } from "react";
import { preload } from "react-dom";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CHAPTER_FONT_URL } from "@/lib/chapter-font";
import { needsTallLeading, splitTitle, titleFit, type TitleLang } from "@/lib/page-title";
import { PageTitle } from "./PageTitle";
import styles from "./PageTitle.module.css";

/**
 * PageTitle sözleşmesi (Faz 2 / B0). Sunucu render'ı, gerçek işaretleme:
 *  - tek h1, `lang` çağırandan; satırlar arasında gerçek boşluk (e2e
 *    `toHaveText` "THE ART OF TEAMWORK" gibi tam metne güveniyor);
 *  - renk sınıfı: tek satır beyaz, 2+ satırda yalnız sonuncu sarı;
 *  - `--title-fit` = `titleFit` (punto bununla kaba sığar), boş başlıkta yok;
 *  - başlık fontu fonts.css'teki adresle önden istenir.
 * Satır kutularının gerçekten sığdığı tarayıcıda ölçülür (B0 doğrulama turu).
 *
 * `preload` React 19'un (Next App Router) API'si; vitest'teki react-dom 18'de
 * yok. Modülün geri kalanı gerçek, yalnız `preload` taklit: böylece
 * PageTitle → preloadChapterFont → preload zinciri adres ve seçenekleriyle
 * birlikte doğrulanıyor.
 */
vi.mock("react-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-dom")>()),
  preload: vi.fn(),
}));

/** Sunucu çıktısını ayrıştırır; kök = başlığın kabı. */
function render(node: ReactElement): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(node);
  const box = host.firstElementChild;
  if (!(box instanceof HTMLElement)) throw new Error("render boş döndü");
  return box;
}

function headingOf(box: HTMLElement): HTMLHeadingElement {
  const heading = box.querySelector("h1");
  if (!heading) throw new Error("h1 yok");
  return heading;
}

function linesOf(box: HTMLElement): HTMLElement[] {
  return Array.from(headingOf(box).children) as HTMLElement[];
}

/** Kabın satır içi `--title-fit` değeri; yazılmamışsa null. */
function fitOf(box: HTMLElement): number | null {
  const match = /--title-fit:\s*([\d.]+)/.exec(box.getAttribute("style") ?? "");
  return match ? Number(match[1]) : null;
}

const hasClass = (element: Element, className: string) =>
  element.className.split(/\s+/).includes(className);

describe("PageTitle", () => {
  beforeEach(() => {
    vi.mocked(preload).mockClear();
  });

  it("tek h1; lang çağırandan; satırlar block span, aralarında gerçek boşluk", () => {
    const box = render(<PageTitle lines={["THE ART OF", "TEAMWORK"]} lang="en" />);
    const heading = headingOf(box);

    expect(box.querySelectorAll("h1")).toHaveLength(1);
    expect(hasClass(box, styles.box)).toBe(true);
    expect(heading.getAttribute("lang")).toBe("en");
    expect(heading.textContent).toBe("THE ART OF TEAMWORK");
    expect(Array.from(heading.childNodes, (node) => node.nodeName)).toEqual([
      "SPAN",
      "#text",
      "SPAN",
    ]);
    expect(heading.childNodes[1].textContent).toBe(" ");
    for (const line of linesOf(box)) expect(hasClass(line, styles.line)).toBe(true);
  });

  it("tek satır beyaz: vurgu sınıfı yok", () => {
    const box = render(<PageTitle text="CULTURE" lang="en" />);

    expect(linesOf(box)).toHaveLength(1);
    expect(box.getElementsByClassName(styles.accent)).toHaveLength(0);
  });

  it("2+ satırda yalnız SON satır sarı", () => {
    const box = render(<PageTitle lines={["BUILT", "FOR THE", "FEED."]} lang="en" />);
    const lines = linesOf(box);

    expect(lines.map((line) => hasClass(line, styles.accent))).toEqual([false, false, true]);
    expect(headingOf(box).textContent).toBe("BUILT FOR THE FEED.");
  });

  it("kademe data-tier'a yazılır; varsayılan xl", () => {
    expect(headingOf(render(<PageTitle text="PARTNERS" lang="en" />)).dataset.tier).toBe("xl");
    for (const tier of ["xl", "l", "sentence"] as const) {
      const box = render(<PageTitle text="PARTNERS" lang="en" tier={tier} />);
      expect(headingOf(box).dataset.tier).toBe(tier);
    }
  });

  it("--title-fit = titleFit(satırlar, lang), yalnız yukarı yuvarlanmış", () => {
    const samples: ReadonlyArray<{ lines: readonly string[]; lang: TitleLang }> = [
      { lines: ["Sürdürülebilirlik"], lang: "tr" },
      { lines: ["KADRAJIN", "ARKASINDAKİLER."], lang: "tr" },
      { lines: ["THE ART OF", "TEAMWORK"], lang: "en" },
      { lines: ["SHOOT IN TÜRKIYE.", "WITH A CREW THAT ALREADY KNOWS THE WAY."], lang: "en" },
    ];
    for (const { lines, lang } of samples) {
      const expected = titleFit(lines, lang);
      const actual = fitOf(render(<PageTitle lines={lines} lang={lang} />));

      expect(actual, lines.join(" ")).not.toBeNull();
      // Aşağı yuvarlama punto büyütür → en uzun kelime kabından taşabilir.
      expect(actual!, lines.join(" ")).toBeGreaterThanOrEqual(expected);
      expect(actual! - expected, lines.join(" ")).toBeLessThan(1e-4);
    }
  });

  it("text verilince splitTitle ile bölünür; textContent metnin kendisi", () => {
    const cases: ReadonlyArray<[text: string, lang: TitleLang]> = [
      ["SHOOT IN TÜRKIYE. WITH A CREW THAT ALREADY KNOWS THE WAY.", "en"],
      ["KADRAJIN ARKASINDAKİLER.", "tr"],
      ["İLETİŞİME GEÇELİM VE BİRLİKTE HARİKA BİR ŞEY BAŞLATALIM", "tr"],
      ["Sürdürülebilirlik", "tr"],
    ];
    for (const [text, lang] of cases) {
      const box = render(<PageTitle text={text} lang={lang} />);

      expect(linesOf(box).map((line) => line.textContent)).toEqual(splitTitle(text, lang));
      expect(headingOf(box).textContent).toBe(text);
      expect(fitOf(box)).toBeCloseTo(titleFit(splitTitle(text, lang), lang), 3);
    }
  });

  it("lines verilince text yok sayılır; boşluk-yalnız satır atlanır", () => {
    const box = render(
      <PageTitle text="SHOOT IN TÜRKIYE. WITH A CREW" lines={["NO BLACK", "BOX.", " "]} lang="en" />,
    );
    const lines = linesOf(box);

    expect(lines.map((line) => line.textContent)).toEqual(["NO BLACK", "BOX."]);
    expect(hasClass(lines[1], styles.accent)).toBe(true);
    expect(fitOf(box)).toBeCloseTo(titleFit(["NO BLACK", "BOX."], "en"), 3);
  });

  it("boş başlık: satır yok, --title-fit yazılmaz (calc(100cqw / 0) olmasın)", () => {
    for (const node of [
      <PageTitle key="text" text="   " lang="tr" />,
      <PageTitle key="lines" lines={[]} lang="en" />,
    ]) {
      const box = render(node);
      expect(linesOf(box)).toHaveLength(0);
      expect(box.hasAttribute("style")).toBe(false);
    }
  });

  it("data-tall ekranda çizilen büyük harfe bakar: dil yanlışsa sonuç da yanlış", () => {
    const cases: ReadonlyArray<[text: string, lang: TitleLang, tall: boolean]> = [
      ["Sürdürülebilirlik", "tr", true],
      ["BİZ KİMİZ", "tr", true],
      ["SHOOT IN TÜRKIYE. WITH A CREW THAT ALREADY KNOWS THE WAY.", "en", true],
      ["WHO WE ARE", "en", false],
      ["THE ART OF TEAMWORK", "en", false],
      // TR sayfadaki İngilizce ad: "en" ile I, "tr" ile İ çizilir.
      ["Brief Builder", "en", false],
      ["Brief Builder", "tr", true],
    ];
    for (const [text, lang, tall] of cases) {
      const heading = headingOf(render(<PageTitle text={text} lang={lang} />));

      expect(heading.dataset.tall, `${text} (${lang})`).toBe(String(tall));
      expect(needsTallLeading(text, lang)).toBe(tall);
    }
  });

  it("id h1'e, className kaba gider", () => {
    const box = render(<PageTitle text="SOLUTIONS" lang="en" id="page-title" className="extra" />);

    expect(headingOf(box).id).toBe("page-title");
    expect(hasClass(box, "extra")).toBe(true);
    expect(hasClass(box, styles.box)).toBe(true);
    expect(headingOf(box).className).toBe(styles.title);
  });

  it("başlık fontunu fonts.css'teki @font-face adresiyle önden ister", () => {
    render(<PageTitle text="WHO WE ARE" lang="en" />);

    expect(preload).toHaveBeenCalledTimes(1);
    expect(preload).toHaveBeenCalledWith(CHAPTER_FONT_URL, {
      as: "font",
      type: "font/woff2",
      crossOrigin: "anonymous",
    });
    // Adres kayarsa preload eşleşmez ve dosya iki kez iner.
    const fontsCss = readFileSync(join(process.cwd(), "src/styles/fonts.css"), "utf8");
    expect(fontsCss).toContain(`url("${CHAPTER_FONT_URL}")`);
  });
});
