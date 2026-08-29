import { describe, expect, it } from "vitest";

import en from "@/messages/en.json";
import tr from "@/messages/tr.json";
import { MAIN_NAV, MAIN_NAV_PATHS, SECONDARY_NAV } from "@/data/navigation";
import { SERVICE_CATALOG, SERVICE_PATHS } from "@/data/services";
import { SERVICE_LINKS } from "@/data/service-links";

/**
 * 29 Ağustos 2026 revizyonunun sözleşmesini kilitleyen testler.
 *
 * Hizmet kataloğu ve navigasyon tek veri kaynağı olmakla birlikte, tek
 * satırlık hizmet tanımları hâlâ `messages.whatWeDo.list` içinde ve
 * eşleşme **hizmet adı** üzerinden yapılıyor (SolarSystem.tsx de aynı
 * diziyi okuyor). Bu testler o eşleşmenin sessizce kopmasını engelliyor.
 */

const LOCALE_MESSAGES = { tr, en } as const;

describe("hizmet kataloğu", () => {
  it("müşterinin verdiği sekiz maddeyi bu sırayla içerir", () => {
    expect(SERVICE_CATALOG.map((service) => service.name)).toEqual([
      "Creative",
      "Production",
      "Post Production",
      "Digital",
      "Live Broadcast",
      "Cloud TV",
      "Event Management",
      "AI Creative Production",
    ]);
  });

  it("Photography'yi hizmet olarak listelemez", () => {
    const surfaces = [
      ...SERVICE_CATALOG.map((service) => `${service.name} ${service.href}`),
      ...SERVICE_LINKS.map((link) => `${link.label} ${link.href}`),
      ...MAIN_NAV_PATHS,
    ].join(" ");
    expect(surfaces.toLowerCase()).not.toContain("photograph");
  });

  it("ana sayfa hizmet satırı katalogla birebir aynı sırada", () => {
    expect(SERVICE_LINKS.map((link) => link.href)).toEqual(SERVICE_PATHS);
  });

  it.each(["tr", "en"] as const)(
    "%s: her hizmetin whatWeDo.list içinde tanımı var",
    (locale) => {
      const list = LOCALE_MESSAGES[locale].whatWeDo.list;
      expect(list).toHaveLength(SERVICE_CATALOG.length);

      for (const service of SERVICE_CATALOG) {
        const entry = list.find((item) => item.title === service.name);
        expect(entry, `"${service.name}" için tanım yok`).toBeDefined();
        expect(entry?.body.trim().length).toBeGreaterThan(0);
      }
    },
  );
});

describe("navigasyon", () => {
  it("üst menü müşterinin verdiği yedi maddeyi bu sırayla içerir", () => {
    expect(MAIN_NAV.map((item) => item.href)).toEqual([
      "/who-we-are",
      "/what-we-do",
      "/what-we-believe",
      "/solutions",
      "/clients",
      "/partners",
      "/contact",
    ]);
    expect(MAIN_NAV.map((item) => item.order)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("Work üst menüde değil ama ikincil rota olarak yaşıyor", () => {
    expect(MAIN_NAV_PATHS).not.toContain("/work");
    expect(SECONDARY_NAV.map((item) => item.href)).toContain("/work");
  });

  it("mega menü yalnızca What We Do'da ve hizmet kataloğundan gelir", () => {
    const withChildren = MAIN_NAV.filter((item) => item.children);
    expect(withChildren).toHaveLength(1);
    expect(withChildren[0].href).toBe("/what-we-do");
    expect(withChildren[0].children?.map((child) => child.href)).toEqual(
      SERVICE_PATHS,
    );
  });

  it.each(["tr", "en"] as const)("%s: her menü maddesinin etiketi var", (locale) => {
    const nav = LOCALE_MESSAGES[locale].nav as Record<string, string>;
    for (const item of MAIN_NAV) {
      expect(nav[item.labelKey], `nav.${item.labelKey} eksik`).toBeTruthy();
    }
  });

  it("TR menüsü Türkçe, EN menüsü İngilizce etiket kullanır", () => {
    // Müşteri revizyonu: "Türkçe karşılıklarını TR locale'de kullan."
    expect(tr.nav.whoWeAre).toBe("Biz Kimiz");
    expect(tr.nav.clients).toBe("Müşteriler");
    expect(en.nav.whoWeAre).toBe("Who We Are");
    expect(en.nav.clients).toBe("Clients");
  });

  it("etiketler Title Case — başlıkta text-transform yok", () => {
    // Header.module.css'te `text-transform` YOK: görünen metin doğrudan
    // etiketin kendisi. Etiketler Header.tsx'ten mesaj dosyasına taşınırken
    // görünür tasarımın değişmemesi buna bağlı; tamamı büyük harfe
    // çevrilirse menü görünümü sessizce bozulur.
    for (const locale of ["tr", "en"] as const) {
      const nav = LOCALE_MESSAGES[locale].nav as Record<string, string>;
      for (const item of MAIN_NAV) {
        const label = nav[item.labelKey];
        expect(
          label,
          `nav.${item.labelKey} (${locale}) tamamen büyük harf`,
        ).not.toBe(label.toLocaleUpperCase(locale));
      }
    }
  });
});
