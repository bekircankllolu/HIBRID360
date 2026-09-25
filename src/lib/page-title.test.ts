import { describe, expect, it } from "vitest";

import { cookiePolicyEn, cookiePolicyTr } from "@/data/policies/cookie";
import { kvkkNoticeEn, kvkkNoticeTr } from "@/data/policies/kvkk";
import { privacyPolicyEn, privacyPolicyTr } from "@/data/policies/privacy";
import { responsibleAiPolicyEn, responsibleAiPolicyTr } from "@/data/policies/responsible-ai";
import { termsOfUseEn, termsOfUseTr } from "@/data/policies/terms";
import {
  needsTallLeading,
  splitTitle,
  titleFit,
  upperForLang,
  wordWidthEm,
  type TitleLang,
} from "@/lib/page-title";
import { TITLE_ADVANCES, TITLE_SPACE_ADVANCE } from "@/lib/title-metrics";
import en from "@/messages/en.json";
import tr from "@/messages/tr.json";

/**
 * PageTitle ölçü kütüphanesi. Başlık `font-size: min(kademe, calc(100cqw / fit))`
 * ile kabına sığıyor; `fit` tarayıcı olmadan, fonttan üretilmiş harf
 * tablosundan hesaplanıyor. İki şey sözleşme:
 *
 * 1. Ölçü doğru: tarayıcıda ölçülmüş genişliklerle ±%3 (tablo kerning
 *    taşımıyor) ve 1.03 payıyla tarayıcı genişliğinin ALTINA düşmüyor —
 *    düşerse en uzun kelime kabından taşar.
 * 2. Metin değişmez: satır bölme yalnız boşlukta böler, harfe dokunmaz
 *    ("SİTEYE GİRECEK METİN" kuralı).
 */

const LANGS: readonly TitleLang[] = ["tr", "en"];
const LATIN_CAPITALS = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
const FIT_MARGIN = 1.03;
const TABLE_KEYS: ReadonlySet<string> = new Set(Object.keys(TITLE_ADVANCES));

/** Göreli sapma: |gerçek − beklenen| / beklenen. */
function relativeError(actual: number, expected: number): number {
  return Math.abs(actual - expected) / expected;
}

/**
 * Tarayıcıda ölçülmüş en uzun kelime genişlikleri (em, Space Grotesk 700,
 * kerning dahil). Son iki satır docs/DECISIONS.md'deki (13 Eylül 2026,
 * Service Chapter kararı) bağımsız ölçümler.
 */
const MEASURED: ReadonlyArray<[lines: string[], lang: TitleLang, em: number]> = [
  [["SÜRDÜRÜLEBİLİRLİK"], "tr", 9.45],
  [["KADRAJIN ARKASINDAKİLER."], "tr", 8.28],
  [["ERİŞİLEBİLİRLİK BEYANI"], "tr", 7.21],
  [["SUSTAINABILITY"], "en", 7.53],
  [["ACCESSIBILITY STATEMENT"], "en", 6.89],
  [["PRODUCTION"], "en", 6.06],
  [["THE ART OF", "TEAMWORK"], "en", 5.48],
  [["NO BLACK BOX."], "en", 3.11],
  [["GET IN TOUCH AND LET’S START SOMETHING GREAT TOGETHER"], "en", 5.56],
  [["CREATIVITY"], "en", 5.346],
  [["EVENT", "MANAGEMENT"], "en", 6.724],
];

/**
 * Gerçek H1 metinleri. Marka sloganları sayfa dosyalarında sabit (iki
 * dilde de İngilizce); gerisi çeviri ve politika verisinden okunuyor —
 * metin değişirse test yeni metinle koşar.
 */
const SLOGAN_TITLES = [
  "THE ART OF TEAMWORK",
  "NO BLACK BOX.",
  "SHOOT IN TÜRKIYE. WITH A CREW THAT ALREADY KNOWS THE WAY.",
  "CREATIVITY WITHOUT LIMITS",
  "BUILT FOR THE FEED. MADE TO MOVE.",
  "POST PRODUCTION",
  "LIVE BROADCAST",
  "EVENT MANAGEMENT",
  "CLOUD TV",
  "WHAT WE BELIEVE",
  "CULTURE",
  "PARTNERS",
];

