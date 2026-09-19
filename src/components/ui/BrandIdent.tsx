"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useScrollScene } from "@/hooks/useScrollScene";
import { fitFontSize, gatherAmount, sampleText, type Target } from "./brand-ident";
import styles from "./BrandIdent.module.css";

/**
 * Marka ident'i — tam genişlik bir bant.
 *
 * ## 19 Eylül 2026: video kaldırıldı, sahne koda alındı
 *
 * Kullanıcı: *"Works sayfasındaki şu videoyu hâlâ anlayabilmiş değilim.
 * Buraya biraz daha açıklayıcı, kendini anlatan, daha yaratıcı bir video
 * koyabiliriz. Videonun kalitesi düşük gibi sanki, bunu biraz daha
 * yüksek alırsak daha iyi olur."*
 *
 * Önceki hâl AI ile üretilmiş, dönen bir sarı parçacık küresiydi. Haklı
 * bir eleştiriydi: küre hiçbir şey anlatmıyordu ve bir kez daha
 * "yüksek kalitede" üretmek de anlatmayacaktı — sorun çözünürlük değil,
 * ANLAMDI.
 *
 * Yeni sahne kelimenin tam anlamıyla kendini anlatıyor: parçacıklar
 * dağınık durumdan gelip MARKANIN ADINI yazıyor, bir süre duruyor, sonra
 * dağılıyor. Aynı zamanda sitenin kendi diliyle konuşuyor — MONA,
 * Works hero'sundaki nöron ağı ve ekosistem tozu da aynı noktalardan
 * kurulu.
 *
 * Yan faydalar:
 * - 664 KB'lık video indirmesi tamamen kalktı.
 * - Çözünürlük artık ekranın çözünürlüğü; "kalitesi düşük" sorunu
 *   tanımı gereği ortadan kalktı.
 * - Metin canlı çiziliyor, yani marka yazımı tek bir yerde duruyor ve
 *   yeniden render gerektirmiyor.
 *
 * ## Hareket
 * Kaydırmaya bağlı (`useScrollScene` "pass"): bant ekrandan geçerken
 * yazı toplanıyor, okunacak kadar duruyor, sonra dağılıyor. Kullanıcı
 * kaydırmayı durdurursa sahne de duruyor — zamana bağlı bir döngü değil.
 * `prefers-reduced-motion`: parçacıklar doğrudan yazının üstünde,
 * hareketsiz.
 */

/**
 * Örnekleme sıklığı: harfin içinden kaç pikselde bir parçacık alınacağı.
 *
 * 3 denendi ve bırakıldı — ölçüldü: 1440px bantta kare başına 9.110
 * parçacık çıkıyordu (kaydırmanın her karesinde o kadar `fillRect`) ve
 * harfler DOLU görünüyordu, parçacıktan yapılmış gibi değil. 5 hem
 * maliyeti ~%36'ya indiriyor hem de taneyi görünür kılıyor.
 */
const SAMPLE_STEP = 5;

/** Marka yazımı: CLAUDE.md "Hibrid 360" (boşluklu, tek "i"). */
const WORDMARK = "HIBRID 360";

interface Particle {
  /** Serbest (dağınık) konum. */
  freeX: number;
  freeY: number;
  /** Harfin içindeki hedef. */
  targetX: number;
  targetY: number;
  size: number;
  alpha: number;
  /** Her parçacık biraz farklı zamanda varıyor: hepsi birden oturmuyor. */
  lag: number;
}

export function BrandIdent({ bleed = false }: { bleed?: boolean } = {}) {
  const { ref: hostRef, motion } = useScrollScene<HTMLDivElement>({ mode: "pass" });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx = context;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let frame = 0;
    let running = false;

    const build = () => {
      // Hedefler ayrı bir offscreen canvas'tan örnekleniyor: görünen
      // canvas'a metin çizip okumak, o karede metni de göstermek
      // anlamına gelirdi.
      const probe = document.createElement("canvas");
      probe.width = width;
      probe.height = height;
      const probeCtx = probe.getContext("2d");
      if (!probeCtx) return;

      const template = (size: number) =>
        `${800} ${size}px "Archivo", "Archivo Fallback", system-ui, sans-serif`;
      const size = fitFontSize(probeCtx, WORDMARK, width * 0.82, height * 0.62, template);
      const targets: Target[] = sampleText(
        probeCtx,
        WORDMARK,
        width,
        height,
        template(size),
        SAMPLE_STEP,
      );

      particles = targets.map((target, index) => {
        const angle = (index * 2.399) % (Math.PI * 2);
        const spread = 0.55 + ((index * 37) % 100) / 100;
        return {
          // Serbest konum bandın dışına taşmıyor: parçacıklar kenarlardan
          // toplanıyormuş gibi geliyor, boşluktan değil.
          freeX: width / 2 + Math.cos(angle) * width * 0.52 * spread,
          freeY: height / 2 + Math.sin(angle) * height * 0.78 * spread,
          targetX: target.x,
          targetY: target.y,
          size: 1.05 + ((index * 13) % 10) / 9,
          alpha: 0.5 + ((index * 7) % 10) / 20,
          lag: ((index * 29) % 100) / 100,
        };
      });
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    const draw = () => {
      frame = 0;
      ctx.clearRect(0, 0, width, height);

      const raw = prefersReducedMotion
        ? 0.5
        : Number.parseFloat(host.style.getPropertyValue("--progress")) || 0;
      const gather = gatherAmount(raw);

      ctx.fillStyle = "#fffc00";
      for (const p of particles) {
        // Gecikme: parçacıklar sırayla varıyor, blok hâlinde değil.
        const local = Math.max(0, Math.min(1, (gather - p.lag * 0.22) / (1 - p.lag * 0.22)));
        const x = p.freeX + (p.targetX - p.freeX) * local;
        const y = p.freeY + (p.targetY - p.freeY) * local;
        // Dağınıkken sönük, toplandıkça parlak: yazı ortaya çıkarken
        // kontrast da yükseliyor.
        ctx.globalAlpha = p.alpha * (0.25 + local * 0.75);
        const r = p.size * (0.75 + local * 0.45);
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;
    };

    const request = () => {
      if (frame === 0) frame = window.requestAnimationFrame(draw);
    };

    resize();
    draw();

    const observer = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      if (running) request();
    });
    observer.observe(canvas);

    const onScroll = () => {
      if (running && !prefersReducedMotion) request();
    };
    const onResize = () => {
      resize();
      draw();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [hostRef, prefersReducedMotion]);

  return (
    <div
      ref={hostRef}
      className={`${styles.band}${bleed ? ` ${styles.bleed}` : ""}`}
      data-motion={motion}
    >
      {/* Sahne dekoratif; marka adı ekran okuyucuya metin olarak veriliyor. */}
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <span className={styles.label}>{WORDMARK}</span>
    </div>
  );
}
