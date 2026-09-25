import { TITLE_ADVANCES, TITLE_SPACE_ADVANCE } from "@/lib/title-metrics";

/**
 * Başlık ölçüsü — PageTitle'ın satır bölme ve sığdırma hesabı.
 *
 * H1'ler Space Grotesk 700, CSS ile BÜYÜK HARF. Punto
 * `min(kademe, calc(100cqw / fit))`: kademe en uzun kelimeyi taşırıyorsa
 * (SÜRDÜRÜLEBİLİRLİK ≈ 9,45 em, 144 px'te ~1360 px) punto kaba iner. `fit`
 * tarayıcıda ölçülmüyor; fonttan bir kez üretilmiş harf tablosuyla
 * (title-metrics.ts) hesaplanıyor, bu yüzden sunucuda da çalışıyor.
 *
 * Kelime = ASCII boşlukla ayrılmış parça. Bölünmez boşluk (NBSP) kelimenin
 * parçası — çeviriler "Hibrid 360" gibi ifadeleri onunla bağlıyor
 * (split-words.ts ile aynı gerekçe). Tire ve kesme işareti de kelimeyi
 * bölmez; tarayıcı tireden sonra kırabilir, bütün kelimeyi ölçmek güvenli
 * taraf (punto biraz küçük kalır, taşma olmaz).
 */

/** Başlığın dili: marka sloganı "en", diğerleri sayfa dili. */
export type TitleLang = "tr" | "en";

/** Kerning payı: tablo kerning taşımıyor; bu fontta çiftler neredeyse hep daraltıyor. */
const FIT_MARGIN = 1.03;

/** Kayan nokta toplamlarında eşitliği yakalama toleransı (em). */
const EPSILON = 1e-9;

const EDGE_SPACE = /^[ \t\n\r\f\v]+|[ \t\n\r\f\v]+$/g;
/** Yakalayan grup: `split` boşluk öbeklerini de döndürür (satır sonu tespiti için). */
const SPACE_RUN = /([ \t\n\r\f\v]+)/;
const SENTENCE_END = /[.!?]$/;
const TURKISH_ACCENTED_CAPITAL = /[İÖÜŞÇĞ]/;

const LATIN_CAPITALS = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

/** Tabloda olmayan karakterin tahmini genişliği: A–Z ortalaması. */
const FALLBACK_ADVANCE =
  LATIN_CAPITALS.reduce((sum, char) => sum + TITLE_ADVANCES[char], 0) / LATIN_CAPITALS.length;

interface Tokens {
  /** Boşluksuz parçalar, metindeki sırasıyla. */
  readonly words: readonly string[];
  /** `words[i]` ile `words[i + 1]` arasındaki özgün boşluk öbeği. */
  readonly gaps: readonly string[];
}

/**
 * CSS `text-transform: uppercase` karşılığı: Türkçede i → İ, ı → I;
 * İngilizcede i → I. Tarayıcı da öğenin `lang`ına göre büyütür, ölçü aynı
 * dille büyütülmüş metinden alınmalı.
 */
export function upperForLang(text: string, lang: TitleLang): string {
  return text.toLocaleUpperCase(lang);
}

/**
 * Kelimenin em genişliği: harf ilerlemelerinin toplamı (kerning yok).
 * Büyütme yapmaz; başlık ölçüsü için önce `upperForLang` uygulanır.
 * Tabloda olmayan karakter A–Z ortalamasıyla sayılır (0 saymak başlığı
 * sessizce taşırırdı); ayrışık (NFD) aksanlar önce birleştirilir.
 */
export function wordWidthEm(word: string): number {
  return Array.from(word.normalize("NFC")).reduce((sum, char) => sum + advanceOf(char), 0);
}

/**
 * Sığdırma katsayısı: satırlardaki en geniş kelimenin büyük harf em
 * genişliği × 1.03. `calc(100cqw / fit)` en uzun kelimeyi kabın ~%97'sine
 * oturtur. Boş başlıkta 0.
 */