const MESSAGE_TITLES = [tr, en].flatMap((messages) => [
  messages.whatWeDo.heroTitle,
  messages.contact.heroTitle,
  messages.culture.whoWeAre.heroTitle,
  messages.culture.whoWeAre.secondTitle,
  messages.culture.whatWeBelieve.inspires.title,
  messages.directors.heroTitle,
  messages.solutions.heroTitle,
  messages.clients.heroTitle,
  messages.insights.heroTitle,
  messages.notFound.title,
  messages.sustainability.title,
  messages.footer.legal.accessibility,
  messages.home.closing.title,
  messages.brief.pageTitle,
]);

const POLICY_TITLES = [
  cookiePolicyTr,
  cookiePolicyEn,
  kvkkNoticeTr,
  kvkkNoticeEn,
  privacyPolicyTr,
  privacyPolicyEn,
  responsibleAiPolicyTr,
  responsibleAiPolicyEn,
  termsOfUseTr,
  termsOfUseEn,
].map((doc) => doc.title);

const CORPUS: readonly string[] = [...SLOGAN_TITLES, ...MESSAGE_TITLES, ...POLICY_TITLES];

describe("TITLE_ADVANCES (Space Grotesk 700 dosyasından üretilmiş tablo)", () => {
  it("başlıkta geçebilecek her karakter için makul bir em değeri taşır", () => {
    const required = [
      ...LATIN_CAPITALS,
      ..."ÇĞİÖŞÜ",
      ..."abcdefghijklmnopqrstuvwxyz",
      ..."çğıöşü",
      ..."0123456789",
      " ",
      ...".,!?:;&'’“”\"-–—/()+#@",
    ];
    expect(required.filter((char) => !TABLE_KEYS.has(char))).toEqual([]);
    // Üst sınır birim hatasını yakalar: font birimi (ör. 634) em sanılırsa patlar.
    for (const char of required) {
      expect(TITLE_ADVANCES[char], char).toBeGreaterThan(0);
      expect(TITLE_ADVANCES[char], char).toBeLessThan(1.5);
    }
  });

  it("gerçek başlıkların büyük harf hâlindeki her karakteri tabloda (yedek değere düşmez)", () => {
    const characters = CORPUS.flatMap((text) => LANGS.flatMap((lang) => [...upperForLang(text, lang)]));
    expect([...new Set(characters)].filter((char) => !TABLE_KEYS.has(char))).toEqual([]);
  });

  it("boşluk sabiti tablodaki boşlukla aynı", () => {
    expect(TITLE_SPACE_ADVANCE).toBe(TITLE_ADVANCES[" "]);
  });
});

describe("upperForLang (CSS text-transform: uppercase karşılığı)", () => {
  it("Türkçede i → İ, ı → I", () => {
    expect(upperForLang("istanbul ılık", "tr")).toBe("İSTANBUL ILIK");
  });

  it("İngilizcede i → I (noktasız)", () => {
    expect(upperForLang("istanbul ılık", "en")).toBe("ISTANBUL ILIK");
  });

  it("karışık harfli kaynak metni sayfa diline göre büyütür", () => {
    expect(upperForLang("Kadrajın arkasındakiler.", "tr")).toBe("KADRAJIN ARKASINDAKİLER.");
    expect(upperForLang("Kadrajın arkasındakiler.", "en")).toBe("KADRAJIN ARKASINDAKILER.");
  });

  it("aksanlı harfleri iki dilde de büyütür, büyük harfe dokunmaz", () => {
    for (const lang of LANGS) {
      expect(upperForLang("göç şüğ", lang)).toBe("GÖÇ ŞÜĞ");
      expect(upperForLang("SHOOT IN TÜRKIYE.", lang)).toBe("SHOOT IN TÜRKIYE.");
    }
  });
});

describe("wordWidthEm", () => {
  const average =
    LATIN_CAPITALS.reduce((sum, char) => sum + TITLE_ADVANCES[char], 0) / LATIN_CAPITALS.length;

  it("harf ilerlemelerini toplar (kerning yok)", () => {
    const { B, L, A, C, K } = TITLE_ADVANCES;
    expect(wordWidthEm("BLACK")).toBeCloseTo(B + L + A + C + K, 10);
  });

  it("boş dizgede 0", () => {
    expect(wordWidthEm("")).toBe(0);
  });

  it("tabloda olmayan karakteri A–Z ortalamasıyla sayar, sessizce 0 vermez", () => {
    expect(TABLE_KEYS.has("Ж")).toBe(false);
    expect(average).toBeGreaterThan(0.5);
    expect(wordWidthEm("Ж")).toBeCloseTo(average, 10);
    expect(wordWidthEm("AЖ")).toBeCloseTo(TITLE_ADVANCES.A + average, 10);
  });

  it("UTF-16 çiftini (emoji) tek karakter sayar", () => {
    expect(wordWidthEm("🎬")).toBeCloseTo(average, 10);
  });

  it("ayrışık (NFD) aksanı birleşik harf gibi ölçer", () => {
    expect(wordWidthEm("Ü")).toBeCloseTo(TITLE_ADVANCES["Ü"], 10);
  });
});

