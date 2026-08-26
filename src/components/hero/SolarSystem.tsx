"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  orbitStones,
  stonePoint,
  visibleRings,
  orbitStoneSrc,
  ORBIT_VIEW,
  orbitTilt,
  RING_STYLE,
  STONE_INTRINSIC,
  SOLAR_SYSTEM_TITLE,
  type OrbitStone,
} from "@/data/solar-system";
import styles from "./SolarSystem.module.css";

/**
 * Hibrid güneş sistemi — brief-rev12.md Bölüm 4.5 "Hibrid taşları".
 *
 * Merkezde sarı Hibrid kristali (güneş), etrafında dört eğik eliptik
 * yörüngede dönen sekiz servis noktası. Gerçeklik hissi üç şeyden geliyor:
 *   1. Noktalar halkaların TAM üzerinde döner — halka SVG'si ve nokta
 *      matematiği aynı sabitlerden türetilir (bkz. data/solar-system.ts).
 *   2. Derinlik: nokta kristalin arkasından geçerken küçülür, söner ve
 *      kristalin altına çizilir; önden geçerken büyür ve parlar.
 *   3. Hover/odak/tap sistemi YAVAŞÇA durdurur (ani donma yok) ve o
 *      noktanın yanında kompakt bir detay kartı açılır — büyük sabit
 *      panel yok, ayrıntı noktanın yanında yaşar.
 *
 * Erişilebilirlik ve performans:
 *   - Noktalar gerçek <a href> (SSR'da da) — klavye ve arama motoru tam
 *     navigasyon görür. Dokunmatikte ilk dokunuş kartı açar (href'siz
 *     <a> deseni — next-intl Link preventDefault dinlemediği için
 *     render-time çözümü, bkz. önceki taş etkileşimi), kartın "Detaya
 *     git" bağlantısı gerçek navigasyondur.
 *   - Animasyon tek rAF döngüsü + 8 transform; WebGL yok, kilit gerekmez
 *     (CLAUDE.md "tek WebGL sahnesi" kuralı hero'ya kalır). Bölüm ekrandan
 *     çıkınca döngü durur.
 *   - prefers-reduced-motion: döngü hiç kurulmaz, noktalar t=0 dizilişinde
 *     sabit durur; kart açılışları anlıktır.
 */

const pct = (x: number, y: number) => ({
  left: `${((x / ORBIT_VIEW.w) * 100).toFixed(3)}%`,
  top: `${((y / ORBIT_VIEW.h) * 100).toFixed(3)}%`,
});

