"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { WORK_HERO_FILM } from "@/data/work-media";
import styles from "./WorkHeroFilm.module.css";

/**
 * Works hero filmi — ekip iş başında.
 *
 * 20 Eylül 2026 kullanıcı isteği: *"'The Art of Teamwork' yazısının
 * arkasındaki nöron görselini değiştirelim, buraya bir video hazırlayıp
 * koyabilirsin, takım çalışmasını anlatan özgün bir video."* Üç yön
 * sunuldu, kullanıcı GERÇEK SET yönünü seçti.
 *
 * ## Ana sayfadaki showreel'den farkı
 * Showreel ekibin ARKASINDAN ve geniş; kamera sete doğru ilerliyor. Bu
 * ise ekibin İÇİNDEN ve yakın: odakçının eli lensin üstünde, operatör
 * kamerada, ışıkçı arkada. İki videonun aynı şeyi anlatmaması için
 * bilinçli olarak ayrıldılar.
 *
 * ## Yükleme ERTELENİYOR
 * Kadraj hero'nun içinde, yani ilk karede görünür. Ana sayfada aynı
 * durum ölçülmüştü (19 Eylül): kadraja konan video LCP ÖĞESİ oluyor ve
 * `preload="none"` olsa bile `play()` hemen çağrılınca dosya kritik yola
 * giriyor. Bu yüzden indirme `load` olayından (ve varsa bir boşta geçen
 * kareden) sonra başlıyor; o ana kadar poster karesi duruyor ve LCP'yi o
 * karşılıyor.
 *
 * ## Erişilebilirlik
 * - Dekoratif arka plan: `aria-hidden`, klavye hedefi değil.
 * - Ses YOK (`muted`, dosyada ses kanalı da yok) — CLAUDE.md.
 * - `prefers-reduced-motion`: video HİÇ indirilmiyor, poster kalıyor.
 * - AI açıklaması sayfada duruyor: bu görüntü gerçek bir Hibrid 360
 *   çekimi değil.
 */
export function WorkHeroFilm({ locale, disclosure }: { locale: "tr" | "en"; disclosure: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [deferredLoad, setDeferredLoad] = useState(false);
  const [inView, setInView] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    let idle = 0;
    let timer = 0;
    const begin = () => {
      const request = window.requestIdleCallback;
      if (request) idle = request(() => setDeferredLoad(true), { timeout: 1500 });
      else timer = window.setTimeout(() => setDeferredLoad(true), 400);
    };
    if (document.readyState === "complete") begin();
    else window.addEventListener("load", begin, { once: true });
    return () => {
      window.removeEventListener("load", begin);
      if (idle) window.cancelIdleCallback?.(idle);
      if (timer) window.clearTimeout(timer);
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "10% 0px",
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (deferredLoad && inView && !prefersReducedMotion) {
      void video.play().catch(() => {
        // Tarayıcı otomatik oynatmayı engellerse poster görünmeye devam eder.
      });
      return;
    }
    video.pause();
  }, [deferredLoad, inView, prefersReducedMotion]);

  return (
    <>
      <video
        ref={videoRef}
        className={styles.film}
        poster={WORK_HERO_FILM.poster}
        preload="none"
        muted
        loop
        playsInline
        disablePictureInPicture
        aria-hidden="true"
        tabIndex={-1}
      >
        {!prefersReducedMotion && WORK_HERO_FILM.webm && (
          <source src={WORK_HERO_FILM.webm} type="video/webm" />
        )}
        {!prefersReducedMotion && <source src={WORK_HERO_FILM.mp4} type="video/mp4" />}
      </video>
      {WORK_HERO_FILM.disclosure === "ai-generated" && (
        <span className={styles.disclosure}>{disclosure}</span>
      )}
      {/* Kadrajın içeriği ekran okuyucuya metin olarak veriliyor. */}
      <span className={styles.srOnly}>{WORK_HERO_FILM.title[locale]}</span>
    </>
  );
}
