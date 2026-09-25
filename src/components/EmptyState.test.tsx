// @vitest-environment jsdom
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import trMessages from "@/messages/tr.json";
import { EmptyState } from "./EmptyState";
import styles from "./EmptyState.module.css";

/**
 * EmptyState hiza sözleşmesi (Faz 2 / B1): `align` verilmezse bugünkü ortalı
 * kutu (Production, Live Broadcast ve diğer çağıranlar değişmemeli); "start"
 * yalnız sola yaslı sınıfı ekler. Metin gerçek TR sözlüğünden.
 */
function render(node: ReactElement): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(
    <NextIntlClientProvider locale="tr" messages={trMessages}>
      {node}
    </NextIntlClientProvider>,
  );
  const root = host.firstElementChild;
  if (!(root instanceof HTMLElement)) throw new Error("render boş döndü");
  return root;
}

describe("EmptyState", () => {
  it("varsayılan ortalı: sola yaslı sınıf yok, durum rolü ve metin yerinde", () => {
    const root = render(<EmptyState message="Liste hazırlanıyor." />);

    expect(root.getAttribute("role")).toBe("status");
    expect(root.dataset.align).toBe("center");
    expect(root.classList.contains(styles.emptyState)).toBe(true);
    expect(root.classList.contains(styles.emptyStateStart)).toBe(false);
    expect(root.textContent).toBe(`${trMessages.common.pendingLabel}Liste hazırlanıyor.`);
  });

  it('align="start" sola yaslı sınıfı ekler, compact ile birleşebilir', () => {
    const start = render(<EmptyState message="Liste hazırlanıyor." align="start" />);
    expect(start.dataset.align).toBe("start");
    expect(start.classList.contains(styles.emptyStateStart)).toBe(true);
    expect(start.classList.contains(styles.emptyStateCompact)).toBe(false);

    const both = render(<EmptyState message="Liste hazırlanıyor." align="start" compact />);
    expect(both.classList.contains(styles.emptyStateStart)).toBe(true);
    expect(both.classList.contains(styles.emptyStateCompact)).toBe(true);
  });

  it("sınıf listesinde boş parça yok", () => {
    const root = render(<EmptyState message="Liste hazırlanıyor." />);
    expect(root.className).toBe(styles.emptyState);
  });
});
