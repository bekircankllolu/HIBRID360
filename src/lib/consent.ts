/**
 * Çerez rızası — brief-rev12.md Bölüm 1.8 ve 14: "site açılışında onay
 * bandı (kabul / reddet / ayarlar)".
 *
 * Rıza tarayıcıda localStorage'da tutulur; sunucuya gönderilmez. Analytics
 * yalnızca `analytics: true` olduğunda yüklenir (brief 1.7: "GA4 veya
 * Plausible, çerez onayına bağlı çalışacak — consent mode").
 */

export const CONSENT_STORAGE_KEY = "hibrid360-consent";

export interface ConsentState {
  /** Sitenin çalışması için zorunlu — reddedilemez, çerez kullanmaz. */
  necessary: true;
  analytics: boolean;
  decidedAt: string;
}

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (typeof parsed?.analytics !== "boolean") return null;
    return parsed;
  } catch {
    // Gizli sekme, site verisi kapalı vb. — rıza yok say, bant gösterilir.
    return null;
  }
}

export function writeConsent(analytics: boolean): ConsentState {
  const state: ConsentState = {
    necessary: true,
    analytics,
    decidedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Yazılamıyorsa sessizce geç — kullanıcı her ziyarette yeniden sorulur.
  }
  window.dispatchEvent(new CustomEvent("hibrid360:consent", { detail: state }));
  return state;
}