describe("titleFit (en uzun kelimenin em genişliği × 1.03)", () => {
  it.each(MEASURED)("%j (%s) ≈ %f em", (lines, lang, em) => {
    const measured = titleFit(lines, lang) / FIT_MARGIN;
    expect(relativeError(measured, em), `${measured.toFixed(4)} em`).toBeLessThanOrEqual(0.03);
  });

  it.each(MEASURED)("%j (%s): 1.03 payıyla tarayıcı genişliğinin altına düşmez", (lines, lang, em) => {
    expect(titleFit(lines, lang)).toBeGreaterThanOrEqual(em);
  });

  it("1.03 katsayısını uygular", () => {
    expect(titleFit(["BLACK"], "en")).toBeCloseTo(wordWidthEm("BLACK") * FIT_MARGIN, 10);
  });

  it("en uzun kelimeyi tüm satırlar arasından seçer, satır sırası önemsiz", () => {
    const expected = wordWidthEm("TEAMWORK") * FIT_MARGIN;
    expect(titleFit(["THE ART OF", "TEAMWORK"], "en")).toBeCloseTo(expected, 10);
    expect(titleFit(["TEAMWORK", "THE ART OF"], "en")).toBeCloseTo(expected, 10);
  });

  it("karışık harfli metni büyük harfe çevirip ölçer", () => {
    const upper = titleFit(["SÜRDÜRÜLEBİLİRLİK"], "tr");
    expect(titleFit(["Sürdürülebilirlik"], "tr")).toBeCloseTo(upper, 10);
    expect(wordWidthEm("sürdürülebilirlik") * FIT_MARGIN).toBeLessThan(upper);
  });

  it("tire ve kesme işareti kelimeyi bölmez", () => {
    expect(titleFit(["SECOND-TO-LAST"], "en")).toBeCloseTo(wordWidthEm("SECOND-TO-LAST") * FIT_MARGIN, 10);
    expect(titleFit(["LET’S GO"], "en")).toBeCloseTo(wordWidthEm("LET’S") * FIT_MARGIN, 10);
  });

  it("bölünmez boşluk (NBSP) iki parçayı tek kelime tutar", () => {
    const joined = "HIBRID 360";
    expect(titleFit([joined], "en")).toBeCloseTo(wordWidthEm(joined) * FIT_MARGIN, 10);
    expect(titleFit([joined], "en")).toBeGreaterThan(titleFit(["HIBRID 360"], "en"));
  });

  it("boş girdide 0", () => {
    expect(titleFit([], "tr")).toBe(0);
    expect(titleFit(["   "], "en")).toBe(0);
  });
});

