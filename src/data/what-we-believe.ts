/**
 * What We Believe — görsel ve video varlıkları (tek veri kaynağı).
 *
 * ## Görseller
 *
 * İkisi de eski hibrid360.com'dan; müşterinin 29 Ağustos 2026 talimatı
 * bu iki bölümün korunması yönünde. Türevler
 * `scripts/assets/prepare-legacy-images.py` ile üretildi (WebP + AVIF,
 * 1600w + 2560w) ve kaynak/ölçü/sha256 kayıtları
 * `docs/content/LEGACY_CONTENT_ROUTE_MAP.md` içinde.
 *
 * Eski sitedeki sarı/yeşil filtre marka sistemine göre YENİDEN türetildi:
 * kaynak parlaklığa indirgenip siyah → marka sarısı (#FFFC00) rampasından
 * geçirildi. Eski dosyada ton zeytin yeşiliydi, marka sarısı değildi.
 *
 * ## TELİF — AÇIK BLOCKER (kapanmadı)
 *
 * Görseller depoda ve sayfada, ama kullanım hakkı **teyit edilmedi**:
 *
 *   - `little-prince` — Saint-Exupéry eseri. Ticari kurumsal kullanım
 *     büyük olasılıkla lisans gerektirir. EN YÜKSEK RİSKLİ MADDE.
 *   - `ataturk` — baskı/restorasyon hakkı ve arşiv kaynağı bilinmiyor.
 *
 * Bkz. docs/visual-audit/BLOCKERS.md ve
 * docs/content/LEGACY_CONTENT_ROUTE_MAP.md § "Telif ve atıf blocker'ları".
 * Yayın öncesi kapatılmalı.
 *
 * ## Atıf notu
 *
 * Eski sitede Atatürk fotoğrafının üzerinde "Everything in the world
 * created by women" cümlesi, **imza alanı boş bırakılarak** duruyordu —
 * atıf ima ediliyor ama yazılmıyordu. Birincil kaynağı gösterilemediği
 * için o cümle yeni siteye **alınmadı** ve yerine bir alıntı
 * uydurulmadı. Bu bölümün üzerindeki metin şirketin kendi onaylı
 * manifesto cümlesidir (WWB-06); tırnak içinde değil, imzasız — alıntı
 * gibi okunmasın diye.
 */
export interface ResponsiveImage {
  /** AVIF srcset — önce denenir. */
  avif: string;
  /** WebP srcset — AVIF desteklenmiyorsa. */
  webp: string;
  /** `<img src>` yedeği; en dar türev. */
  fallback: string;
  /** Doğal ölçüler (en geniş türev) — CLS'i sıfırda tutar. */
  width: number;
  height: number;
  alt: Record<"tr" | "en", string>;
}

const WWB = "/images/site/what-we-believe";

export const BELIEF_IMAGES = {
  ataturk: {
    avif: `${WWB}/ataturk-1600w.avif 1600w, ${WWB}/ataturk-2560w.avif 2560w`,
    webp: `${WWB}/ataturk-1600w.webp 1600w, ${WWB}/ataturk-2560w.webp 2560w`,
    fallback: `${WWB}/ataturk-1600w.webp`,
    width: 2560,
    height: 1436,
    alt: {
      tr: "Mustafa Kemal Atatürk, bir pencerenin yanında düşünceli otururken — marka sarısı duotone",
      en: "Mustafa Kemal Atatürk sitting thoughtfully beside a window — brand-yellow duotone",
    },
  },
  littlePrince: {
    avif: `${WWB}/little-prince-1600w.avif 1600w, ${WWB}/little-prince-2560w.avif 2560w`,
    webp: `${WWB}/little-prince-1600w.webp 1600w, ${WWB}/little-prince-2560w.webp 2560w`,
    fallback: `${WWB}/little-prince-1600w.webp`,
    width: 2560,
    height: 1983,
    alt: {
      tr: "Küçük Prens illüstrasyonu: yıldızlı gökyüzünde küçük gezegeninde gülüyle oturan figür",
      en: "The Little Prince sitting with his rose on a small planet beneath a star-filled sky",
    },
  },
} satisfies Record<string, ResponsiveImage>;

/**
 * Kurucu/müşteri konuşma videosu (WWB — scroll ile büyüyen bölüm).
 *
 * GERÇEK VİDEO TESLİM EDİLMEDİ. Sahte kişi, sahte video veya yer tutucu
 * bir "video hazırlanıyor" kutusu **üretilmedi**: değer `null` olduğu
 * sürece bölüm hiç render edilmez (bkz. BeliefFounderVideo).
 *
 * Varlık gelince tek değişiklik bu sabiti doldurmak:
 *
 *   export const BELIEF_FOUNDER_VIDEO: BeliefFounderVideo | null = {
 *     sources: [
 *       { src: "/videos/belief-founder.webm", type: "video/webm; codecs=av01" },
 *       { src: "/videos/belief-founder.mp4", type: "video/mp4" },
 *     ],
 *     poster: { src: "/images/site/what-we-believe/founder-poster.webp",
 *               width: 1920, height: 1080 },
 *     captions: [
 *       { src: "/videos/belief-founder.tr.vtt", srcLang: "tr", label: "Türkçe" },
 *       { src: "/videos/belief-founder.en.vtt", srcLang: "en", label: "English" },
 *     ],
 *     // Yalnızca gerçekten AI ile üretilmiş içerikte eklenir.
 *     disclosure: "ai-generated",
 *   };
 *
 * Kurallar (CLAUDE.md):
 *   - Altyazı her replikte ZORUNLU (VTT, TR+EN).
 *   - Otomatik ses YASAK — video sessiz başlar, kontroller görünür.
 *   - AV1/WebM + MP4, poster kare, preload="none".
 *
 * `poster` verilip `sources` boş bırakılırsa bölüm "kontrollü poster
 * modunda" çalışır: hareket ve büyüme aynı, oynatma yok. Böylece görsel
 * hazır olup video gecikirse bölüm yine de dürüst biçimde yayına
 * girebilir.
 */
export interface BeliefVideoSource {
  src: string;
  type: string;
}

export interface BeliefVideoCaption {
  src: string;
  srcLang: string;
  label: string;
}

export interface BeliefFounderVideo {
  sources: BeliefVideoSource[];
  poster: { src: string; width: number; height: number };
  captions?: BeliefVideoCaption[];
  disclosure?: "ai-generated";
}

export const BELIEF_FOUNDER_VIDEO: BeliefFounderVideo | null = null;
