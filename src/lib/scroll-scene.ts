/**
 * Service Chapter scroll sahnelerinin tarayıcı gerektirmeyen ölçümü.
 *
 * `useScrollScene` bu fonksiyonlardan birini rAF içinde çağırır ve sonucu
 * sahnenin `--progress` değişkenine yazar; CSS geri kalan her şeyi o tek
 * sayıdan türetir. Sonuç her koşulda [0, 1] içinde ve NaN'dan arınmış
 * olmalı — geçersiz bir değer `clip-path`'i düşürür ve sahne siyah kalır.
 * Ölçü bozuksa final durum (1) seçilir: yarım kalmış bir sahne yerine
 * açılmış bir sahne göstermek her zaman daha güvenli.
 *
 * `stickyProgress`, `culture/meet-the-crew-reveal.ts` içindeki
 * `revealProgress` ile aynı sözleşmeye sahip; o dosya rollout aşamasında
 * buraya bağlanacak (docs/design/SERVICE_CHAPTER_SYSTEM.md §11).
 */

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

/**
 * Sticky sahne: sarmalayıcı ekranın üstüne değdiğinde 0, sahne son
 * ekranına geldiğinde 1. Kaydırma payı = yükseklik eksi bir ekran.
 */
export function stickyProgress(
  rectTop: number,
  rectHeight: number,
  viewportHeight: number,
): number {
  const travel = rectHeight - viewportHeight;
  if (!Number.isFinite(travel) || travel <= 0) return 1;

  const raw = -rectTop / travel;
  if (!Number.isFinite(raw)) return 1;

  return clamp01(raw);
}

/**
 * Akan (sticky olmayan) öğe: üst kenarı ekranın altından girerken 0, alt
 * kenarı ekranın üstünden çıkarken 1.
 */
export function passProgress(
  rectTop: number,
  rectHeight: number,
  viewportHeight: number,
): number {
  const travel = rectHeight + viewportHeight;
  if (!Number.isFinite(travel) || travel <= 0) return 1;

  const raw = (viewportHeight - rectTop) / travel;
  if (!Number.isFinite(raw)) return 1;

  return clamp01(raw);
}

/** İlerlemeyi `[start, end]` alt aralığına eşler; genişlik 0 ise eşik gibi. */
export function rangeProgress(progress: number, start: number, end: number): number {
  if (!Number.isFinite(progress)) return 1;
  if (end <= start) return progress >= end ? 1 : 0;
  return clamp01((progress - start) / (end - start));
}

/** İlerlemenin denk geldiği liste indeksi; boş listede -1. */
export function activeIndex(progress: number, count: number): number {
  if (count <= 0) return -1;
  const safe = Number.isFinite(progress) ? clamp01(progress) : 1;
  return Math.min(Math.floor(safe * count), count - 1);
}
