import { describe, expect, it } from "vitest";

import { SERVICE_CATALOG } from "@/data/services";
import {
  chapterDegree,
  chapterOf,
  formatDegree,
  nextChapter,
} from "@/lib/service-chapter";

/**
 * Service Chapter 360° derece sistemi (DECISIONS #33).
 *
 * Katalogdaki 8 servis çemberi 45°'lik eşit dilimlere böler. Derece
 * katalog sırasından TÜRETİLİR — ayrı bir alan olarak saklanmaz — bu
 * yüzden testler sıranın ve sarmanın (son → ilk) sessizce kaymasını
 * engelliyor.
 */

describe("chapterDegree", () => {
  it("katalog sırasını 45°'lik dilimlere çevirir", () => {
    expect(chapterDegree("creative")).toBe(0);
    expect(chapterDegree("production")).toBe(45);
    expect(chapterDegree("aiCreativeProduction")).toBe(315);
  });

  it("sekiz derecenin tümü benzersiz ve 45'in katı", () => {
    const degrees = SERVICE_CATALOG.map((service) => chapterDegree(service.id));
    expect(new Set(degrees).size).toBe(SERVICE_CATALOG.length);
    for (const degree of degrees) {
      expect(degree % 45).toBe(0);
      expect(degree).toBeGreaterThanOrEqual(0);
      expect(degree).toBeLessThan(360);
    }
  });
});

describe("chapterOf", () => {
  it("kataloğun adını, rotasını ve derecesini birlikte döndürür", () => {
    expect(chapterOf("production")).toEqual({
      id: "production",
      name: "Production",
      href: "/what-we-do/production",
      degree: 45,
    });
  });

  it("bilinmeyen kimlikte sessizce geçmez, hata fırlatır", () => {
    expect(() => chapterOf("photography")).toThrow(/photography/);
  });
});

describe("nextChapter", () => {
  it("Creative'den sonra Production gelir", () => {
    expect(nextChapter("creative").id).toBe("production");
  });

  it("son servisten sonra çember başa döner", () => {
    expect(nextChapter("aiCreativeProduction").id).toBe("creative");
  });
});

describe("formatDegree", () => {
  it("üç haneli ve derece işaretli yazar", () => {
    expect(formatDegree(0)).toBe("000°");
    expect(formatDegree(45)).toBe("045°");
    expect(formatDegree(315)).toBe("315°");
  });

  it("tam turu ve negatif açıyı çembere geri sarar", () => {
    expect(formatDegree(360)).toBe("000°");
    expect(formatDegree(-45)).toBe("315°");
  });
});
