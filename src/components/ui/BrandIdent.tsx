"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import styles from "./BrandIdent.module.css";

/**
 * Marka ident'i — tam genişlik bir motion-graphic bandı.
 *
 * Sarı parçacık küresi dönerken noktalar soldaki boşluğa akar; fuşya
 * nişan çizgileri sabit durur. Görsel dil bilinçli olarak MONA'nınkiyle
 * aynı (sarı nokta bulutu): stok bir animasyon gibi değil, sitenin kendi
 * dünyasından bir an gibi dursun diye.
 *
 * Üretim: Higgsfield (anahtar kare) + Seedance 2.5 (hareket), 17 Eylül 2026.
 * Kaynak kare marka paletiyle sınırlı — düz siyah zemin, #FFFC00, #FF00FF.
 *
 * CLAUDE.md medya kuralları:
 * - `preload="none"` ve yükleme yalnız görünür alana girince başlar; bandı
 *   hiç görmeyen ziyaretçi 215 KB'ı indirmez.
 * - Poster kare her zaman var, oran sabit → CLS 0.
 * - Ses YOK: dosyada ses kanalı bile bulunmuyor, `muted` ayrıca yazılı.
 * - `prefers-reduced-motion`: video hiç yüklenmez, poster kare durur.
 * - Dekoratif: `aria-hidden`, ekran okuyucuya bir şey söylemiyor.
 */
export function BrandIdent({ bleed = false }: {
  /**
   * Konteynerin kendi yatay padding'ini iptal edip kenara taşar.
   *
   * VARSAYILAN false. Yalnız yatay boşluğu OLAN kapsayıcılarda açılmalı
   * (ör. `culture-page .page`). Boşluğu olmayan bir kapsayıcıda açılırsa
   * (ör. `work .page`) sayfaya tam bir gutter kadar yatay kaydırma ekler —
   * bant ilk sürümde bunu koşulsuz yapıyordu ve nöbetçi test yakaladı.
   */
  bleed?: boolean;
} = {}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const host = hostRef.current;
    if (!host) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setLoad(true);
        observer.disconnect();
      },
      // Bant görünmeden biraz önce başlat: kullanıcı oraya vardığında
      // ilk kare hazır olsun, siyah bir kutu karşılamasın.
      { rootMargin: "200px 0px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <div
      ref={hostRef}
      className={`${styles.band}${bleed ? ` ${styles.bleed}` : ""}`}
      aria-hidden="true"
    >
      {load ? (
        <video
          className={styles.video}
          poster="/videos/hibrid-ident-poster.webp"
          width={1280}
          height={720}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
        >
          <source src="/videos/hibrid-ident.webm" type="video/webm" />
          <source src="/videos/hibrid-ident.mp4" type="video/mp4" />
        </video>
      ) : (
        // Video yüklenene kadar (ve reduced-motion'da kalıcı olarak) poster.
        // `img` etiketi bilinçli: next/image bu dekoratif, sabit oranlı
        // karede optimizasyon kazancı vermez, bir istek daha ekler.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={styles.video}
          src="/videos/hibrid-ident-poster.webp"
          alt=""
          width={1280}
          height={720}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
}
