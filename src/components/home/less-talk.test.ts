import { describe, expect, it } from "vitest";
import trMessages from "@/messages/tr.json";
import enMessages from "@/messages/en.json";
import {
  HAND_CIRCLE_PATH,
  LESS_TALK_EMPHASIS,
  scalePath,
  splitEmphasis,
  splitLead,
} from "./less-talk";

describe("splitLead", () => {
  it("ilk cümleyi açılış yapar", () => {
    expect(splitLead("Bir cümle. Ve devamı.")).toEqual({
      lead: "Bir cümle.",
      rest: "Ve devamı.",
    });
  });

  it("noktalı virgül ve iki noktayı da sınır sayar", () => {
    expect(splitLead("Şunu yaparız; bunu değil.").lead).toBe("Şunu yaparız;");
    expect(splitLead("Şunları severiz: biri, ikisi.").lead).toBe("Şunları severiz:");
  });

  it("veriye gömülü satır sonlarını düşürür", () => {
    expect(splitLead("Bir cümle.\n  İkinci satır.\nÜçüncü.")).toEqual({
      lead: "Bir cümle.",
      rest: "İkinci satır. Üçüncü.",
    });
  });

  it("cümle çok uzunsa virgülden böler", () => {
    const long =
      "Bu cümlenin ilk yarısı yeterince uzun ve virgüllü, ikinci yarısı da " +
      "en az onun kadar uzun ve hepsi tek bir noktayla bitiyor.";
    const { lead, rest } = splitLead(long);
    expect(lead.endsWith(",")).toBe(true);
    expect(lead.length).toBeLessThanOrEqual(100);
    expect(rest.length).toBeGreaterThan(0);
  });

  it("kapanış tırnağını açılışta bırakır, gerisi tırnakla başlamaz", () => {
    const { lead, rest } = splitLead('Marka "şu". Sonrası.');
    expect(lead).toBe('Marka "şu".');
    expect(rest).toBe("Sonrası.");
  });

  it("bölünecek yer yoksa tamamını açılış yapar", () => {
    expect(splitLead("Kısa metin")).toEqual({ lead: "Kısa metin", rest: "" });
  });

  it("boş metinde çökmez", () => {
    expect(splitLead("   \n  ")).toEqual({ lead: "", rest: "" });
  });

  /*
   * Asıl güvence: gerçek site metinleri. Bir maddenin tamamı açılışta
   * kalırsa hiyerarşi kaybolur (tek punto = eski "sıkışık" hâl), açılış
   * bir kelimeye düşerse de başlık gibi durmaz.
   */
  it.each([
    ["tr", trMessages.home.lessTalk.paragraphs],
    ["en", enMessages.home.lessTalk.paragraphs],
  ])("%s maddelerinin hepsinde iki kademe oluşuyor", (_locale, paragraphs) => {
    for (const paragraph of paragraphs as string[]) {
      const { lead, rest } = splitLead(paragraph);
      expect(lead.length).toBeGreaterThanOrEqual(20);
      expect(lead.length).toBeLessThanOrEqual(100);
      expect(rest.length).toBeGreaterThan(0);
      // Hiçbir kelime kaybolmamalı.
      expect(`${lead} ${rest}`.replace(/\s+/g, " ").trim()).toBe(
        paragraph.replace(/\s+/g, " ").trim(),
      );
    }
  });
});

describe("splitEmphasis", () => {
  it("kelimeyi metne dokunmadan üç parçaya ayırır", () => {
    const parts = splitEmphasis("Hibrid 360 proaktif iş birliğine inanır.", "inanır");
    expect(parts).toEqual({
      before: "Hibrid 360 proaktif iş birliğine ",
      word: "inanır",
      after: ".",
    });
    expect(parts && parts.before + parts.word + parts.after).toBe(
      "Hibrid 360 proaktif iş birliğine inanır.",
    );
  });

  it("yalnız tam kelimeyi eşler, kelime içini değil", () => {
    expect(splitEmphasis("notably not", "not")).toEqual({
      before: "notably ",
      word: "not",
      after: "",
    });
    expect(splitEmphasis("değiller", "değil")).toBeNull();
  });

  it("kelime yoksa null döner (halka çizilmez, metin aynen kalır)", () => {
    expect(splitEmphasis("Bir cümle.", "yok")).toBeNull();
    expect(splitEmphasis("Bir cümle.", "")).toBeNull();
  });

  it("vurgu kelimelerinin hepsi gerçek açılış cümlelerinde geçiyor", () => {
    for (const [locale, messages] of [
      ["tr", trMessages],
      ["en", enMessages],
    ] as const) {
      const paragraphs = messages.home.lessTalk.paragraphs;
      LESS_TALK_EMPHASIS[locale].forEach((word, index) => {
        const { lead } = splitLead(paragraphs[index]);
        expect(splitEmphasis(lead, word), `${locale} #${index + 1}: ${word}`).not.toBeNull();
      });
      expect(LESS_TALK_EMPHASIS[locale]).toHaveLength(paragraphs.length);
    }
  });
});

describe("scalePath", () => {
  it("x ve y koordinatlarını ayrı ölçekler, komutları korur", () => {
    expect(scalePath("M10 20 C 30 40, 50 60, 70 80", 2, 0.5)).toBe(
      "M20 10 C 60 20, 100 30, 140 40",
    );
  });

  it("negatif ve ondalık sayıları doğru okur", () => {
    expect(scalePath("M-4 48 C 1.5 -2.5, 0 0, 3 3", 10, 2)).toBe("M-40 96 C 15 -5, 0 0, 30 6");
  });

  it("halka yolunu 200×100 kutusundan gerçek kutuya taşır", () => {
    const scaled = scalePath(HAND_CIRCLE_PATH, 3, 1.5);
    expect(scaled.startsWith("M456 21")).toBe(true);
  });
});
