"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  orbitStones,
  stonePoint,
  stoneTrail,
  ORBIT_VIEW,
  ORBIT_TILT,
  ORBIT_RINGS,
  CRYSTAL_MEDIA,
  cardSide,
  SOLAR_SYSTEM_TITLE,
  type OrbitStone,
} from "@/data/solar-system";
import {
  createStarfield,
  spawnShootingStar,
  nextShootingStarDelay,
  shootingStarAlpha,
  advanceShootingStars,
  mulberry32,
  STAR_PARALLAX,
  STAR_DRIFT,
  STAR_RGB,
  type ShootingStar,
} from "@/lib/starfield";
import styles from "./SolarSystem.module.css";

/**
 * Hibrid ekosistem sahnesi — brief-rev12.md Bölüm 4.5 "Hibrid taşları".
 *
 * Merkezde sarı Hibrid kristali (güneş), etrafında dört eğik eliptik
 * yörüngede dönen sekiz servis noktası. Sahnenin "grafik" değil "uzay"
 * gibi okunmasını sağlayan dört şey:
 *
 *   1. KUYRUK — her nokta arkasında sönerek incelen sürekli bir iz
 *      bırakır. İz uydurma bir eğri değil, noktanın geçmiş konumlarının
 *      kendisi (bkz. data/solar-system.ts `stoneTrail`), bu yüzden her
 *      zaman halkanın tam üzerinde durur.
 *   2. DERİNLİK — nokta ve izi kristalin arkasından geçerken küçülür,
 *      söner ve ARKA canvas'a çizilir; önden geçerken büyür, parlar ve
 *      ÖN canvas'a çizilir. Kristal ikisinin arasında durduğu için
 *      gerçekten önünden/arkasından geçiyormuş gibi okunur.
 *   3. YILDIZ ALANI — tekrarlayan CSS deseni değil, tohumlanmış RNG ile
 *      üretilmiş düzensiz yıldızlar. Üç paralaks katmanı ayrı hızda
 *      sürüklenir, her yıldız kendi fazında titrer, aralıklarla kayan
 *      yıldız geçer.
 *   4. PARALAKS — imleç sahnede gezerken katmanlar farklı miktarda kayar.
 *
 * Performans (CLAUDE.md bütçesi):
 *   - TEK rAF döngüsü sekiz noktanın DOM konumunu, iki canvas'ı ve
 *     paralaksı birlikte sürer. WebGL yok — sahne kilidi gerekmiyor,
 *     "aynı anda tek WebGL sahnesi" kuralı hero'ya kalır.
 *   - Bölüm ekrandan çıkınca IntersectionObserver döngüyü durdurur.
 *   - Canvas dpr 2 ile sınırlı; kare başına ~350 arc çiziliyor.
 *   - prefers-reduced-motion: döngü hiç kurulmaz. Yıldızlar TEK KARE
 *     çizilir (boş siyah kutu kalmasın), noktalar t=0 dizilişinde sabit
 *     durur, iz ve kayan yıldız yoktur.
 *
 * Erişilebilirlik:
 *   - Noktalar SSR'da da gerçek <a href> — klavye ve tarayıcı tam
 *     navigasyon görür. Dokunmatikte ilk dokunuş kartı açar.
 *   - Canvas tamamen dekoratif: aria-hidden, pointer-events yok.
 */

/** Sahnenin sanal koordinatları → yüzde. */
const pct = (x: number, y: number) => ({
  left: `${((x / ORBIT_VIEW.w) * 100).toFixed(3)}%`,
  top: `${((y / ORBIT_VIEW.h) * 100).toFixed(3)}%`,
});

/** SSR / hareket-azaltma dizilişi: t=0 konumları. */
function staticStyle(stone: OrbitStone): CSSProperties {
  const p = stonePoint(stone, 0);
  return {
    ...pct(p.x, p.y),
    zIndex: p.depth >= 0.5 ? 4 : 1,
    "--depth-scale": (0.72 + 0.5 * p.depth).toFixed(3),
    "--depth-fade": (0.5 + 0.5 * p.depth).toFixed(3),
    "--stone-glow":
      stone.color === "yellow"
        ? "var(--color-brand-yellow)"
        : "var(--color-brand-fuchsia)",
  } as CSSProperties;
}

