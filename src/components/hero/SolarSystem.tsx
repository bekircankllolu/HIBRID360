"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  orbitStones,
  CRYSTAL_MEDIA,
  SOLAR_BODIES,
  SOLAR_CAMERA,
  SOLAR_STAR_RADIUS,
  SOLAR_SYSTEM_TITLE,
  STONE_SERVICE_KEYS,
} from "@/data/solar-system";
import { SERVICE_OFFERINGS } from "@/data/service-offerings";
import { chapterOf, formatDegree } from "@/lib/service-chapter";
import {
  approach,
  approachVec,
  focusDistance,
  orbitPosition,
  shortestAngle,
  type CameraState,
  type Vec3,
} from "@/lib/solar-orbits";
import { createSolarScene, type SolarBodyDef, type SolarScene } from "@/lib/solar-scene";
import { acquireSceneLock, onSceneLockReleased, releaseSceneLock } from "@/lib/webgl-scene";
import styles from "./SolarSystem.module.css";

/**
 * Hibrid ekosistemi — WebGL uzay sahnesi.
 *
 * 18 Eylül 2026 kullanıcı revizyonu: *"ortadaki hibrit taşını görüyoruz, bu
 * bir yıldız; etrafında dönenler gezegenler. Arka planda yıldızları görelim,
 * gerçek bir uzay yaratalım. Üzerine tıkladığımızda o gezegen bize
 * yakınlaşsın, boşluğa tıklayınca uzaklaşsın. Tıklayınca çok detaylı bir
 * şekilde özelliklerini görelim — şu an çok yüzeysel."*
 *
 * Önceki sürüm Canvas 2B idi: düz noktalar, elips halkalar, sahte derinlik.
 * Şimdi gerçek 3B (bkz. `src/lib/solar-scene.ts`), gerçek Kepler yörüngeleri
 * (`src/lib/solar-orbits.ts`) ve kamera uçuşu var.
 *
 * ## Korunan sözleşmeler
 * - Etiketler CANVAS'TA DEĞİL, DOM'da: gerçek `<button>`'lar, klavye sırası
 *   ve ekran okuyucu adları aynen çalışıyor; her kare 3B konumdan ekran
 *   koordinatına izdüşümle taşınıyorlar (React render'ı yok).
 * - WCAG 2.2.2: kendiliğinden dönen sahne duraklatılabilir.
 * - `prefers-reduced-motion`: tek statik kare çizilir, video hiç yüklenmez.
 * - Video (kristal) yalnız sahne görünür alana girince indirilir.
 * - Tek WebGL sahnesi kilidi (`acquireSceneLock`) — hero ile çakışmaz.
 * - WebGL yoksa poster görseline düşer.
 */

const FOV = Math.PI / 4;
const DRAG_THRESHOLD = 6;

/**
 * 20 Eylül 2026 — PARÇACIK SÜRÜMÜNDEN GERİ DÖNÜLDÜ. Kullanıcı: *"gezegen
 * list sistem olabilir, bundan bir önceki yaptığımız, onu geri getirelim.
 * ekosistem düzenlemesini bir türlü beğenemedim."* Dokulu gezegen sahnesi
 * (`solar-scene.ts`) hiç silinmemişti — yalnız kullanımdan kaldırılmıştı,
 * bu yüzden geri dönüş bir dosya değişimi. Parçacık sahnesi
 * (`solar-dust-scene.ts`, `solar-dust.ts`) dosyada duruyor, kullanılmıyor.
 */
function bodyDefs(): SolarBodyDef[] {
  return SOLAR_BODIES.map((body) => ({
    id: body.id,
    albedo: `/images/site/solar/${body.id}-albedo.webp`,
    height: `/images/site/solar/${body.id}-height.webp`,
    radius: body.radius,
    tilt: body.tilt,
    spin: body.spin,
    orbit: body.orbit,
    ring: "ring" in body ? body.ring : undefined,
    nightLights: "nightLights" in body ? body.nightLights : undefined,
  }));
}