/** SSR / hareket-azaltma dizilişi: t=0 konumları. */
function staticStyle(stone: OrbitStone, compact: boolean): CSSProperties {
  const p = stonePoint(stone, 0, compact);
  return {
    ...pct(p.x, p.y),
    zIndex: p.depth >= 0.5 ? 4 : 1,
    "--depth-scale": (0.72 + 0.5 * p.depth).toFixed(3),
    "--depth-fade": (0.5 + 0.5 * p.depth).toFixed(3),
    // Etiket, taş kristalin ARKASINA geçerken tamamen kaybolur: aksi
    // hâlde kristalin üstünde yarısı kesilmiş yazılar kalıyordu.
    "--label-fade": Math.max(0, (p.depth - 0.5) * 2).toFixed(3),
    "--stone-glow":
      stone.color === "yellow"
        ? "var(--color-brand-yellow)"
        : "var(--color-brand-fuchsia)",
  } as CSSProperties;
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
  // Dar ekran dizilişi (iki halka + alttaki kart şeridi). SSR masaüstü
  // dizilişini üretir, hydrate sonrası gerçek değere geçer — konumlar
  // zaten inline stille yazıldığı için uyumsuzluk oluşmuyor.
  const [compact, setCompact] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const planetRefs = useRef<Array<HTMLDivElement | null>>([]);
  const activeRef = useRef<number | null>(null);
  activeRef.current = activeStone;
  // İmleç sahnenin üstündeyken sistem yavaşlar (durmaz) — hareketli bir
  // hedefi yakalamak aksi hâlde çok zordu.
  const hoveringRef = useRef(false);
  // Döngü compact değerini ref'ten okur: state'e bağlansaydı her kırılım
  // değişiminde rAF döngüsü baştan kurulurdu.
  const compactRef = useRef(false);
  compactRef.current = compact;

  useEffect(() => {
    const query = window.matchMedia("(hover: none)");
    setCoarsePointer(query.matches);
    const onChange = (event: MediaQueryListEvent) =>
      setCoarsePointer(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 640px)");
    setCompact(query.matches);
    const onChange = (event: MediaQueryListEvent) => setCompact(event.matches);
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

  // Ana animasyon döngüsü. Zamanı doğrudan DOM'a yazar (state değil):
  // 60fps'te 8 eleman için re-render maliyeti gereksiz.
  useEffect(() => {
    if (reducedMotion) return;
    const stage = stageRef.current;
    if (!stage) return;

    let frameId: number | null = null;
    let running = false;
    let time = 0;
    let speed = 1;
    let last = 0;

    const step = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Üç kademe: kart açıkken tam durur, imleç sahnedeyken %35 hıza
      // düşer (hedef yakalanabilir olsun), boştayken tam hız.
      const target =
        activeRef.current !== null ? 0 : hoveringRef.current ? 0.35 : 1;
      speed += (target - speed) * 0.08;
      time += dt * speed;

      for (let i = 0; i < orbitStones.length; i++) {
        const el = planetRefs.current[i];
        if (!el) continue;
        const p = stonePoint(orbitStones[i], time, compactRef.current);
        el.style.left = `${(p.x / ORBIT_VIEW.w) * 100}%`;
        el.style.top = `${(p.y / ORBIT_VIEW.h) * 100}%`;
        el.style.zIndex = activeRef.current === i ? "6" : p.depth >= 0.5 ? "4" : "1";
        el.style.setProperty("--depth-scale", (0.72 + 0.5 * p.depth).toFixed(3));
        el.style.setProperty("--depth-fade", (0.5 + 0.5 * p.depth).toFixed(3));
        el.style.setProperty(
          "--label-fade",
          Math.max(0, (p.depth - 0.5) * 2).toFixed(3),
        );
        // Kart, noktanın sahnedeki anlık yarısına göre içeri doğru açılır.
        el.dataset.side = p.x < ORBIT_VIEW.cx ? "right" : "left";
      }

      frameId = requestAnimationFrame(step);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      frameId = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
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

  return (
    <section className={styles.section} aria-labelledby="solar-system-title">
      <h2 id="solar-system-title" className={styles.title}>
        {SOLAR_SYSTEM_TITLE}
      </h2>

      <div
        className={styles.stage}
        ref={stageRef}
        onPointerEnter={() => {
          hoveringRef.current = true;
        }}
        onPointerLeave={() => {
          hoveringRef.current = false;
        }}
      >
        {/* Dekoratif uzay katmanı: nebula + yıldız alanı. */}
        <div className={styles.space} aria-hidden="true" />

        {/* Yörünge halkaları — noktalarla aynı geometri, aynı viewBox. */}
        <svg
          className={styles.rings}
          viewBox={`0 0 ${ORBIT_VIEW.w} ${ORBIT_VIEW.h}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="ss-ring-sheen" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.34" />
              <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>
          {visibleRings(compact).map((rx, ringIndex) => {
            // Perspektif: uzaktaki halka hem incelir hem soluklaşır.
            // Dar ekranda iki halka var, dıştaki ORBIT_RINGS'in üçüncü
            // ağırlığını alır ki fark okunsun.
            const weight =
              RING_STYLE[compact ? ringIndex * 2 : ringIndex] ?? RING_STYLE[3];
            return (
              <g key={rx}>
                <ellipse
                  className={styles.ringBase}
                  cx={ORBIT_VIEW.cx}
                  cy={ORBIT_VIEW.cy}
                  rx={rx}
                  ry={rx * orbitTilt(compact)}
                  strokeWidth={weight.width}
                  strokeOpacity={weight.opacity}
                  vectorEffect="non-scaling-stroke"
                />
                <ellipse
                  className={styles.ringSheen}
                  cx={ORBIT_VIEW.cx}
                  cy={ORBIT_VIEW.cy}
                  rx={rx}
                  ry={rx * orbitTilt(compact)}
                  strokeWidth={weight.width}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          })}
        </svg>

        {/* Güneş: Hibrid kristali. pointer-events kapalı — arkasından
            geçen nokta hover'lanabilsin. */}
        <div className={styles.sun} aria-hidden="true">
          <span className={styles.sunGlow} />
          {/* .crystal genişliği clamp(8.5rem, 17vw, 13.5rem) — ekranda hiç
              216px'i geçmiyor; next/image bu üst sınırla doğru boyut
              varyantını seçer, otomatik AVIF/WebP üretir. */}
          <Image
            src="/images/stones/stone-yellow.webp"
            alt=""
            width={STONE_INTRINSIC.core.width}
            height={STONE_INTRINSIC.core.height}
            sizes="220px"
            className={styles.crystal}
          />
          {/* Eskiden dolu sarı bir kutuydu; yörünge halkalarını kesiyor ve
              sahnedeki tek düz-grafik öğe olarak 3B yanılsamasını
              kırıyordu. Artık zeminsiz, ışıklı tipografi. */}
          <span className={styles.coreLabel}>HIBRID</span>
        </div>

        {/* Gezegenler: gerçek bağlantılar + noktaya bağlı kompakt kart. */}
        {orbitStones.map((stone, index) => {
          const isActive = activeStone === index;
          const point = stonePoint(stone, 0, compact);
          // Kart sahne dışına taşmasın: soldaki noktada sağa, sağdakinde
          // sola açılır. Buradaki değer t=0 (SSR) içindir; animasyon
          // döngüsü data-side'ı anlık konuma göre günceller.
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

          // brief 4.5: yörüngede dönen "taşlar". Önceki sürümde bunlar
          // CSS ışık noktalarıydı — sahne bu yüzden diyagram gibi
          // okunuyordu. Artık merkez kristalle aynı ailenin küçük
          // varyantı dönüyor; fuşya taş da böylece kullanıma giriyor.
          const body = (
            <>
              <Image
                className={styles.stone}
                src={orbitStoneSrc(stone.color)}
                alt=""
                width={STONE_INTRINSIC[stone.color].width}
                height={STONE_INTRINSIC[stone.color].height}
                sizes="40px"
              />
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
              style={staticStyle(stone, compact)}
              data-side={point.x < ORBIT_VIEW.cx ? "right" : "left"}
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

              {/* Servis adı her zaman okunur. Önceden ad yalnızca kart
                  açıkken görünüyordu; sahnede sekiz anonim nokta duruyordu
                  ve mobilde hiçbir etiket yoktu. */}
              <span className={styles.dotLabel} aria-hidden="true">
                {stone.label}
              </span>

              {/* Dar ekranda bu kart gizlenir; içerik sahnenin altındaki
                  sabit şeritte açılır (bkz. .stripCard). */}
              <div
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

      {/* Dar ekran kart şeridi. 390px'de noktanın yanında açılan kart
          sahneden taşıyordu; burada sabit bir alanda açılıyor, sahne
          kaydırmadan okunuyor. Yer önceden ayrıldığı için kart açılıp
          kapanırken layout kaymıyor (CLS 0). */}
      {/* aria-hidden YOK: masaüstünde şerit CSS ile display:none olduğu
          için okunmaz, dar ekranda ise nokta kartı display:none olur —
          yani her kırılımda erişilebilir ağaçta tek kart kalır. */}
      <div className={styles.strip} aria-live="polite">
        {activeStone === null ? (
          /* Seçim yokken şerit BOŞ kalır, yalnızca yüksekliğini korur.
             Buraya "bir taşa dokunun" gibi bir ipucu yazmak yeni bir
             TR/EN metin uydurmak olurdu — CLAUDE.md onaylanmamış metni
             yasaklıyor. Taşların üstündeki servis adları zaten
             dokunulabilirliği gösteriyor. */
          <span className={styles.stripEmpty} aria-hidden="true" />
        ) : (
          <div
            className={styles.stripCard}
            style={
              {
                "--stone-glow":
                  orbitStones[activeStone].color === "yellow"
                    ? "var(--color-brand-yellow)"
                    : "var(--color-brand-fuchsia)",
              } as CSSProperties
            }
          >
            <p className={styles.cardTitle}>{orbitStones[activeStone].label}</p>
            <p className={styles.cardBody}>
              {bodyFor(orbitStones[activeStone].wwdTitle)}
            </p>
            <Link
              href={orbitStones[activeStone].href}
              className={styles.cardLink}
            >
              {tCommon("learnMore")} →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