const STAR_COUNT = 190;
const STAR_SEED = 0x1b360;

/** Sahnenin canvas ölçüleri, cihaz pikseli cinsinden. */
interface StageSize {
  w: number;
  h: number;
  dpr: number;
  /** Sanal birim başına cihaz pikseli (yatay) — yarıçapları ölçekler. */
  unit: number;
  /** 1rem'in CSS piksel karşılığı — iz ve nokta aynı ölçüyü paylaşsın. */
  rem: number;
  /**
   * Kartın yatay erişimi (ofset + genişlik), SANAL birim cinsinden.
   * Kart rem ile boyutlanıyor, konumlar ise sanal koordinatta; bu değer
   * ikisini bağlıyor ve kırılım noktasına göre yeniden ölçülüyor.
   */
  cardReach: number;
}

export function SolarSystem() {
  const reducedMotion = usePrefersReducedMotion();
  const tWwd = useTranslations("whatWeDo");
  const tCommon = useTranslations("common");
  const wwdList = tWwd.raw("list") as Array<{ title: string; body: string }>;
  const bodyFor = useCallback(
    (wwdTitle: string) =>
      wwdList.find((item) => item.title === wwdTitle)?.body ?? "",
    [wwdList],
  );

  const [activeStone, setActiveStone] = useState<number | null>(null);
  // SSR her zaman gerçek <a href> üretir; dokunmatik ayrımı hydrate sonrası.
  const [coarsePointer, setCoarsePointer] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);
  const frontCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const planetRefs = useRef<Array<HTMLDivElement | null>>([]);

  const activeRef = useRef<number | null>(null);
  activeRef.current = activeStone;

  /** İmleç sahnedeyken sistem yavaşlar (durmaz) — hareketli noktayı
      hedeflemek kolaylaşır, sahne de canlı kalır. */
  const hoveringStageRef = useRef(false);
  /** İmlecin sahnedeki normalize konumu (-1..1), paralaks için. */
  const pointerRef = useRef({ x: 0, y: 0 });
  const sizeRef = useRef<StageSize>({
    w: 0,
    h: 0,
    dpr: 1,
    unit: 1,
    rem: 16,
    cardReach: 260,
  });
  const cardProbeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(hover: none)");
    setCoarsePointer(query.matches);
    const onChange = (event: MediaQueryListEvent) =>
      setCoarsePointer(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // Kart açıkken dışarı dokunuş/tık kapatır (özellikle mobil için).
  useEffect(() => {
    if (activeStone === null) return;
    const onPointerDown = (event: PointerEvent) => {
      const stage = stageRef.current;
      if (stage && !stage.contains(event.target as Node)) {
        setActiveStone(null);
      }
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setActiveStone(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [activeStone]);

  // Canvas boyutlandırma — dpr 2 ile sınırlı, ResizeObserver ile takipli.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);

      // Kart gizliyken de (visibility: hidden) yerleşimi vardır, yani
      // genişliği ölçülebilir. rem cinsinden tanımlı genişliği burada
      // sanal birime çeviriyoruz — kırılım noktası değişse de doğru kalır.
      const rem =
        parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const probe = cardProbeRef.current;
      const cardPx = probe ? probe.offsetWidth : 248;
      const cardReach =
        ((cardPx + rem * 1.7) * ORBIT_VIEW.w) / Math.max(rect.width, 1);

      sizeRef.current = { w, h, dpr, unit: w / ORBIT_VIEW.w, rem, cardReach };

      for (const canvas of [backCanvasRef.current, frontCanvasRef.current]) {
        if (!canvas) continue;
        canvas.width = w;
        canvas.height = h;
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  /**
   * Poster, SSR HTML'ine YAZILMIYOR; bölüm görünür alana yaklaşınca
   * atanıyor.
   *
   * Sebebi ölçülmüş: `poster` niteliği belgede dururken tarayıcı görseli
   * hemen, Medium öncelikle indiriyor. Ekran altındaki dekoratif bir
   * varlık böylece hero görseliyle bant genişliği için yarışıyor ve
   * mobil LCP 2213 ms'den ~2740 ms'ye çıkıp 2500 ms'lik sözleşme
   * bütçesini aşıyordu.
   *
   * Bu efekt hareket azaltmadan bağımsız: o modda video hiç oynamasa da
   * poster görünmeli, yoksa sahnenin ortası boş kalır.
   */
  useEffect(() => {
    const video = videoRef.current;
    const stage = stageRef.current;
    if (!video || !stage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (!video.poster) video.poster = CRYSTAL_MEDIA.poster;
        observer.disconnect();
      },
      // Görünür alana girmeden biraz önce indirilsin ki bölüm açıldığında
      // kare hazır olsun.
      { rootMargin: "300px" },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  /**
   * Ana döngü. Zamanı doğrudan DOM'a ve canvas'a yazar (state değil):
   * 60fps'te sekiz eleman için re-render maliyeti gereksiz.
   *
   * Hareket azaltmada döngü kurulmaz; aşağıdaki `paint` bir kez
   * çağrılarak yıldızlar statik çizilir.
   */
  useEffect(() => {
    const stage = stageRef.current;
    const back = backCanvasRef.current;
    const front = frontCanvasRef.current;
    if (!stage || !back || !front) return;

    const backCtx = back.getContext("2d");
    const frontCtx = front.getContext("2d");
    if (!backCtx || !frontCtx) return;

    const stars = createStarfield(STAR_SEED, STAR_COUNT);
    const rng = mulberry32(STAR_SEED ^ 0x9e37);
    let shooting: ShootingStar[] = [];
    let nextShot = nextShootingStarDelay(rng);

    // Paralaksın kendisi de yumuşatılır: imleç zıplayınca sahne zıplamaz.
    let parX = 0;
    let parY = 0;

    /**
     * Bir kareyi çizer. `time` yörünge zamanı, `motion` false ise
     * titreme/sürüklenme/iz/kayan yıldız yoktur (hareket azaltma).
     */
    const paint = (time: number, motion: boolean) => {
      const { w, h, unit, dpr, rem } = sizeRef.current;
      if (w === 0 || h === 0) return;

      backCtx.clearRect(0, 0, w, h);
      frontCtx.clearRect(0, 0, w, h);

      // Yıldızlar arka katmanda ve toplamalı harmanla — siyah üzerinde
      // üst üste binen ışıklar sönükleşmesin, parlasın.
      backCtx.globalCompositeOperation = "lighter";

      for (const star of stars) {
        const drift = motion ? time * STAR_DRIFT[star.layer] : 0;
        const par = STAR_PARALLAX[star.layer];
        // Sürüklenme sahneyi sonsuz kılmak için sarmalanıyor (mod 1).
        let sx = (star.x + drift) % 1;
        if (sx < 0) sx += 1;
        const px = sx * w + parX * par * unit;
        const py = star.y * h + parY * par * unit;

        const twinkle = motion
          ? 0.62 + 0.38 * Math.sin(time * star.speed + star.phase)
          : 1;
        const alpha = star.alpha * twinkle;
        if (alpha <= 0.01) continue;

        backCtx.beginPath();
        backCtx.arc(px, py, star.radius * dpr, 0, Math.PI * 2);
        backCtx.fillStyle = `rgba(${STAR_RGB[star.tint]}, ${alpha.toFixed(3)})`;
        backCtx.fill();
      }

      if (motion) {
        for (const shot of shooting) {
          const alpha = shootingStarAlpha(shot);
          if (alpha <= 0.01) continue;

          const hx = shot.x * w;
          const hy = shot.y * h;
          // Kuyruk hız yönünün tersine uzanır.
          const mag = Math.hypot(shot.vx, shot.vy) || 1;
          const tx = hx - (shot.vx / mag) * shot.length * w;
          const ty = hy - (shot.vy / mag) * shot.length * w;

          const rgb = STAR_RGB[shot.tint];
          const gradient = backCtx.createLinearGradient(hx, hy, tx, ty);
          gradient.addColorStop(0, `rgba(${rgb}, ${alpha.toFixed(3)})`);
          gradient.addColorStop(
            0.35,
            `rgba(${rgb}, ${(alpha * 0.4).toFixed(3)})`,
          );
          gradient.addColorStop(1, `rgba(${rgb}, 0)`);

          backCtx.beginPath();
          backCtx.moveTo(hx, hy);
          backCtx.lineTo(tx, ty);
          backCtx.strokeStyle = gradient;
          backCtx.lineWidth = 1.6 * dpr;
          backCtx.lineCap = "round";
          backCtx.stroke();

          // Baştaki küçük parlak çekirdek — çizgi tek başına düz durur.
          backCtx.beginPath();
          backCtx.arc(hx, hy, 1.9 * dpr, 0, Math.PI * 2);
          backCtx.fillStyle = `rgba(${rgb}, ${alpha.toFixed(3)})`;
          backCtx.fill();
        }
      }

      // ---- Kuyruklu yıldız izleri ----
      if (motion) {
        frontCtx.globalCompositeOperation = "lighter";

        for (let i = 0; i < orbitStones.length; i++) {
          const stone = orbitStones[i];
          const rgb =
            stone.color === "yellow" ? STAR_RGB.yellow : STAR_RGB.fuchsia;
          // Aktif noktanın izi belirginleşir — hangi noktaya baktığın
          // yörüngenin tamamında okunur.
          const boost = activeRef.current === i ? 1.55 : 1;
          const points = stoneTrail(stone, time);

          // İz, ayrık daireler yerine uç uca eklenen çizgi parçalarıyla
          // çiziliyor. Daire yaklaşımında hızlı fazlarda örnekler arası
          // mesafe yarıçapı aşıyor ve kuyruk boncuklanıyordu. `butt` uç
          // ile komşu parçalar tam bitişik: ne boşluk kalıyor, ne de
          // toplamalı harmanda birleşim yerleri parlıyor.
          const px = (v: number) => (v / ORBIT_VIEW.w) * w + parX * unit * 0.35;
          const py = (v: number) => (v / ORBIT_VIEW.h) * h + parY * unit * 0.35;

          // Baş (index 0) DOM noktasının kendisi; iz ondan sonra başlar.
          for (let s = 1; s < points.length; s++) {
            const from = points[s - 1];
            const to = points[s];
            // Parça, bittiği noktanın derinliğine göre katmanlanır.
            const ctx = to.depth >= 0.5 ? frontCtx : backCtx;
            const k = 1 - to.t;
            const alpha = Math.min(
              1,
              k ** 1.35 * 0.5 * (0.45 + 0.55 * to.depth) * boost,
            );
            if (alpha <= 0.012) continue;

            ctx.beginPath();
            ctx.moveTo(px(from.x), py(from.y));
            ctx.lineTo(px(to.x), py(to.y));
            // Nokta 1rem çapında; iz de aynı ölçüye bağlı, sanal birime
            // değil. Sanal birim kullanılınca mobilde iz 3px'e düşüp
            // noktanın yanında iplik gibi kalıyordu.
            ctx.lineWidth = (0.09 + 0.55 * k * k) * rem * dpr;
            ctx.lineCap = "butt";
            ctx.strokeStyle = `rgba(${rgb}, ${alpha.toFixed(3)})`;
            ctx.stroke();
          }
        }
      }

      backCtx.globalCompositeOperation = "source-over";
      frontCtx.globalCompositeOperation = "source-over";
    };

    /** Sekiz noktanın DOM konumunu günceller. */
    const placeStones = (time: number) => {
      for (let i = 0; i < orbitStones.length; i++) {
        const el = planetRefs.current[i];
        if (!el) continue;
        const p = stonePoint(orbitStones[i], time);
        el.style.left = `${(p.x / ORBIT_VIEW.w) * 100}%`;
        el.style.top = `${(p.y / ORBIT_VIEW.h) * 100}%`;
        el.style.zIndex =
          activeRef.current === i ? "7" : p.depth >= 0.5 ? "5" : "1";
        el.style.setProperty("--depth-scale", (0.72 + 0.5 * p.depth).toFixed(3));
        el.style.setProperty("--depth-fade", (0.5 + 0.5 * p.depth).toFixed(3));
        // Kart içeri açılınca kristale binecekse dışarı açılır.
        el.dataset.side = cardSide(p.x, sizeRef.current.cardReach);
      }
    };

    if (reducedMotion) {
      // Tek statik kare: yıldızlar görünür, hiçbir şey hareket etmez.
      const raf = requestAnimationFrame(() => paint(0, false));
      return () => cancelAnimationFrame(raf);
    }

    let frameId: number | null = null;
    let running = false;
    let time = 0;
    let speed = 1;
    let last = 0;

    const step = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Üç kademeli hız: serbest 1 → imleç sahnede 0.35 → kart açık 0.
      // Tam duruş yalnızca bir noktaya kilitlenince olur; sahnede
      // gezinirken sistem yavaşlar ama yaşamaya devam eder.
      const target =
        activeRef.current !== null ? 0 : hoveringStageRef.current ? 0.35 : 1;
      speed += (target - speed) * 0.075;
      time += dt * speed;

      parX += (pointerRef.current.x * 16 - parX) * 0.06;
      parY += (pointerRef.current.y * 10 - parY) * 0.06;
      const stageEl = stageRef.current;
      if (stageEl) {
        stageEl.style.setProperty("--par-x", `${(parX * 0.6).toFixed(2)}px`);
        stageEl.style.setProperty("--par-y", `${(parY * 0.6).toFixed(2)}px`);
      }

      // Kayan yıldızlar sahne zamanından bağımsız: sistem yavaşlasa da
      // gökyüzü kendi ritminde akmaya devam eder.
      shooting = advanceShootingStars(shooting, dt);
      nextShot -= dt;
      if (nextShot <= 0) {
        shooting.push(spawnShootingStar(rng));
        nextShot = nextShootingStarDelay(rng);
      }

      placeStones(time);
      paint(time, true);

      frameId = requestAnimationFrame(step);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      frameId = requestAnimationFrame(step);
      // preload="none" olduğu için video ancak burada yükleniyor:
      // bölüm ekrana girene kadar tek bayt inmiyor (CLAUDE.md video
      // kuralı). play() sessiz videoda reddedilmez ama yine de yutuluyor.
      videoRef.current?.play().catch(() => {});
    };
    const stop = () => {
      running = false;
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
      videoRef.current?.pause();
    };

    // CLAUDE.md: hareket katmanı ekrandan çıkınca durur.
    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0.08 },
    );
    observer.observe(stage);

    return () => {
      observer.disconnect();
      stop();
    };
  }, [reducedMotion]);

  const openStone = useCallback((index: number) => setActiveStone(index), []);
  const closeStone = useCallback(
    (index: number) =>
      setActiveStone((current) => (current === index ? null : current)),
    [],
  );

  /** Paralaks ve yavaşlama için sahne üzerindeki imleç takibi. */
  const onStagePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: ((event.clientY - rect.top) / rect.height) * 2 - 1,
    };
  }, []);

  const activeRing =
    activeStone !== null ? orbitStones[activeStone].ring : null;

  return (
    <section className={styles.section} aria-labelledby="solar-system-title">
      <h2 id="solar-system-title" className={styles.title}>
        {SOLAR_SYSTEM_TITLE}
      </h2>

      <div
        className={styles.stage}
        ref={stageRef}
        onPointerMove={onStagePointerMove}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") hoveringStageRef.current = true;
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== "mouse") return;
          hoveringStageRef.current = false;
          pointerRef.current = { x: 0, y: 0 };
        }}
      >
        {/* Nebula — yıldızlar canvas'ta, buradaki yalnızca renkli sis. */}
        <div className={styles.nebula} aria-hidden="true" />

        {/* Arka canvas: yıldız alanı, kayan yıldızlar ve kristalin
            ARKASINDAN geçen iz parçaları. */}
        <canvas
          ref={backCanvasRef}
          className={`${styles.canvas} ${styles.canvasBack}`}
          aria-hidden="true"
        />

        {/* Yörünge halkaları — noktalarla aynı geometri, aynı viewBox. */}
        <svg
          className={styles.rings}
          viewBox={`0 0 ${ORBIT_VIEW.w} ${ORBIT_VIEW.h}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Perspektif: içteki halka kalın ve belirgin, dıştaki ince ve
              sönük. Eskiden dördü de aynı 1px'ti ve sahne teknik çizim
              gibi okunuyordu. `vectorEffect` kasıtlı olarak yok — farkı
              o bastırıyordu. */}
          {ORBIT_RINGS.map((rx, index) => (
            <ellipse
              key={rx}
              className={`${styles.ring} ${
                activeRing === index ? styles.ringActive : ""
              }`}
              cx={ORBIT_VIEW.cx}
              cy={ORBIT_VIEW.cy}
              rx={rx}
              ry={rx * ORBIT_TILT}
              style={
                {
                  "--ring-width": `${(1.5 - index * 0.26).toFixed(2)}`,
                  "--ring-alpha": `${(0.2 - index * 0.036).toFixed(3)}`,
                } as CSSProperties
              }
            />
          ))}
        </svg>

        {/* Güneş: Hibrid kristali. pointer-events kapalı — arkasından
            geçen nokta hover'lanabilsin. */}
        <div className={styles.sun} aria-hidden="true">
          <span className={styles.sunGlow} />

          {/* Taş kendi ekseninde dönen turntable videosu. Arka planı saf
              siyah olduğu için CSS'te `screen` ile bindiriliyor: siyah
              şeffaflaşıyor, ışıma nebulanın üstüne toplamalı biniyor.

              autoplay YOK — preload="none" ile birlikte bölüm ekrana
              girene kadar tek bayt inmiyor; oynatmayı IntersectionObserver
              başlatıyor (yukarıdaki start/stop). Hareket azaltmada döngü
              hiç kurulmadığı için video da hiç oynamıyor, poster kalıyor. */}
          <video
            ref={videoRef}
            className={styles.crystalVideo}
            width={CRYSTAL_MEDIA.width}
            height={CRYSTAL_MEDIA.height}
            preload="none"
            muted
            loop
            playsInline
            aria-hidden="true"
            tabIndex={-1}
          >
            <source src={CRYSTAL_MEDIA.webm} type="video/webm" />
            <source src={CRYSTAL_MEDIA.mp4} type="video/mp4" />
          </video>

          <span className={styles.coreLabel}>HIBRID</span>
        </div>

        {/* Ön canvas: kristalin ÖNÜNDEN geçen iz parçaları. */}
        <canvas
          ref={frontCanvasRef}
          className={`${styles.canvas} ${styles.canvasFront}`}
          aria-hidden="true"
        />

        {/* Gezegenler: gerçek bağlantılar + noktaya bağlı kompakt kart. */}
        {orbitStones.map((stone, index) => {
          const isActive = activeStone === index;
          const point = stonePoint(stone, 0);
          const navigable = !coarsePointer || isActive;

          const shared = {
            className: `${styles.dot} ${isActive ? styles.dotActive : ""}`,
            onPointerEnter: () => {
              if (!coarsePointer) openStone(index);
            },
            onFocus: () => openStone(index),
            onBlur: () => closeStone(index),
            "aria-label": stone.label,
          };

          const body = (
            <>
              <span className={styles.dotCore} aria-hidden="true" />
              <span className={styles.dotHalo} aria-hidden="true" />
            </>
          );

          return (
            <div
              key={stone.orbit}
              ref={(el) => {
                planetRefs.current[index] = el;
              }}
              className={`${styles.planet} ${isActive ? styles.planetActive : ""}`}
              style={staticStyle(stone)}
              data-side={cardSide(point.x, 260)}
              onPointerLeave={() => {
                if (!coarsePointer) closeStone(index);
              }}
            >
              {navigable ? (
                <Link href={stone.href} {...shared}>
                  {body}
                </Link>
              ) : (
                <a
                  {...shared}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isActive}
                  onClick={() => openStone(index)}
                  onKeyDown={(event: KeyboardEvent<HTMLAnchorElement>) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openStone(index);
                    }
                  }}
                >
                  {body}
                </a>
              )}

              <div
                ref={index === 0 ? cardProbeRef : undefined}
                className={`${styles.card} ${isActive ? styles.cardOpen : ""}`}
                aria-hidden={!isActive}
              >
                <p className={styles.cardKicker}>HIBRID 360</p>
                <p className={styles.cardTitle}>{stone.label}</p>
                <p className={styles.cardBody}>{bodyFor(stone.wwdTitle)}</p>
                <Link
                  href={stone.href}
                  className={styles.cardLink}
                  tabIndex={isActive ? 0 : -1}
                >
                  {tCommon("learnMore")} →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
