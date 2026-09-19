export interface HomeShowreelAsset {
  mp4?: string;
  webm?: string;
  poster: string;
  title: Record<"tr" | "en", string>;
  disclosure?: "ai-generated";
}

/**
 * Client showreel delivery point.
 *
 * 19 Eylül 2026 kullanıcı isteği: *"ana sayfadaki yukarıdan sağ köşeden
 * aşağı inen show reel bölümü... Higgsfield hesabımızdan bir video çekip
 * koyabilirsin (ya da 10 sn'lik bir showreel video üret)."*
 *
 * Buradaki dosya o istek üzerine üretildi: 10 saniye, tek çekim, kamera
 * ekibin arasından aydınlık sete doğru yavaşça ilerliyor. Görsel dil What
 * We Do v4 setiyle aynı (siyah baskın kadraj, sıcak pratik ışık, tek fuşya
 * gösterge) — ana sayfa ile hizmet sayfaları aynı çekimden çıkmış gibi
 * duruyor. Poster, videonun İLK KARESİ: video devraldığında sıçrama yok.
 *
 * ONAYLI MASTER HÂLÂ BEKLENİYOR. Bu görüntü gerçek bir Hibrid 360
 * kampanyasını göstermiyor ve `disclosure: "ai-generated"` ile sayfada
 * AÇIKÇA öyle etiketleniyor. Onaylı master geldiğinde yalnızca bu
 * dosyadaki yollar değişir; kadraj ve scroll davranışı aynı kalır,
 * `disclosure` o zaman kaldırılır.
 *
 * Ağırlık: AV1/WebM 722 KB önce denenir, H.264 1280px 998 KB yedek.
 * İlk sürüm 1600px'ti (1.18 MB / 1.51 MB); Lighthouse mobilde LCP'yi
 * 5.1 sn'ye çıkardığı için hem küçültüldü hem de indirmesi `load`
 * sonrasına ertelendi (bkz. HeroTypography.tsx `deferredLoad`). Kadraj
 * tam ekrana açıldığında 1280 kaynak %12 büyütülüyor — arka plan
 * showreel'i için görünür bir kayıp değil, ölçüldü.
 */
export const HOME_SHOWREEL: HomeShowreelAsset | null = {
  mp4: "/videos/home-showreel.mp4",
  webm: "/videos/home-showreel.webm",
  poster: "/images/site/home/showreel-representative-1600w.webp",
  title: {
    tr: "Film setinde ekibin arasından aydınlık sahneye ilerleyen temsili AI showreel videosu",
    en: "Representative AI showreel video moving through the crew toward a lit film set",
  },
  disclosure: "ai-generated",
};