export function SolarSystem() {
  const reducedMotion = usePrefersReducedMotion();
  const locale = useLocale();
  const t = useTranslations("common");
  const wwd = useTranslations("whatWeDo");
  const descriptions = wwd.raw("list") as Array<{ title: string; body: string }>;

  const [active, setActive] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Kare döngüsünün okuduğu değerler ref'te: React render'ı kare başına
  // çalışmasın (sahne 60fps, state 8 öğe için yeterince yavaş değişiyor).
  const focusRef = useRef<number>(-1);
  const pausedRef = useRef(false);
  /**
   * İmleç (ya da klavye odağı) bir gezegenin üstündeyken sistem duruyor.
   * İki sebep: hareket eden 44px'lik bir hedefe tıklamak zor — Playwright
   * bile "element is not stable" diyip tıklayamadı; ve sahne "nefesini
   * tutuyor" gibi okunuyor. Durma ani değil, sönümlenerek (`timeScaleRef`).
   */
  const hoverRef = useRef<number | null>(null);
  const timeScaleRef = useRef(1);
  const dragRef = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const cameraRef = useRef<CameraState>({
    target: [0, 0, 0],
    distance: SOLAR_CAMERA.distance,
    yaw: SOLAR_CAMERA.yaw,
    pitch: SOLAR_CAMERA.pitch,
  });
  const yawDriftRef = useRef(SOLAR_CAMERA.yaw);
  const manualYawRef = useRef(0);
  const manualPitchRef = useRef(0);

  const bodies = useMemo(bodyDefs, []);

  useEffect(() => {
    focusRef.current = active ?? -1;
  }, [active]);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    const video = videoRef.current;
    let live: SolarScene | null = null;
    let attempted = false;

    /**
     * Sahne GÖRÜNÜR ALANA GİRİNCE kuruluyor, mount'ta değil. Kurulum
     * sekiz gezegenin dokusunu (~300 KB) indiriyor; sayfanın altındaki bir
     * bölüm için bunu peşin ödemek performans bütçesini deler (CLAUDE.md;
     * e2e "medya görünür alana girmeden indirilmiyor" nöbetçisi).
     */
    const ensureScene = (): SolarScene | null => {
      if (live || attempted) return live;
      attempted = true;
      try {
        live = createSolarScene({
          canvas,
          bodies,
          starTexture: reducedMotion ? null : video,
          starRadius: SOLAR_STAR_RADIUS,
        });
      } catch (error) {
        console.error("Solar scene failed:", error);
      }
      if (!live) {
        setUnavailable(true);
        stage.dataset.scene = "fallback";
        return null;
      }
      stage.dataset.scene = "webgl";
      stage.dataset.running = "false";
      live.resize();
      return live;
    };

    const holder = Symbol("solar-system");
    let frameId: number | null = null;
    let running = false;
    let inView = false;
    let holdsLock = false;
    let unsubscribe: (() => void) | null = null;
    let last = 0;
    let sceneTime = 0;

    const positions: Vec3[] = bodies.map((body) => orbitPosition(body.orbit, 0));

    /**
     * Etiket kalabalığını açar. Gezegenler bir araya geldiğinde (iç
     * yörüngeler sık) iki üç etiket üst üste biniyordu; ekranda yakın
     * duran etiketler dikeyde ayrılıyor. Basit ve ucuz: sekiz öğe için
     * tek geçiş yeterli, düzen kararlı kalsın diye hep aynı sırada.
     */
    const declutter = (placed: Array<{ x: number; y: number } | null>) => {
      const MIN_Y = 17;
      const MAX_X = 150;
      for (let i = 1; i < placed.length; i++) {
        const current = placed[i];
        if (!current) continue;
        for (let j = 0; j < i; j++) {
          const other = placed[j];
          if (!other) continue;
          if (Math.abs(current.x - other.x) > MAX_X) continue;
          const gap = current.y - other.y;
          if (Math.abs(gap) >= MIN_Y) continue;
          current.y = other.y + (gap >= 0 ? MIN_Y : -MIN_Y);
        }
      }
    };

    const layoutLabels = (scene: SolarScene) => {
      const focus = focusRef.current;
      const centre = scene.project([0, 0, 0]);
      const placed: Array<{ x: number; y: number } | null> = [];
      for (const [index, position] of positions.entries()) {
        const element = labelRefs.current[index];
        if (!element) continue;
        const screen = scene.project(position);
        if (!screen.visible) {
          element.style.opacity = "0";
          element.style.pointerEvents = "none";
          placed.push(null);
          continue;
        }
        // Uzaktaki etiket soluk: derinlik hissi yazıda da sürsün.
        const fade = Math.max(0.35, Math.min(1, 26 / screen.distance));
        // Etiket gezegenden YILDIZIN TERSİ yöne kayıyor: hem gezegenin
        // üstünü kapatmıyor hem de sekiz etiket birbirinden ayrışıyor
        // (hepsi merkeze bakan bir çember üzerinde dağılıyor).
        const dx = screen.x - centre.x;
        const dy = screen.y - centre.y;
        const length = Math.hypot(dx, dy) || 1;
        const focal = canvas.clientHeight / (2 * Math.tan(FOV / 2));
        const radiusPx = (bodies[index].radius / Math.max(0.001, screen.distance)) * focal;
        // Kap gezegenin TAM ÜSTÜNDE (tıklama hedefi gezegenin kendisi),
        // yazı ise yıldızın tersine doğru kayıyor — gezegeni örtmüyor.
        const push = radiusPx + 20;
        element.style.transform = `translate3d(${screen.x.toFixed(1)}px, ${screen.y.toFixed(1)}px, 0)`;
        placed.push({
          x: screen.x + (dx / length) * push,
          y: screen.y + (dy / length) * push,
        });
        // Odak halkası gezegenin ekrandaki boyutuna göre büyüyor.
        element.style.setProperty("--ring", `${Math.max(26, radiusPx * 2.3).toFixed(0)}px`);
        // Odaktaki gezegenin etiketi gizleniyor: adını zaten panel yazıyor,
        // etiket gezegenin yüzünü örtüyordu. Diğerleri soluklaşıyor.
        element.style.opacity =
          focus === index ? "0" : focus >= 0 ? "0.22" : fade.toFixed(2);
        element.style.pointerEvents = "auto";
        element.style.zIndex = String(1000 - Math.round(screen.distance * 10));
      }

      // Kalabalık açıldıktan SONRA yazının kaymasını yaz: kap (tıklama
      // hedefi) gezegenin üstünde kalıyor, yalnız yazı yer değiştiriyor.
      declutter(placed);
      for (const [index, spot] of placed.entries()) {
        const element = labelRefs.current[index];
        if (!element || !spot) continue;
        const screen = scene.project(positions[index]);
        element.style.setProperty("--label-x", `${(spot.x - screen.x).toFixed(1)}px`);
        element.style.setProperty("--label-y", `${(spot.y - screen.y).toFixed(1)}px`);
      }
    };

    const step = (now: number) => {
      frameId = null;
      const scene = live;
      if (!scene) return;
      const delta = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      const wantsStill = hoverRef.current !== null;
      timeScaleRef.current = approach(timeScaleRef.current, wantsStill ? 0 : 1, 6, delta);
      if (!pausedRef.current) sceneTime += delta * timeScaleRef.current;

      for (const [index, body] of bodies.entries()) {
        positions[index] = orbitPosition(body.orbit, sceneTime);
      }

      const focus = focusRef.current;
      const camera = cameraRef.current;
      if (focus >= 0 && positions[focus]) {
        // Yıldız kameranın ARKASINDA kalsın: gezegenin aydınlık yüzünü
        // görüyoruz. Göz, yıldızla gezegen arasındaki doğruda duruyor.
        const p = positions[focus];
        const length = Math.hypot(p[0], p[1], p[2]) || 1;
        const goalYaw = Math.atan2(-p[0], -p[2]);
        const goalPitch = Math.asin(Math.max(-1, Math.min(1, -p[1] / length))) + 0.14;
        camera.target = approachVec(camera.target, p, 3.2, delta);
        camera.distance = approach(
          camera.distance,
          focusDistance(bodies[focus].radius, FOV),
          3.0,
          delta,
        );
        camera.yaw = approach(shortestAngle(camera.yaw, goalYaw + manualYawRef.current), goalYaw + manualYawRef.current, 2.6, delta);
        camera.pitch = approach(camera.pitch, goalPitch + manualPitchRef.current, 2.6, delta);
      } else {
        // Kamera kayması da aynı zaman ölçeğine bağlı: gezegenin üstünde
        // dururken sahnenin tamamı duruyor, yalnız gezegenler değil.
        if (!pausedRef.current) {
          yawDriftRef.current += SOLAR_CAMERA.drift * delta * timeScaleRef.current;
        }
        const goalYaw = yawDriftRef.current + manualYawRef.current;
        camera.target = approachVec(camera.target, [0, 0, 0], 2.4, delta);
        camera.distance = approach(camera.distance, SOLAR_CAMERA.distance, 2.2, delta);
        camera.yaw = approach(shortestAngle(camera.yaw, goalYaw), goalYaw, 2.4, delta);
        camera.pitch = approach(camera.pitch, SOLAR_CAMERA.pitch + manualPitchRef.current, 2.4, delta);
      }

      scene.render({ timeSeconds: sceneTime, camera, focus, positions });
      layoutLabels(scene);
      if (running) frameId = requestAnimationFrame(step);
    };

    const stop = () => {
      running = false;
      stage.dataset.running = "false";
      last = 0;
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
      video?.pause();
      if (holdsLock) {
        releaseSceneLock(holder);
        holdsLock = false;
      }
    };

    const start = () => {
      if (!inView || running || document.hidden || reducedMotion) return;
      if (!ensureScene()) return;
      if (!holdsLock) holdsLock = acquireSceneLock(holder);
      if (!holdsLock) {
        unsubscribe ??= onSceneLockReleased(() => {
          unsubscribe = null;
          start();
        });
        return;
      }
      running = true;
      stage.dataset.running = "true";
      // Kristal videosu YALNIZ burada yükleniyor: sahneyi hiç görmeyen
      // ziyaretçi dosyayı indirmez (CLAUDE.md performans bütçesi).
      if (video && !video.src) {
        video.src = CRYSTAL_MEDIA.interactive;
        video.load();
      }
      video?.play().catch(() => undefined);
      frameId = requestAnimationFrame(step);
    };

    /** Hareket azaltma: tek kare, gezegenler başlangıç konumlarında. */
    const renderStill = () => {
      const scene = ensureScene();
      if (!scene) return;
      scene.render({ timeSeconds: 0, camera: cameraRef.current, focus: -1, positions });
      layoutLabels(scene);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) {
          if (reducedMotion) renderStill();
          else start();
        } else {
          unsubscribe?.();
          unsubscribe = null;
          stop();
        }
      },
      { rootMargin: "10% 0px" },
    );
    observer.observe(stage);

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const resizeObserver = new ResizeObserver(() => {
      if (!live) return;
      live.resize();
      if (reducedMotion) renderStill();
    });
    resizeObserver.observe(canvas);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      unsubscribe?.();
      stop();
      live?.dispose();
    };
  }, [bodies, reducedMotion]);

  /* ------------------------------------------------------------ etkileşim */

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    dragRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
  }, []);

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    drag.moved = true;
    drag.x = event.clientX;
    drag.y = event.clientY;
    // Sürükleme kamerayı döndürür (eski sürümde gezegenler sürükleniyordu;
    // 3B'de sahneyi gezmek çok daha doğal). Dikey açı sınırlı: kutba
    // yapışınca sahne düzleşiyor.
    manualYawRef.current -= dx * 0.005;
    manualPitchRef.current = Math.max(-0.5, Math.min(0.7, manualPitchRef.current + dy * 0.004));
  }, []);

  const endDrag = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag || drag.moved) return;
    // Sürükleme değil, tıklama: boşluğa tıklandıysa odaktan çık.
    const target = event.target as HTMLElement;
    if (target.closest("button") || target.closest("[data-detail]")) return;
    setActive(null);
  }, []);

  const dismiss = useCallback(
    (returnFocus: boolean) => {
      const index = active;
      setActive(null);
      if (returnFocus && index !== null) buttonRefs.current[index]?.focus();
    },
    [active],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        dismiss(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, dismiss]);

  const selected = active === null ? null : orbitStones[active];
  const selectedKey = active === null ? null : STONE_SERVICE_KEYS[active];
  const selectedBody = selected
    ? (descriptions.find((item) => item.title === selected.wwdTitle)?.body ?? "")
    : "";
  const offerings = selectedKey ? SERVICE_OFFERINGS[selectedKey] : [];
  const degree = selectedKey ? formatDegree(chapterOf(selectedKey).degree) : "";

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="solar-system-title"
      style={{ "--crystal-scale": CRYSTAL_MEDIA.scale } as CSSProperties}
    >
      <div className={styles.heading}>
        {/* Başlık iki katmanlı okunuyor — üstte ince "One Hybrid Production",
            altta harf aralığı açılmış ECOSYSTEM. Erişilebilir ad özgün
            cümle olarak kalıyor. */}
        <h2 id="solar-system-title" className={styles.title} aria-label={SOLAR_SYSTEM_TITLE}>
          <span className={styles.titleLead} aria-hidden="true">
            One Hybrid Production
          </span>
          <span className={styles.titleWord} aria-hidden="true">
            Ecosystem
          </span>
        </h2>
        <p className={styles.instruction}>
          {locale === "tr"
            ? "Gezegene tıklayın: yakınlaşır ve o hizmetin tamamını gösterir. Sürükleyerek sistemi çevirin."
            : "Click a planet to fly closer and see the full service. Drag to turn the system."}
        </p>
      </div>

      <div
        className={styles.stage}
        ref={stageRef}
        data-testid="ecosystem-stage"
        // Test kancaları (MONA sahnesiyle aynı desen): sahne türü, kare
        // döngüsünün durumu ve hangi gezegenin odakta olduğu.
        data-motion={reducedMotion || paused ? "paused" : "running"}
        data-scene="pending"
        data-focus={active === null ? "none" : orbitStones[active].label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
      >
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

        {!reducedMotion && (
          <button
            type="button"
            className={`${styles.control} ${styles.playbackControl}`}
            onClick={() => setPaused((value) => !value)}
            aria-label={paused ? t("resumeAnimation") : t("pauseAnimation")}
            aria-pressed={paused}
            title={paused ? t("resumeAnimation") : t("pauseAnimation")}
          >
            <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span>
          </button>
        )}

        {unavailable && (
          <Image
            src={CRYSTAL_MEDIA.poster}
            width={512}
            height={512}
            sizes="350px"
            alt=""
            className={styles.fallback}
          />
        )}

        {/* Kristal videosu yıldızın yüzey dokusu. Kaynak JS ile veriliyor —
            sahne görünmeden indirilmesin. */}
        <video
          ref={videoRef}
          className={styles.mediaSource}
          width={512}
          height={512}
          preload="none"
          muted
          loop
          playsInline
          crossOrigin="anonymous"
          aria-hidden="true"
          tabIndex={-1}
        />

        {orbitStones.map((stone, index) => (
          <div
            key={stone.orbit}
            ref={(el) => {
              labelRefs.current[index] = el;
            }}
            className={`${styles.point} ${active === index ? styles.pointActive : ""}`}
            style={{ "--stone-color": `var(--color-brand-${stone.color})` } as CSSProperties}
          >
            <button
              ref={(el) => {
                buttonRefs.current[index] = el;
              }}
              type="button"
              className={styles.dot}
              aria-label={stone.label}
              aria-expanded={active === index}
              aria-controls="ecosystem-detail"
              aria-haspopup="dialog"
              onPointerEnter={() => {
                hoverRef.current = index;
              }}
              onPointerLeave={() => {
                if (hoverRef.current === index) hoverRef.current = null;
              }}
              onFocus={() => {
                hoverRef.current = index;
              }}
              onBlur={() => {
                if (hoverRef.current === index) hoverRef.current = null;
              }}
              onClick={() => setActive((value) => (value === index ? null : index))}
            >
              <span className={styles.dotCore} aria-hidden="true" />
              <span className={styles.dotLabel} aria-hidden="true">
                {stone.label}
              </span>
            </button>
          </div>
        ))}

        <div
          ref={detailRef}
          id="ecosystem-detail"
          data-detail=""
          className={styles.detail}
          hidden={!selected}
          role="dialog"
          aria-modal="false"
          aria-labelledby={selected ? "ecosystem-detail-title" : undefined}
          aria-describedby={selected ? "ecosystem-detail-description" : undefined}
          tabIndex={-1}
          style={
            {
              "--stone-color": selected ? `var(--color-brand-${selected.color})` : undefined,
            } as CSSProperties
          }
        >
          {selected && (
            <>
              <div className={styles.detailHeader}>
                <p className={styles.detailDegree} aria-hidden="true">
                  {degree}
                </p>
                <h3 id="ecosystem-detail-title">{selected.label}</h3>
                <button
                  type="button"
                  className={styles.control}
                  onClick={() => dismiss(true)}
                  aria-label={t("closeDetails")}
                  title={t("closeDetails")}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <p id="ecosystem-detail-description">{selectedBody}</p>
              {offerings.length > 0 && (
                <ul className={styles.detailList}>
                  {offerings.map((item) => (
                    <li key={item} lang="en">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              <Link href={selected.href} className={styles.detailLink}>
                {t("learnMore")} <span aria-hidden="true">→</span>
              </Link>
            </>
          )}
        </div>
      </div>

      <noscript>
        <nav aria-label={SOLAR_SYSTEM_TITLE}>
          {orbitStones.map((stone) => (
            <Link key={stone.orbit} href={stone.href}>
              {stone.label}{" "}
            </Link>
          ))}
        </nav>
      </noscript>
    </section>
  );
}
