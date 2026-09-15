import { splitWords } from "./split-words";

/**
 * Manifesto sahnesi (`ScrollLitText`) için metin seçimi.
 *
 * Sahne metni `--chapter-manifesto` (28–80px) ile, ekran yüksekliğinde bir
 * sahnede basılıyor: yalnızca KISA bir cümle taşıyabilir. Creative'in gövde
 * cümleleri bu ölçü düşünülerek yazıldığı için orada sorun yoktu; rollout
 * sayfalarının çeviri metinleri ise 200-300 karakterlik tam paragraflar —
 * sabit `body.slice(0, 2)` ile beslenince dev puntoyla paragraf duvarı
 * çıkıyordu.
 *
 * Kural (metin ASLA yeniden yazılmaz, kısaltılmaz, paragraf ortasından
 * cümle çekilmez):
 *   1. Gövdede kendi başına kısa olan bir madde varsa o seçilir (en fazla
 *      iki tane).
 *   2. Yoksa yalnız-slogan havuzu: servisin `whatWeDo.list` içindeki tek
 *      satırlık tanımı — kısa, onaylı ve iki dilde mevcut.
 *   3. O da yoksa sayfanın kendi `lede`'si.
 *
 * Paragrafın son cümlesini çekmek de denendi; TR ve EN metinlerin cümle
 * yapısı farklı olduğu için aynı sayfada iki dilde iki farklı (ve TR'de
 * zayıf) slogan çıkıyordu. Tek satırlık servis tanımı ikisinde de aynı
 * gücü veriyor.
 *
 * Seçilmeyen her şey `remainder` olarak döner ve okunur gövde metnine gider;
 * böylece hiçbir cümle sayfadan düşmez.
 */

const TERMINATORS = new Set([".", "!", "?"]);
/** Cümle sonundaki kapanış işaretleri noktalamayla birlikte cümlede kalır. */
const CLOSERS = new Set(['"', "'", "”", "’", ")", "]", "»"]);
/** split-words.ts ile aynı sınıf: NBSP boşluk sayılmaz, marka adını bölmez. */
const ASCII_SPACE = /[ \t\n\r\f\v]/;
const LOWERCASE = /\p{Ll}/u;

const MAX_WORDS = 14;
const MAX_SENTENCES = 2;

export interface ManifestoSelection {
  /** Manifesto sahnelerinde basılacak kısa cümleler (1-2 tane). */
  sentences: string[];
  /** Sahneye girmeyen, okunur gövde metnine gidecek paragraflar. */
  remainder: string[];
  source: "candidate" | "extra" | "lede";
}

export interface ManifestoInput {
  /** Sayfanın gövde paragrafları: seçilmezlerse okunur metne dökülürler. */
  candidates: readonly string[];
  /**
   * Yalnız slogan adayı olan, gövde metnine ASLA dökülmeyecek kısa cümleler
   * (ör. `whatWeDo.list` içindeki servis tanımı). Gövdede kısa cümle yoksa
   * paragraf ortasından cümle çekmek yerine bunlar kullanılır.
   */
  extras?: readonly string[];
  lede: string;
}

export function splitSentences(text: string): string[] {
  const sentences: string[] = [];
  let start = 0;

  for (let index = 0; index < text.length; index += 1) {
    if (!TERMINATORS.has(text[index])) continue;

    let end = index + 1;
    while (end < text.length && CLOSERS.has(text[end])) end += 1;
    // Metnin sonundaki cümle aşağıdaki kuyruk adımında alınır.
    if (end >= text.length) break;
    // "3.5" gibi durumlar: noktadan sonra boşluk yoksa cümle sonu değil.
    if (!ASCII_SPACE.test(text[end])) continue;

    let next = end;
    while (next < text.length && ASCII_SPACE.test(text[next])) next += 1;
    if (next >= text.length) break;
    // Küçük harfle devam ediyorsa nokta büyük olasılıkla kısaltmaya ait.
    if (LOWERCASE.test(text[next])) continue;

    const sentence = text.slice(start, end).trim();
    if (sentence !== "") sentences.push(sentence);
    start = next;
  }

  const tail = text.slice(start).trim();
  if (tail !== "") sentences.push(tail);
  return sentences;
}

function isShort(sentence: string): boolean {
  return splitWords(sentence).length <= MAX_WORDS;
}

export function selectManifesto({
  candidates,
  extras = [],
  lede,
}: ManifestoInput): ManifestoSelection {
  const pool = [
    ...candidates.map((text) => ({ text, sentences: splitSentences(text), spill: true })),
    ...extras.map((text) => ({ text, sentences: splitSentences(text), spill: false })),
  ];
  const bodyCount = candidates.length;
  const picks: { item: number; sentence: number }[] = [];

  // 1. Gövdede kendi başına kısa olan maddeler.
  for (const [index, item] of pool.slice(0, bodyCount).entries()) {
    if (picks.length >= MAX_SENTENCES) break;
    if (item.sentences.length === 1 && isShort(item.sentences[0])) {
      picks.push({ item: index, sentence: 0 });
    }
  }

  // 2. Gövde hiçbir şey vermediyse yalnız-slogan havuzu.
  if (picks.length === 0) {
    for (let index = bodyCount; index < pool.length; index += 1) {
      if (picks.length >= MAX_SENTENCES) break;
      const item = pool[index];
      if (item.sentences.length === 1 && isShort(item.sentences[0])) {
        picks.push({ item: index, sentence: 0 });
      }
    }
  }

  if (picks.length === 0) {
    return { sentences: [lede], remainder: [...candidates], source: "lede" };
  }

  const consumed = new Map<number, number>();
  for (const pick of picks) consumed.set(pick.item, pick.sentence);

  const remainder = pool
    .map((item, index) => {
      if (!item.spill) return "";
      const dropped = consumed.get(index);
      if (dropped === undefined) return item.text;
      return item.sentences.filter((_, position) => position !== dropped).join(" ");
    })
    .filter((text) => text !== "");

  return {
    sentences: picks.map((pick) => pool[pick.item].sentences[pick.sentence]),
    remainder,
    // Seçim gövdeden mi yoksa yalnız-slogan havuzundan mı geldi?
    source: picks.every((pick) => pick.item >= candidates.length) ? "extra" : "candidate",
  };
}
