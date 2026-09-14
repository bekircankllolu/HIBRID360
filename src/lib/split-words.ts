/**
 * Metni kelimelere böler — yalnızca ASCII boşlukta.
 *
 * `String.prototype.split(/\s+/)` ve `trim()` bölünmez boşluğu (U+00A0) da
 * boşluk sayar; çeviri dosyalarında "Hibrid 360" gibi birlikte kalması
 * gereken ifadeler NBSP ile yazılıyor, onları ayırmak satır sonunda
 * "Hibrid" ile "360"ı koparır. Bu yüzden boşluk sınıfı açıkça yazıldı.
 */
const ASCII_WHITESPACE = /[ \t\n\r\f\v]+/;
const EDGE_WHITESPACE = /^[ \t\n\r\f\v]+|[ \t\n\r\f\v]+$/g;

export function splitWords(text: string): string[] {
  const trimmed = text.replace(EDGE_WHITESPACE, "");
  if (trimmed === "") return [];
  return trimmed.split(ASCII_WHITESPACE);
}
