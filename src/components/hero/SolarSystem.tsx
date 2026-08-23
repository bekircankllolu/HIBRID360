"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  orbitStones,
  STONE_INTRINSIC,
  SOLAR_SYSTEM_TITLE,
} from "@/data/solar-system";
import {
  createSolarSystemScene,
  stoneScreenPosition,
  acquireSceneLock,
  releaseSceneLock,
  onSceneLockReleased,
  type SceneHandle,
} from "@/lib/webgl-scene";
import styles from "./SolarSystem.module.css";

/**
 * Güneş sistemi — brief-rev12.md Bölüm 4.5.
 *
 * Performans (CLAUDE.md, sözleşme maddesi):
 *   - Aynı anda en fazla BİR WebGL sahnesi: modül seviyesindeki kilit
 *     (acquireSceneLock) ikinci sahnenin başlamasını engeller. Taşların
 *     kendisi WebGL dokusu DEĞİL — gerçek <img> (bkz. aşağı); WebGL
 *     yalnızca güneş ışıması ve yörünge halkalarını çiziyor.
 *   - Ekrandan çıkınca durur: IntersectionObserver rAF döngüsünü durdurur.
 *   - prefers-reduced-motion: sahne hiç başlatılmaz, erişilebilir statik
 *     liste gösterilir.
 *   - WebGL yoksa (eski cihaz, bağlam kaybı) aynı statik liste devreye girer.
 *   - Taş görselleri yalnızca 2 dosya (fuşya + sarı, ~10-27KB), 8 kez
 *     tekrar kullanılıyor — tarayıcı ilk istekten sonra önbellekten
 *     okuyor, aynı anda birden fazla ağ isteği olmuyor.
 *
 * Etiket davranışı: varsayılanda yalnızca taş görünür. Hizmet adı ve
 * onaylı tek satır tanımı (WWD-02) yalnızca hover / klavye odağı /
 * dokunmada o taş için açılır — sekiz etiket aynı anda açıkken üst üste
 * binip okunaksız oluyordu. Merkezdeki HİBRİD düğümü istisna, hep açık.
 */