export function titleFit(lines: readonly string[], lang: TitleLang): number {
  const widest = lines
    .flatMap((line) => tokenize(line).words)
    .reduce((max, word) => Math.max(max, measure(word, lang)), 0);
  return widest * FIT_MARGIN;
}

/**
 * Başlığı 1 ya da 2 satıra böler, metne dokunmadan:
 * `splitTitle(t, lang).join(" ")` = kenarı kırpılmış, boşluk öbekleri tek
 * boşluğa inmiş `t`.
 *
 * - Tek kelime → tek satır; boş metin → boş dizi.
 * - Açık cümle sınırı (". ", "! ", "? " ya da satır sonu) varsa SON
 *   sınırdan: "SHOOT IN TÜRKIYE." / "WITH A CREW …".
 * - Yoksa iki satırın büyük harf genişlik farkını en aza indiren boşluktan;
 *   eşitlikte ilk satır uzun kalır.
 */
export function splitTitle(text: string, lang: TitleLang): string[] {
  const { words, gaps } = tokenize(text);
  if (words.length < 2) return [...words];
  const cut = lastSentenceCut(words, gaps) ?? balancedCut(words, lang);
  return [words.slice(0, cut).join(" "), words.slice(cut).join(" ")];
}

/**
 * Başlık, TR büyük harf diyakritiği yüzünden uzun satır aralığı
 * (.86 → .93) istiyor mu? Ekranda çizilen BÜYÜK HARF hâline bakar: "tr"de
 * küçük i de İ olur (noktası komşu satıra değer), ı noktasız I kalır;
 * "en"de i noktasız I olur, yalnız gerçek İ Ö Ü Ş Ç Ğ (ör. "TÜRKIYE") sayılır.
 */
export function needsTallLeading(text: string, lang: TitleLang): boolean {
  return TURKISH_ACCENTED_CAPITAL.test(upperForLang(text, lang).normalize("NFC"));
}

function advanceOf(char: string): number {
  const advance: number | undefined = TITLE_ADVANCES[char];
  return advance ?? FALLBACK_ADVANCE;
}

/** Kelimeyi ekranda çizildiği gibi (büyük harf) ölçer. */
function measure(word: string, lang: TitleLang): number {
  return wordWidthEm(upperForLang(word, lang));
}

function tokenize(text: string): Tokens {
  const trimmed = text.replace(EDGE_SPACE, "");
  if (trimmed === "") return { words: [], gaps: [] };
  const parts = trimmed.split(SPACE_RUN);
  return {
    words: parts.filter((_, index) => index % 2 === 0),
    gaps: parts.filter((_, index) => index % 2 === 1),
  };
}

/** Son cümle sınırından sonraki ilk kelimenin indeksi; sınır yoksa null. */
function lastSentenceCut(words: readonly string[], gaps: readonly string[]): number | null {
  const breaks = gaps.map((gap, index) => gap.includes("\n") || SENTENCE_END.test(words[index]));
  const last = breaks.lastIndexOf(true);
  return last === -1 ? null : last + 1;
}

/** İki satırın genişlik farkını en aza indiren kesim; eşitlikte ilk satır uzun. */
function balancedCut(words: readonly string[], lang: TitleLang): number {
  const widths = words.map((word) => measure(word, lang));
  const lineWidth = (from: number, to: number): number =>
    widths.slice(from, to).reduce((sum, width) => sum + width, 0) +
    (to - from - 1) * TITLE_SPACE_ADVANCE;

  // Kesim = ikinci satırın ilk kelimesinin indeksi (1 … n−1).
  const candidates = Array.from({ length: words.length - 1 }, (_, index) => {
    const cut = index + 1;
    const first = lineWidth(0, cut);
    const second = lineWidth(cut, words.length);
    return { cut, imbalance: Math.abs(first - second), firstLonger: first >= second };
  });

  return candidates.reduce((best, candidate) => {
    const tie = Math.abs(candidate.imbalance - best.imbalance) <= EPSILON;
    const better =
      candidate.imbalance < best.imbalance - EPSILON ||
      (tie && candidate.firstLonger && !best.firstLonger);
    return better ? candidate : best;
  }).cut;
}
