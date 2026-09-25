// @vitest-environment jsdom
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PageHero } from "./PageHero";
import { PageTitle } from "./PageTitle";
import styles from "./PageHero.module.css";

/**
 * PageHero sözleşmesi (Faz 2 / B0): meta satırı (kırıntı + sağ meta) → başlık
 * → lede. Kırıntı LİSTE DEĞİL (`/solutions` e2e'si `main li` sayısını sayıyor),
 * ayraç ekran okuyucudan gizli, lede yalnız verilince, `size` işaretlenir.
 *
 * `@/i18n/navigation` işaretli bir bağlantıyla değiştiriliyor (Button.test.tsx
 * ile aynı gerekçe: next-intl istemci paketi Next dışında çözümlenmiyor).
 * Başlık fontu preload'u burada konu değil (PageTitle.test.tsx).
 */
vi.mock("@/i18n/navigation", async () => {
  const { createElement } = await import("react");
  return {
    Link: (props: { href: string } & Record<string, unknown>) =>
      createElement("a", { ...props, "data-intl-link": "" }),
  };
});
vi.mock("@/lib/chapter-font", () => ({ preloadChapterFont: vi.fn() }));

function render(node: ReactElement): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(node);
  const hero = host.firstElementChild;
  if (!(hero instanceof HTMLElement)) throw new Error("render boş döndü");
  return hero;
}

const TITLE = <PageTitle lines={["NO BLACK", "BOX."]} lang="en" />;

describe("PageHero", () => {
  it("kırıntı <p> içinde bağlantı + metin; li yok; ayraç gizli", () => {
    const hero = render(
      <PageHero
        crumbs={[
          { label: "Hibrid 360", href: "/" },
          { label: "What We Do", href: "/what-we-do", lang: "en" },
          { label: "How We Work", lang: "en" },
        ]}
        title={TITLE}
      />,
    );
    const crumbs = hero.getElementsByClassName(styles.crumbs)[0];

    expect(hero.tagName).toBe("HEADER");
    expect(hero.querySelectorAll("li, ol, ul")).toHaveLength(0);
    expect(crumbs.tagName).toBe("P");
    expect(crumbs.textContent).toBe("Hibrid 360 / What We Do / How We Work");

    const links = Array.from(crumbs.querySelectorAll("a[data-intl-link]"));
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/", "/what-we-do"]);
    expect(links[1].getAttribute("lang")).toBe("en");
    // Marka adı `lang` verilmese de İngilizce işaretlenir: TR sayfada büyük harfe
    // çevrilince "HİBRİD 360" olmasın (tek marka yazımı kuralı).
    expect(links[0].getAttribute("lang")).toBe("en");

    const slashes = Array.from(crumbs.querySelectorAll('[aria-hidden="true"]'));
    expect(slashes.map((slash) => slash.textContent)).toEqual(["/", "/"]);

    const current = crumbs.lastElementChild;
    expect(current?.tagName).toBe("SPAN");
    expect(current?.getAttribute("lang")).toBe("en");
  });

  it("meta sağ uçta; kırıntı ve meta yoksa meta satırı (ince çizgi) hiç yok", () => {
    const withMeta = render(<PageHero meta={<span>08</span>} title={TITLE} />);
    expect(withMeta.getElementsByClassName(styles.meta)).toHaveLength(1);
    expect(withMeta.getElementsByClassName(styles.aside)[0].textContent).toBe("08");
    expect(withMeta.getElementsByClassName(styles.crumbs)).toHaveLength(0);

    const bare = render(<PageHero title={TITLE} />);
    expect(bare.getElementsByClassName(styles.meta)).toHaveLength(0);
  });

  it("başlık yuvasında tek h1", () => {
    const hero = render(<PageHero crumbs={[{ label: "Culture" }]} title={TITLE} />);
    expect(hero.querySelectorAll("h1")).toHaveLength(1);
    expect(hero.getElementsByClassName(styles.title)[0].querySelector("h1")?.textContent).toBe(
      "NO BLACK BOX.",
    );
  });

  it("lede yalnız verilince; children ondan sonra", () => {
    expect(render(<PageHero title={TITLE} />).getElementsByClassName(styles.lede)).toHaveLength(0);

    const hero = render(
      <PageHero title={TITLE} lede="Tek cümle.">
        <a href="#x">CTA</a>
      </PageHero>,
    );
    const ledes = hero.getElementsByClassName(styles.lede);
    expect(ledes).toHaveLength(1);
    expect(ledes[0].tagName).toBe("P");
    expect(ledes[0].textContent).toBe("Tek cümle.");
    expect(ledes[0].nextElementSibling?.textContent).toBe("CTA");
  });

  it("ledeLang lede'e lang yazar (İngilizce lede TR sayfada)", () => {
    const withLang = render(<PageHero title={TITLE} lede="One contact." ledeLang="en" />);
    expect(withLang.getElementsByClassName(styles.lede)[0].getAttribute("lang")).toBe("en");
    const without = render(<PageHero title={TITLE} lede="Tek cümle." />);
    expect(without.getElementsByClassName(styles.lede)[0].hasAttribute("lang")).toBe(false);
  });

  it("size işareti: varsayılan band, screen", () => {
    expect(render(<PageHero title={TITLE} />).dataset.size).toBe("band");
    expect(render(<PageHero title={TITLE} size="screen" />).dataset.size).toBe("screen");
  });
});
