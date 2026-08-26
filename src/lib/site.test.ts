import { describe, expect, it } from "vitest";
import { localizedAlternates } from "@/lib/site";

describe("localizedAlternates", () => {
  it("locale root için canonical ve hreflang yollarını birlikte üretir", () => {
    expect(localizedAlternates("tr")).toEqual({
      canonical: "/tr",
      languages: {
        tr: "/tr",
        en: "/en",
        "x-default": "/tr",
      },
    });
  });

  it("alt sayfalar için aynı path'i tüm dillere taşır", () => {
    expect(localizedAlternates("en", "/work")).toEqual({
      canonical: "/en/work",
      languages: {
        tr: "/tr/work",
        en: "/en/work",
        "x-default": "/tr/work",
      },
    });
  });

  it("başında slash olmayan path'i normalize eder", () => {
    expect(localizedAlternates("tr", "what-we-do/production").canonical).toBe(
      "/tr/what-we-do/production",
    );
  });
});
