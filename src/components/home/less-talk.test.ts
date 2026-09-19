import { describe, expect, it } from "vitest";
import trMessages from "@/messages/tr.json";
import enMessages from "@/messages/en.json";
import { splitLead } from "./less-talk";

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
