import { describe, expect, it } from "vitest";

import { splitWords } from "@/lib/split-words";

/**
 * Scroll ile yanan metin (ScrollLitText) kelimeleri span'lere böler;
 * aralarındaki gerçek boşluk metni korunur. Bölme hatası ekranda harf
 * kaybı ya da yapışık kelime olarak görünür, bu yüzden TR karakterleri,
 * bölünmez boşluk (NBSP) ve tipografik kesme işareti ayrıca test ediliyor.
 */

describe("splitWords", () => {
  it("kelimelere böler ve geri birleşince özgün cümleyi verir", () => {
    const text = "We clear a creative path for your brand.";
    const words = splitWords(text);
    expect(words).toHaveLength(8);
    expect(words.join(" ")).toBe(text);
  });

  it("Türkçe karakterleri korur", () => {
    expect(splitWords("Trafikte sıkışmış markalara yaratıcı kestirmeler kuruyoruz.")).toEqual([
      "Trafikte",
      "sıkışmış",
      "markalara",
      "yaratıcı",
      "kestirmeler",
      "kuruyoruz.",
    ]);
  });

  it("bölünmez boşluğu (NBSP) kelimenin içinde bırakır", () => {
    expect(splitWords("Hibrid 360 creates")).toEqual(["Hibrid 360", "creates"]);
  });

  it("tipografik kesme işaretini bölmez", () => {
    expect(splitWords("Your Brand’s DNA")).toEqual(["Your", "Brand’s", "DNA"]);
  });

  it("baş/son boşluğu kırpar, çoklu boşluğu tek sayar, boş metinde boş dizi döner", () => {
    expect(splitWords("  two   words \n")).toEqual(["two", "words"]);
    expect(splitWords("")).toEqual([]);
    expect(splitWords("   ")).toEqual([]);
  });
});
