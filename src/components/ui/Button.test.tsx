// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import enMessages from "@/messages/en.json";
import trMessages from "@/messages/tr.json";
import { PrimaryCta } from "@/components/PrimaryCta";
import { Button, isExternalHref } from "./Button";
import styles from "./Button.module.css";

/**
 * Button sözleşmesi (Faz 2 / B0): eleman seçimi `href`'e göre, öznitelikler
 * olduğu gibi geçer, görünüm yalnız variant/size sınıflarından gelir.
 * PrimaryCta bu bileşenin sabit etiketli sarmalayıcısıdır.
 *
 * `@/i18n/navigation` işaretli bir bağlantıyla değiştiriliyor: next-intl'in
 * istemci paketi `next/navigation`'ı uzantısız içe aktarıyor, Node'un ESM
 * çözümleyicisi bunu Next dışında bulamıyor. Böylece test "dahili yol
 * locale'li Link'e, dış adres düz <a>'ya" ayrımını doğrudan görüyor; locale
 * önekinin kendisi next-intl'in işi ve e2e'de (`a[href="/tr/contact"]`)
 * doğrulanıyor.
 */
vi.mock("@/i18n/navigation", async () => {
  const { createElement } = await import("react");
  return {
    Link: (props: { href: string } & Record<string, unknown>) =>
      createElement("a", { ...props, "data-intl-link": "" }),
  };
});

type Locale = "tr" | "en";
const MESSAGES = { tr: trMessages, en: enMessages };

/** Sunucu render'ı — gerçek sağlayıcı, gerçek sözlük (metin uydurulmuyor). */
function render(node: ReactNode, locale: Locale = "tr"): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>
      {node}
    </NextIntlClientProvider>,
  );
  const element = host.firstElementChild;
  if (!(element instanceof HTMLElement)) throw new Error("render boş döndü");
  return element;
}

const classesOf = (element: Element) => element.className.split(/\s+/);
const isIntlLink = (element: Element) => element.hasAttribute("data-intl-link");

describe("Button", () => {
  it("href yoksa type=button olan gerçek bir <button>; varsayılan primary/md", () => {
    const button = render(<Button>Gönder</Button>);

    expect(button.tagName).toBe("BUTTON");
    // Form içinde yanlışlıkla gönderim yapmasın.
    expect(button.getAttribute("type")).toBe("button");
    expect(button.textContent).toBe("Gönder");
    expect(classesOf(button)).toEqual(
      expect.arrayContaining([styles.button, styles.primary, styles.md]),
    );
  });

  it("type, disabled, aria-* ve data-* özniteliklerini geçirir", () => {
    const button = render(
      <Button type="submit" disabled aria-describedby="brief-note" data-step="6">
        Gönder
      </Button>,
    );

    expect(button.getAttribute("type")).toBe("submit");
    expect(button.hasAttribute("disabled")).toBe(true);
    expect(button.getAttribute("aria-describedby")).toBe("brief-note");
    expect(button.getAttribute("data-step")).toBe("6");
  });

  it("dahili yolu locale'li Link'e verir, öznitelikleri geçirir", () => {
    const link = render(
      <Button href="/contact" aria-label="İletişim sayfası" data-cta="band">
        İletişim
      </Button>,
    );

    expect(link.tagName).toBe("A");
    expect(isIntlLink(link)).toBe(true);
    expect(link.getAttribute("href")).toBe("/contact");
    expect(link.getAttribute("aria-label")).toBe("İletişim sayfası");
    expect(link.getAttribute("data-cta")).toBe("band");
    expect(classesOf(link)).toEqual(expect.arrayContaining([styles.button, styles.primary, styles.md]));
  });

  it("dış adresleri Link'e sokmadan, öznitelikleriyle düz <a> olarak basar", () => {
    const whatsapp = render(
      <Button href="https://wa.me/902120000000" target="_blank" rel="noreferrer">
        WhatsApp
      </Button>,
    );
    expect(whatsapp.tagName).toBe("A");
    expect(isIntlLink(whatsapp)).toBe(false);
    expect(whatsapp.getAttribute("href")).toBe("https://wa.me/902120000000");
    expect(whatsapp.getAttribute("target")).toBe("_blank");
    expect(whatsapp.getAttribute("rel")).toBe("noreferrer");

    for (const href of ["mailto:info@example.com", "tel:+902120000000"]) {
      const anchor = render(<Button href={href}>İletişim</Button>);
      expect(isIntlLink(anchor), href).toBe(false);
      expect(anchor.getAttribute("href")).toBe(href);
    }
  });

  it("uygulama rotasını dış adresten ayırır", () => {
    for (const href of ["https://hibrid360.com", "http://x.test", "mailto:a@b.co", "tel:+90", "//cdn.test/a"]) {
      expect(isExternalHref(href), href).toBe(true);
    }
    for (const href of ["/contact", "/what-we-do/creative", "/", "#main-content"]) {
      expect(isExternalHref(href), href).toBe(false);
    }
  });

  it("variant ve size yalnız kendi sınıflarını verir; className eklenir", () => {
    const ghost = render(
      <Button variant="ghost" size="sm" className="extra">
        Geri
      </Button>,
    );
    const classes = classesOf(ghost);
    expect(classes).toEqual(expect.arrayContaining([styles.button, styles.ghost, styles.sm, "extra"]));
    expect(classes).not.toContain(styles.primary);
    expect(classes).not.toContain(styles.md);

    const inverse = render(<Button variant="inverse" href="/contact">Kabul</Button>);
    expect(classesOf(inverse)).toEqual(expect.arrayContaining([styles.inverse, styles.md]));
    expect(classesOf(inverse)).not.toContain(styles.primary);
  });
});

describe("PrimaryCta", () => {
  it("sabit etiketli birincil Button: varsayılan hedef /contact", () => {
    const tr = render(<PrimaryCta />);
    expect(tr.tagName).toBe("A");
    expect(isIntlLink(tr)).toBe(true);
    expect(tr.getAttribute("href")).toBe("/contact");
    expect(tr.textContent).toBe(trMessages.cta.primary);
    expect(classesOf(tr)).toEqual(expect.arrayContaining([styles.button, styles.primary, styles.md]));

    expect(render(<PrimaryCta />, "en").textContent).toBe(enMessages.cta.primary);
  });

  it("hedef sayfaya göre değişir, etiket değişmez", () => {
    const cta = render(<PrimaryCta href="/work" />);
    expect(cta.getAttribute("href")).toBe("/work");
    expect(cta.textContent).toBe(trMessages.cta.primary);
  });
});