describe("splitTitle", () => {
  it("tek kelimeyi tek satır bırakır, kenar boşluğunu kırpar", () => {
    expect(splitTitle("SÜRDÜRÜLEBİLİRLİK", "tr")).toEqual(["SÜRDÜRÜLEBİLİRLİK"]);
    expect(splitTitle("  PRODUCTION \n", "en")).toEqual(["PRODUCTION"]);
  });

  it("cümle sınırı yoksa iki satırın genişlik farkını en aza indirir", () => {
    expect(splitTitle("THE ART OF TEAMWORK", "en")).toEqual(["THE ART OF", "TEAMWORK"]);
    expect(splitTitle("NO BLACK BOX.", "en")).toEqual(["NO BLACK", "BOX."]);
  });

  it("açık cümle sınırından böler", () => {
    expect(splitTitle("SHOOT IN TÜRKIYE. WITH A CREW THAT ALREADY KNOWS THE WAY.", "en")).toEqual([
      "SHOOT IN TÜRKIYE.",
      "WITH A CREW THAT ALREADY KNOWS THE WAY.",
    ]);
    expect(splitTitle("BUILT FOR THE FEED. MADE TO MOVE.", "en")).toEqual([
      "BUILT FOR THE FEED.",
      "MADE TO MOVE.",
    ]);
  });

  it("birden çok cümle sınırı varsa sonuncusundan böler", () => {
    expect(splitTitle("WE PLAN. WE SHOOT. WE DELIVER.", "en")).toEqual([
      "WE PLAN. WE SHOOT.",
      "WE DELIVER.",
    ]);
  });

  it("ünlem, soru işareti ve satır sonu da cümle sınırı (dengeli bölmeyi ezer)", () => {
    // Dengeli bölme bunları "STOP! LOOK | AROUND", "WHY? BECAUSE | WE CAN",
    // "ONE TWO | THREE FOUR" yapardı.
    expect(splitTitle("STOP! LOOK AROUND", "en")).toEqual(["STOP!", "LOOK AROUND"]);
    expect(splitTitle("WHY? BECAUSE WE CAN", "en")).toEqual(["WHY?", "BECAUSE WE CAN"]);
    expect(splitTitle("ONE\nTWO THREE FOUR", "en")).toEqual(["ONE", "TWO THREE FOUR"]);
  });

  it("eşitlikte ilk satırı uzun tutar", () => {
    expect(splitTitle("ONE ONE ONE", "en")).toEqual(["ONE ONE", "ONE"]);
  });

  it("kaynak metnin harf kalıbını korur (ölçüm büyük harfle, çıktı aynen)", () => {
    expect(splitTitle("Kadrajın arkasındakiler.", "tr")).toEqual(["Kadrajın", "arkasındakiler."]);
    expect(splitTitle("The art of teamwork", "en")).toEqual(["The art of", "teamwork"]);
  });

  it("bölünmez boşlukta (NBSP) bölmez ve onu korur", () => {
    expect(splitTitle("HIBRID 360 ÇÖZÜMLERİ", "tr")).toEqual(["HIBRID 360", "ÇÖZÜMLERİ"]);
  });

  it("boş girdide boş dizi", () => {
    expect(splitTitle("", "tr")).toEqual([]);
    expect(splitTitle(" \n ", "en")).toEqual([]);
  });

  it("gerçek başlıklarda satırlar birleşince metin aynen geri gelir (tr ve en)", () => {
    expect(CORPUS.length).toBeGreaterThanOrEqual(30);
    const violations = CORPUS.flatMap((text) =>
      LANGS.map((lang) => ({ text, lang, lines: splitTitle(text, lang) })),
    ).filter(
      ({ text, lines }) =>
        lines.join(" ") !== text.trim().replace(/\s+/g, " ") ||
        lines.length < 1 ||
        lines.length > 2 ||
        lines.some((line) => line === "" || line !== line.trim()),
    );
    expect(violations).toEqual([]);
  });
});

describe("needsTallLeading (TR diyakritiği için .86 → .93 satır aralığı)", () => {
  it("tr: i İ ö Ö ü Ü ş Ş ç Ç ğ Ğ harflerinin her biri tek başına yeter", () => {
    for (const char of "iİöÖüÜşŞçÇğĞ") {
      expect(needsTallLeading(char, "tr"), char).toBe(true);
    }
  });

  it("en: yalnız gerçek Türkçe aksanlı harfler; küçük i büyüyünce noktasız I olur", () => {
    for (const char of "İÖÜŞÇĞöüşçğ") {
      expect(needsTallLeading(char, "en"), char).toBe(true);
    }
    for (const char of "iıI") {
      expect(needsTallLeading(char, "en"), char).toBe(false);
    }
  });

  it.each<[string, TitleLang, boolean]>([
    ["SÜRDÜRÜLEBİLİRLİK", "tr", true],
    ["Sürdürülebilirlik", "tr", true],
    ["KADRAJIN ARKASINDAKİLER.", "tr", true],
    ["istanbul", "tr", true],
    ["ÇÖZÜMLER", "tr", true],
    ["KADRAJIN", "tr", false],
    ["ılık", "tr", false],
    ["NO BLACK BOX.", "tr", false],
    ["SHOOT IN TÜRKIYE.", "en", true],
    ["İSTANBUL", "en", true],
    ["Göbekli Tepe", "en", true],
    ["istanbul", "en", false],
    ["Sustainability", "en", false],
    ["THE PEOPLE BEHIND THE FRAME.", "en", false],
  ])("%s (%s) → %s", (text, lang, expected) => {
    expect(needsTallLeading(text, lang)).toBe(expected);
  });
});
