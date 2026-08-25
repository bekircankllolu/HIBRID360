import { describe, expect, it } from "vitest";
import {
  breadcrumbListJsonLd,
  organizationJsonLd,
  videoObjectJsonLd,
} from "@/lib/schema";
import { SITE_URL } from "@/lib/site";

/**
 * schema.org üreticileri. Bunların bozulduğu sessizce fark edilmez —
 * sayfa normal render olur, yalnızca arama motoru/AI tarafındaki
 * yapılandırılmış veri yanlış olur (brief 1.7, GEO görünürlüğü).
 *
 * Özellikle korunan iki davranış: BreadcrumbList pozisyonlarının 1'den
 * başlaması (schema.org 0-tabanlı kabul etmez) ve item URL'lerinin mutlak
 * olması (göreli URL geçersiz sayılır).
 */

describe("breadcrumbListJsonLd", () => {
  it("pozisyonları 1'den başlatır ve sırayı korur", () => {
    const json = breadcrumbListJsonLd("tr", [
      { name: "Home", path: "" },
      { name: "Work", path: "/work" },
      { name: "Örnek", path: "/work/ornek" },
    ]);

    expect(json.itemListElement.map((i) => i.position)).toEqual([1, 2, 3]);
    expect(json.itemListElement.map((i) => i.name)).toEqual([
      "Home",
      "Work",
      "Örnek",
    ]);
  });

  it("item URL'lerini mutlak ve locale önekli üretir", () => {
    const json = breadcrumbListJsonLd("en", [{ name: "Work", path: "/work" }]);

    expect(json.itemListElement[0].item).toBe(`${SITE_URL}/en/work`);
    expect(json.itemListElement[0].item.startsWith("https://")).toBe(true);
  });

  it("boş listede geçerli ama boş bir BreadcrumbList döner", () => {
    const json = breadcrumbListJsonLd("tr", []);

    expect(json["@type"]).toBe("BreadcrumbList");
    expect(json.itemListElement).toEqual([]);
  });
});

describe("organizationJsonLd", () => {
  it("locale'e göre url üretir, @id'yi locale'den bağımsız tutar", () => {
    const tr = organizationJsonLd("tr");
    const en = organizationJsonLd("en");

    expect(tr.url).toBe(`${SITE_URL}/tr`);
    expect(en.url).toBe(`${SITE_URL}/en`);
    // @id tekil varlık kimliği — iki dilde aynı kurumu göstermeli.
    expect(tr["@id"]).toBe(en["@id"]);
  });

  it("hem Organization hem LocalBusiness olarak tiplenir", () => {
    expect(organizationJsonLd("tr")["@type"]).toEqual([
      "Organization",
      "LocalBusiness",
    ]);
  });
});

describe("videoObjectJsonLd", () => {
  const base = {
    name: "Örnek film",
    description: "Açıklama",
    thumbnailUrl: "https://example.com/poster.jpg",
    uploadDate: "2026-01-01",
  };

  it("opsiyonel alanlar verilmezse anahtarı hiç eklemez", () => {
    const json = videoObjectJsonLd(base);

    // undefined bir değer yazmak yerine anahtarın bulunmaması gerekiyor:
    // JSON-LD'de `"contentUrl": undefined` serileştirmede kaybolur ama
    // boş string yazılırsa geçersiz veri yayınlanmış olur.
    expect("contentUrl" in json).toBe(false);
    expect("embedUrl" in json).toBe(false);
  });

  it("verilen opsiyonel alanları ekler", () => {
    const json = videoObjectJsonLd({
      ...base,
      contentUrl: "https://example.com/v.mp4",
    });

    expect(json).toMatchObject({ contentUrl: "https://example.com/v.mp4" });
    expect("embedUrl" in json).toBe(false);
  });
});
