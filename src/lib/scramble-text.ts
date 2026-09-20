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

/**
 * Karışık karakter havuzu — Q ve rakamlar ÇIKARILDI (20 Eylül 2026,
 * müşteri hatası "başlıklar iç içe giriyor"). Space Grotesk'te Q'nun
 * kuyruğu 0.18em taban çizgisinin altına iniyor, başlık satır aralığı ise
 * 0.86: karışma sırasında kuyruk bir alt satırın harflerine giriyordu
 * (~0.6sn). Rakamlar da aynı nedenle çıktı — hepsi tek genişlikte (0.648em)
 * ve harflerden geniş, satırı gereksiz şişiriyorlardı. Kalan 25 harfin
 * tamamı taban çizgisi üstünde kalıyor.
 */
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPRSTUVWXYZ";

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