export function SolarSystem() {
  const reducedMotion = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [webglFailed, setWebglFailed] = useState(false);
  /** Etiketi açık olan taşın indeksi — aynı anda yalnızca biri. */
  const [activeStone, setActiveStone] = useState<number | null>(null);

  const tWwd = useTranslations("whatWeDo");
  const wwdList = tWwd.raw("list") as Array<{ title: string; body: string }>;
  const subtitleFor = useCallback(
    (wwdTitle: string) =>
      wwdList.find((item) => item.title === wwdTitle)?.body ?? "",
    [wwdList],
  );

  /**
   * Dokunmatik cihazda :hover güvenilir çalışmaz; ilk dokunuş etiketi
   * açar, aynı taşa ikinci dokunuş sayfaya gider.
   *
   * State (ref değil): "açılmadan gezinme yok" kuralı href'i render
   * sırasında kaldırarak uygulanıyor, dolayısıyla değeri değişince
   * yeniden render gerekiyor. Sunucuda false başlar — SSR HTML'inde
   * bütün taşlar gerçek link olarak kalır (tarayıcı/arama motoru
   * tarafında bağlantılar kaybolmaz).
   */
  const [coarsePointer, setCoarsePointer] = useState(false);
  useEffect(() => {
    setCoarsePointer(window.matchMedia("(hover: none)").matches);
  }, []);
  const coarsePointerRef = useRef(false);
  coarsePointerRef.current = coarsePointer;

  // Dokunmatikte pointerenter de tetiklendiği için etiketi ORADA açmıyoruz:
  // açsaydık click anında "zaten açıktı" sayılıp ilk dokunuş doğrudan
  // gezinirdi. Dokunmatikte açma işi yalnızca click'e ait.
  const isCoarse = () => coarsePointerRef.current;

  const onStoneEnter = (index: number) => {
    if (isCoarse()) return;
    setActiveStone(index);
  };

  const clearStone = (index: number) => {
    if (isCoarse()) return;
    setActiveStone((current) => (current === index ? null : current));
  };

  /**
   * Taşlar sürekli döndüğü için imleç sabitken taş altından kayabiliyor;
   * bu durumda pointerleave tetiklenmiyor ve etiket havada asılı kalıyor.
   * Sahne üzerindeki her gerçek imleç hareketinde hedef aktif taşın
   * dışındaysa etiketi kapatarak durumu kendi kendine düzeltiyoruz.
   */
  const onStagePointerMove = (event: React.PointerEvent) => {
    if (activeStone === null || isCoarse()) return;
    const active = linkRefs.current[activeStone];
    if (active && event.target instanceof Node && active.contains(event.target)) {
      return;
    }
    setActiveStone(null);
  };

  // Taş dışına dokunulunca/tıklanınca açık etiket kapanır.
  useEffect(() => {
    if (activeStone === null) return;
    const onDocPointerDown = (event: PointerEvent) => {
      const stage = stageRef.current;
      if (!stage) return;
      if (!(event.target instanceof Node) || !stage.contains(event.target)) {
        setActiveStone(null);
      }
    };
    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, [activeStone]);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    const holder = Symbol("solar-system");
    let holdsLock = false;

    let scene: SceneHandle | null = null;
    try {
      scene = createSolarSystemScene(canvas);
    } catch (error) {
      console.error("WebGL scene failed:", error);
    }

    if (!scene) {
      setWebglFailed(true);
      return;
    }

    let frameId: number | null = null;
    let visible = false;
    let pointerNdcX = 0;
    let pointerNdcY = 0;
    const start = performance.now();

    // HTML link katmanını shader'daki taş konumlarıyla aynı matematikten
    // besler — böylece taş görseli ve etiketi WebGL'deki halka ile
    // birlikte hareket eder. İmleç yaklaştıkça taş hafifçe büyür (aynı
    // "elastik fare tepkisi" hissi, shader'daki ışıma boost'uyla eşleşir).
    const positionLinks = (seconds: number) => {
      const rect = stage.getBoundingClientRect();
      const scale = Math.min(rect.width, rect.height);
      orbitStones.forEach((_, index) => {
        const link = linkRefs.current[index];
        if (!link) return;
        const { x, y } = stoneScreenPosition(index, seconds);
        link.style.left = `${rect.width / 2 + x * scale}px`;
        link.style.top = `${rect.height / 2 - y * scale}px`;

        const dx = pointerNdcX - x;
        const dy = pointerNdcY - y;
        const boost = Math.max(0, 1 - Math.hypot(dx, dy) / 0.35);
        link.style.setProperty("--stone-boost", boost.toFixed(3));
      });
    };

    const loop = () => {
      if (!visible || !scene) return;
      const seconds = (performance.now() - start) / 1000;
      scene.renderFrame(seconds);
      positionLinks(seconds);
      frameId = requestAnimationFrame(loop);
    };

    // Sahne kilidi görünürlükle alınır ve bırakılır: hero'daki HIBRID
    // sahnesi ekrandan çıkınca kilidi serbest bırakır, bu sahne de kendi
    // sırası gelince alır. Böylece "aynı anda en fazla BİR WebGL sahnesi"
    // kuralı korunurken ikisi de çalışabilir.
    let inView = false;
    let unsubscribeWait: (() => void) | null = null;

    const startIfPossible = () => {
      if (!inView || visible) return;
      if (!holdsLock) holdsLock = acquireSceneLock(holder);
      if (!holdsLock) {
        // Kilit başkasında: sıraya gir, boşalınca otomatik başla.
        unsubscribeWait ??= onSceneLockReleased(() => {
          unsubscribeWait = null;
          startIfPossible();
        });
        return;
      }
      visible = true;
      scene?.resize();
      if (frameId === null) loop();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) {
          startIfPossible();
        } else {
          // Ekrandan çıktı — döngü durur (CLAUDE.md performans kuralı).
          visible = false;
          if (frameId !== null) {
            cancelAnimationFrame(frameId);
            frameId = null;
          }
          unsubscribeWait?.();
          unsubscribeWait = null;
          if (holdsLock) {
            releaseSceneLock(holder);
            holdsLock = false;
          }
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(stage);

    // Canvas'ın çizim tamponu, CSS boyutu her değiştiğinde yeniden
    // ayarlanmalı. Yalnızca window resize dinlemek yetmiyor: aspect-ratio
    // ve font yüklemesi layout'u sahne kurulduktan SONRA da değiştirebiliyor
    // ve tampon eski kalınca canvas'ın bir şeridi hiç çizilmemiş görünüyordu.
    const resizeObserver = new ResizeObserver(() => scene?.resize());
    resizeObserver.observe(stage);

    const onPointerMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      const scale = Math.min(rect.width, rect.height);
      pointerNdcX = (event.clientX - rect.left - rect.width / 2) / scale;
      pointerNdcY = -(event.clientY - rect.top - rect.height / 2) / scale;
      scene?.setPointer(pointerNdcX, pointerNdcY);
    };
    stage.addEventListener("pointermove", onPointerMove);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      stage.removeEventListener("pointermove", onPointerMove);
      unsubscribeWait?.();
      if (frameId !== null) cancelAnimationFrame(frameId);
      scene?.dispose();
      releaseSceneLock(holder);
    };
  }, [reducedMotion]);

  const useStaticFallback = reducedMotion || webglFailed;

  return (
    <section className={styles.section} aria-labelledby="solar-system-title">
      <h2 id="solar-system-title" className={styles.title}>
        {SOLAR_SYSTEM_TITLE}
      </h2>

      {useStaticFallback ? (
        <ul className={styles.fallbackList}>
          {orbitStones.map((stone) => (
            <li key={stone.orbit}>
              <Link href={stone.href} className={styles.fallbackLink}>
                {stone.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div
          className={styles.stage}
          ref={stageRef}
          onPointerMove={onStagePointerMove}
          onPointerLeave={() => !isCoarse() && setActiveStone(null)}
        >
          <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
          <span className={styles.center} aria-hidden="true">
            HIBRID
          </span>
          {orbitStones.map((stone, index) => {
            const isActive = activeStone === index;
            // Dokunmatikte etiket açılmadan gezinme yok. Bu, href'i hiç
            // render etmeyerek uygulanıyor: preventDefault/stopPropagation
            // ile Link'in gezinmesini durdurmak güvenilir değildi (test
            // edildi, sayfa yine değişiyordu). href yoksa gidilecek bir
            // hedef de yok — davranış olay sırasına bağlı kalmıyor.
            const navigable = !coarsePointer || isActive;

            const shared = {
              className: `${styles.stoneLink} ${isActive ? styles.stoneLinkActive : ""}`,
              // Taşın kendi marka rengi — hover glow'u bu renkten türer,
              // marka dışı renk eklenmez (CLAUDE.md).
              style: {
                "--stone-glow":
                  stone.color === "yellow"
                    ? "var(--color-brand-yellow)"
                    : "var(--color-brand-fuchsia)",
              } as React.CSSProperties,
              ref: (node: HTMLAnchorElement | null) => {
                linkRefs.current[index] = node;
              },
              onPointerEnter: () => onStoneEnter(index),
              onPointerLeave: () => clearStone(index),
              // Klavye odağı işaretleme tipinden bağımsız çalışır.
              onFocus: () => setActiveStone(index),
              onBlur: () =>
                setActiveStone((current) => (current === index ? null : current)),
            };

            const body = (
              <>
                {/* next/image kasıtlı olarak kullanılmıyor: bu görsel zaten
                    önceden optimize edilmiş WebP (bkz. public/images/stones/,
                    hazırlık script'i commit mesajında), sabit boyutlu ve
                    konumu JS ile mutlak (absolute) piksele yazılıyor —
                    next/image'ın sunucu tarafı yeniden boyutlandırması burada
                    fayda sağlamaz ve Cloudflare Workers'ta ayrı bir görsel
                    optimizasyon binding'i gerektirirdi. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/images/stones/stone-${stone.color}.webp`}
                  srcSet={`/images/stones/stone-${stone.color}.webp 1x, /images/stones/stone-${stone.color}@2x.webp 2x`}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  width={STONE_INTRINSIC[stone.color].width}
                  height={STONE_INTRINSIC[stone.color].height}
                  className={styles.stoneImage}
                />
                {/* Etiket akış dışında (absolute): link kutusu yalnızca
                    taş görselinden oluşsun ki translate(-50%,-50%) taşın
                    kendi merkezini yörüngeye otursun. Daha önce etiket
                    kutunun içindeydi ve taşı yukarı kaydırıyordu. */}
                <span className={styles.stoneLabel}>
                  <span className={styles.stoneLabelName}>{stone.label}</span>
                  <span className={styles.stoneLabelBody}>
                    {subtitleFor(stone.wwdTitle)}
                  </span>
                </span>
              </>
            );

            if (navigable) {
              return (
                <Link key={stone.orbit} href={stone.href} {...shared}>
                  {body}
                </Link>
              );
            }

            // Dokunmatik + henüz açılmamış: gezinmeyen, etiketi açan düğme.
            // SSR'da coarsePointer false olduğu için bu dal sunucuda hiç
            // render edilmez; HTML'de tüm taşlar gerçek <a href> kalır.
            return (
              <a
                key={stone.orbit}
                {...shared}
                role="button"
                tabIndex={0}
                aria-expanded={false}
                aria-label={stone.label}
                onClick={() => setActiveStone(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActiveStone(index);
                  }
                }}
              >
                {body}
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}
