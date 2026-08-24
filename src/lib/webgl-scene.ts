/**
 * WebGL sahne kilidi.
 *
 * CLAUDE.md performans kuralı: "aynı anda en fazla BİR WebGL sahnesi
 * çalışır; ekrandan çıkınca durur." Bu modül o kuralın global kilidini
 * tutar. Şu an tek WebGL sahnesi hero'daki HIBRID sıvı tipografisi (bkz.
 * HibridWebGL + hibrid-wordmark-scene.ts) — güneş sistemi bölümü WebGL'den
 * DOM/CSS sahnesine taşındı (bkz. components/hero/SolarSystem.tsx), yani
 * kilit pratikte hep boş; ikinci bir sahne eklenirse mekanizma hazır.
 */

let sceneLockHolder: symbol | null = null;
const lockWaiters = new Set<() => void>();

export function acquireSceneLock(holder: symbol): boolean {
  if (sceneLockHolder && sceneLockHolder !== holder) return false;
  sceneLockHolder = holder;
  return true;
}

export function releaseSceneLock(holder: symbol): void {
  if (sceneLockHolder !== holder) return;
  sceneLockHolder = null;
  // Bekleyenlere haber ver. Bu olmadan devir zamanlamaya kalıyordu:
  // iki sahnenin IntersectionObserver callback'leri aynı partide
  // tetiklendiğinde sıradaki sahne kilidi dolu bulup vazgeçiyor ve bir
  // daha görünürlük değişimi olmadığı için hiç açılmıyordu.
  const pending = Array.from(lockWaiters);
  lockWaiters.clear();
  pending.forEach((notify) => notify());
}

/**
 * Kilit doluyken sıraya girer; kilit boşaldığında `notify` çağrılır.
 * Dönen fonksiyon sıradan çıkarır (unmount/temizlik için).
 */
export function onSceneLockReleased(notify: () => void): () => void {
  lockWaiters.add(notify);
  return () => {
    lockWaiters.delete(notify);
  };
}
