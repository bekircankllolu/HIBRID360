/**
 * Karakter karıştırma → gerçek metne "çözülme" efekti — saf fonksiyon,
 * DOM'a dokunmaz. Rastgelelik dışarıdan verilir, testler deterministik
 * (bkz. mona-lotus.ts, mona-drift.ts ile aynı kalıp).
 *
 * Kullanıcının verdiği referans bileşenin (`ScrambleText`) mantığı:
 * kaplama soldan sağa ilerler — `progress` kadarı gerçek harf, geri kalanı
 * her çağrıda yeniden rastgele bir karakter. Boşluk her zaman boşluk kalır
 * (kelimeler birbirine karışmaz). `CreativeTitle` bunu sayfa yüklendiğinde
 * tek seferlik bir giriş animasyonu için kullanıyor (bkz. useScrambleReveal).
 */

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function scrambleChar(random: () => number): string {
  return SCRAMBLE_CHARS[Math.floor(random() * SCRAMBLE_CHARS.length)];
}

export function scrambleReveal(target: string, progress: number, random: () => number): string {
  const clamped = Math.min(1, Math.max(0, progress));
  const revealed = Math.floor(clamped * target.length);
  return target
    .split("")
    .map((char, index) => (char === " " || index < revealed ? char : scrambleChar(random)))
    .join("");
}
