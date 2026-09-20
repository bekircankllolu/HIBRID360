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
import { Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useEcosystemSound } from "@/hooks/useEcosystemSound";
import {
  orbitStones,
  CRYSTAL_MEDIA,
  SOLAR_SYSTEM_TITLE,
  STONE_SERVICE_KEYS,
} from "@/data/solar-system";
import { SERVICE_OFFERINGS } from "@/data/service-offerings";
import { chapterOf, formatDegree } from "@/lib/service-chapter";
import {
  ECO_BODIES,
  ECO_CAMERA,
  ECO_FOCUS_NDC,
  ECO_FOV,
  bodyPosition,
  ecosystemFocusDistance,
  swayYaw,
} from "@/lib/ecosystem-orbits";
import type { EcosystemBodyDef, EcosystemScene } from "@/lib/ecosystem-scene";
import {
  approach,
  approachVec,
  cross,
  normalize,
  shortestAngle,
  type CameraState,
  type Vec3,
} from "@/lib/solar-orbits";
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

const FOV = ECO_FOV;
const DRAG_THRESHOLD = 6;

/**
 * 20 Eylül 2026 — YENİ EKOSİSTEM (`feat/ecosystem-orbit`). Kullanıcı
 * referansları: eşmerkezli ince halkalar, cilalı küreler, merkezde yeni
 * HIBRID 360° kristali; küreye tıklayınca kamera yaklaşır, arka plan
 * bulanıklaşır, yanda cam kart açılır. Sahne Three.js (`ecosystem-scene.ts`)
 * ve tembel yüklenir. Eski dokulu-gezegen sahnesi (`solar-scene.ts`) ve
 * parçacık sahnesi dosyada duruyor, kullanılmıyor (silme onayı bekliyor).
 */
function bodyDefs(): EcosystemBodyDef[] {
  return ECO_BODIES.map((body, index) => ({
    radius: body.radius,
    color: orbitStones[index].color,
  }));
}

/** Dokunmatik / dar / zayıf cihazlarda kalite kademesi (bloom ve MSAA kapanır). */
function pickQuality(): "high" | "medium" {
  if (typeof window === "undefined") return "high";
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 820;
  const weak = (navigator.hardwareConcurrency ?? 8) <= 4;
  return coarse || narrow || weak ? "medium" : "high";
}

export function SolarSystem() {
  const reducedMotion = usePrefersReducedMotion();
  const locale = useLocale();
  const t = useTranslations("common");
  const video_t = useTranslations("video");
  const sound = useEcosystemSound();
  // Kare döngüsü efekti bağımlılık dizisinde yeniden kurulmasın diye ref üzerinden.
  const soundRef = useRef(sound);
  soundRef.current = sound;
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
  const connectorRef = useRef<SVGSVGElement>(null);
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
    target: ECO_CAMERA.target,
    distance: ECO_CAMERA.distance,
    yaw: ECO_CAMERA.yaw,
    pitch: ECO_CAMERA.pitch,
  });
  /** 0 → 1: odaktayken arka planın bulanıklığı (yumuşatılmış). */
  const focusBlurRef = useRef(0);
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
    let live: EcosystemScene | null = null;
    let attempted = false;
    let disposed = false;

    /**
     * Sahne GÖRÜNÜR ALANA GİRİNCE kuruluyor, mount'ta değil: Three.js
     * paketi (`import()` ile ayrı parça) ve kristal videosu ancak o zaman
     * iniyor (performans bütçesi; e2e "medya görünür alana girmeden
     * indirilmiyor" nöbetçisi). Kurulum asenkron: ilk çağrı `null` döner,
     * yükleme bitince `start`/`renderStill` kendini yeniden çağırır.
     */
    const failScene = () => {
      setUnavailable(true);
      stage.dataset.scene = "fallback";
    };
    const ensureScene = (): EcosystemScene | null => {
      if (live || attempted) return live;
      attempted = true;
      import("@/lib/ecosystem-scene")
        .then(({ createEcosystemScene }) => {
          if (disposed) return;
          live = createEcosystemScene({
            canvas,
            bodies,
            crystalVideo: reducedMotion ? null : video,
            crystalPoster: CRYSTAL_MEDIA.poster,
            stage,
            quality: pickQuality(),
            // Hareket azaltmada tek kare çiziliyor: poster sonradan inince
            // (asenkron) kareyi yeniden çiz, yoksa kristal boş kalıyor.
            onTextureLoad: () => {
              if (reducedMotion && live && inView) renderStill();
            },
          });
          if (!live) {
            failScene();
            return;
          }
          stage.dataset.scene = "webgl";
          stage.dataset.running = "false";
          live.resize();
          if (!inView) return;
          if (reducedMotion) renderStill();
          else start();
        })
        .catch((error: unknown) => {
          console.error("Ecosystem scene failed:", error);
          if (!disposed) failScene();
        });
      return null;
    };

    const holder = Symbol("solar-system");
    let frameId: number | null = null;
    let running = false;
    let inView = false;
    let holdsLock = false;
    let unsubscribe: (() => void) | null = null;
    let last = 0;
    let sceneTime = 0;

    const positions: Vec3[] = ECO_BODIES.map((body) => bodyPosition(body, 0));

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

    const layoutLabels = (scene: EcosystemScene) => {
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
          // Ekranda olmayan küre sekme sırasından da çıkar: görünmez bir
          // düğmeye odaklanmak WCAG 2.4.7 ihlali (ve sahneyi durdurup ses çalıyor).
          element.style.visibility = "hidden";
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
        const focal = stage.clientHeight / (2 * Math.tan(FOV / 2));
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
        element.style.opacity = focus === index ? "1" : focus >= 0 ? "0.22" : fade.toFixed(2);
        element.style.pointerEvents = "auto";
        element.style.visibility = "visible";
        element.style.zIndex = String(1000 - Math.round(screen.distance * 10));
      }

      // Odaktaki küreden karta bağlantı çizgisi (2.png): küre kenarından
      // kartın sol-üst köşesine. Yalnız odakta ölçülür (düzen okuması pahalı).
      const connector = connectorRef.current;
      const detail = detailRef.current;
      if (connector && detail && focus >= 0 && !detail.hidden) {
        const from = scene.project(positions[focus]);
        const stageBox = stage.getBoundingClientRect();
        const detailBox = detail.getBoundingClientRect();
        const toX = detailBox.left - stageBox.left;
        const toY = detailBox.top - stageBox.top + 18;
        const dx = toX - from.x;
        const dy = toY - from.y;
        const length = Math.hypot(dx, dy) || 1;
        const focal = stage.clientHeight / (2 * Math.tan(FOV / 2));
        const edge = (bodies[focus].radius / Math.max(0.001, from.distance)) * focal * 1.32;
        const line = connector.firstElementChild as SVGLineElement | null;
        const node = connector.lastElementChild as SVGCircleElement | null;
        if (line && node && length > edge + 8) {
          line.setAttribute("x1", (from.x + (dx / length) * edge).toFixed(1));
          line.setAttribute("y1", (from.y + (dy / length) * edge).toFixed(1));
          line.setAttribute("x2", toX.toFixed(1));
          line.setAttribute("y2", toY.toFixed(1));
          node.setAttribute("cx", toX.toFixed(1));
          node.setAttribute("cy", toY.toFixed(1));
          connector.style.opacity = "1";
        } else {
          connector.style.opacity = "0";
        }
      } else if (connector) {
        connector.style.opacity = "0";
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
      // Üst sınır 0,2 sn: yavaş (yazılım render'lı) cihazlar animasyonu gerçek
      // zamana yakın tutar, sekme arka plandan dönünce de sıçrama olmaz.
      const delta = last ? Math.min(0.2, (now - last) / 1000) : 0.016;
      last = now;
      const wantsStill = hoverRef.current !== null || focusRef.current >= 0;
      timeScaleRef.current = approach(timeScaleRef.current, wantsStill ? 0 : 1, 6, delta);
      if (!pausedRef.current) sceneTime += delta * timeScaleRef.current;

      for (const [index, body] of ECO_BODIES.entries()) {
        positions[index] = bodyPosition(body, sceneTime);
      }

      const focus = focusRef.current;
      const camera = cameraRef.current;
      // Sıfır genişlikte (gizli üst öğe) `fit` Infinity → kalıcı NaN kamera olmasın.
      const aspect = Math.max(0.25, stage.clientWidth / Math.max(1, stage.clientHeight));
      // Dar (dikey) ekranlarda yatay görüş açısı küçülür: kamera geri çekilir.
      const fit = Math.max(1, 1.45 / aspect);
      const baseYaw = swayYaw(sceneTime) + manualYawRef.current;
      if (focus >= 0 && positions[focus]) {
        // Referans (2.png): küre kadrajın sol-altında, kart sağda, kristal
        // uzakta ve arkada. Bunun için kamera kürenin DIŞ tarafına geçip içeri
        // (kristale doğru) bakıyor; iç halkadaki küre için kristal aksi halde
        // kameranın dibinde kalıp ekranı kaplıyordu. Hedef, kürenin `ndc`
        // kadar ters yönüne kaydırılır.
        const p = positions[focus];
        const outward = Math.atan2(p[0], p[2]) + manualYawRef.current;
        const distance = ecosystemFocusDistance(bodies[focus].radius);
        const halfH = camera.distance * Math.tan(FOV / 2);
        const halfW = halfH * aspect;
        const ndc = aspect < 0.9 ? { x: 0, y: 0.34 } : ECO_FOCUS_NDC;
        const cp = Math.cos(camera.pitch);
        const forward: Vec3 = [
          -Math.sin(camera.yaw) * cp,
          -Math.sin(camera.pitch),
          -Math.cos(camera.yaw) * cp,
        ];
        const right = normalize(cross(forward, [0, 1, 0]));
        const up = cross(right, forward);
        const goal: Vec3 = [
          p[0] - right[0] * ndc.x * halfW - up[0] * ndc.y * halfH,
          p[1] - right[1] * ndc.x * halfW - up[1] * ndc.y * halfH,
          p[2] - right[2] * ndc.x * halfW - up[2] * ndc.y * halfH,
        ];
        camera.target = approachVec(camera.target, goal, 3.2, delta);
        camera.distance = approach(camera.distance, distance, 3.0, delta);
        camera.yaw = approach(shortestAngle(camera.yaw, outward), outward, 2.6, delta);
        camera.pitch = approach(camera.pitch, ECO_CAMERA.pitch + manualPitchRef.current, 2.6, delta);
      } else {
        camera.target = approachVec(camera.target, ECO_CAMERA.target, 2.4, delta);
        camera.distance = approach(camera.distance, ECO_CAMERA.distance * fit, 2.2, delta);
        camera.yaw = approach(shortestAngle(camera.yaw, baseYaw), baseYaw, 2.4, delta);
        camera.pitch = approach(camera.pitch, ECO_CAMERA.pitch + manualPitchRef.current, 2.4, delta);
      }
      focusBlurRef.current = approach(focusBlurRef.current, focus >= 0 ? 1 : 0, 4.5, delta);

      // Kaydırma paralaksı: sahne kutusunun ekran ortasına göre konumu (-1..1).
      // Kare başında, DOM yazmalarından ÖNCE okunur (zorunlu yerleşim yok).
      const stageBox = stage.getBoundingClientRect();
      const viewport = Math.max(1, window.innerHeight);
      const parallax = Math.max(
        -1,
        Math.min(1, (viewport / 2 - (stageBox.top + stageBox.height / 2)) / viewport),
      );

      scene.render({
        timeSeconds: sceneTime,
        camera,
        focus,
        focusBlur: focusBlurRef.current,
        hover: hoverRef.current ?? -1,
        positions,
        parallax,
      });
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
      soundRef.current.pause();
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
      soundRef.current.resume();
      frameId = requestAnimationFrame(step);
    };

    /** Hareket azaltma: tek kare, gezegenler başlangıç konumlarında. */
    const renderStill = () => {
      if (disposed) return;
      const scene = ensureScene();
      if (!scene) return;
      scene.render({
        timeSeconds: 0,
        camera: cameraRef.current,
        focus: -1,
        focusBlur: 0,
        hover: -1,
        positions,
        parallax: 0,
      });
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
    resizeObserver.observe(stage);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      unsubscribe?.();
      stop();
      disposed = true;
      inView = false;
      live?.dispose();
      live = null;
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
    setActive((current) => {
      if (current !== null) soundRef.current.close();
      return null;
    });
  }, []);

  const dismiss = useCallback(
    (returnFocus: boolean) => {
      const index = active;
      if (index !== null) sound.close();
      setActive(null);
      if (returnFocus && index !== null) buttonRefs.current[index]?.focus();
    },
    [active, sound],
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
      {/* Çizim katmanı BÖLÜM seviyesinde ve sahne kutusundan büyük: yörüngeler ve
          yıldızlar başlığın arkasına ve alttaki bölümün içine taşıyor, kenarlar
          maskeyle siyaha sönüyor (düz kesik yok). Başlık ve alttaki bölümün
          yazıları bu katmanın ÖNÜNDE. Tıklamayı engellemez.
          `key`: reduced-motion ayarı mount SONRASI değişince (hook önce `false`
          döner) efekt yeniden kurulur; eski sahne `forceContextLoss()` ile
          bağlamı kaybettirdiği için AYNI canvas'ta yeni renderer kalıcı
          siyah kalıyordu. Her mod kendi taze canvas'ını alıyor. */}
      <div className={styles.field} aria-hidden="true">
        <canvas
          key={reducedMotion ? "still" : "motion"}
          ref={canvasRef}
          className={styles.canvas}
        />
      </div>

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
        {/* Odak bağlantı çizgisi: küreden karta. Konumu kare döngüsünden yazılıyor. */}
        <svg
          ref={connectorRef}
          className={styles.connector}
          style={
            {
              "--stone-color": selected ? `var(--color-brand-${selected.color})` : undefined,
            } as CSSProperties
          }
          aria-hidden="true"
        >
          <line x1="0" y1="0" x2="0" y2="0" />
          <circle cx="0" cy="0" r="3" />
        </svg>

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

        <button
          type="button"
          className={`${styles.control} ${styles.soundControl}`}
          onClick={sound.toggle}
          aria-label={sound.enabled ? video_t("soundOff") : video_t("soundOn")}
          aria-pressed={sound.enabled}
          title={sound.enabled ? video_t("soundOff") : video_t("soundOn")}
        >
          {sound.enabled ? <Volume2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
        </button>

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
          width={CRYSTAL_MEDIA.width}
          height={CRYSTAL_MEDIA.height}
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
                sound.hover();
              }}
              onPointerLeave={() => {
                if (hoverRef.current === index) hoverRef.current = null;
              }}
              onFocus={() => {
                hoverRef.current = index;
                sound.hover();
              }}
              onBlur={() => {
                if (hoverRef.current === index) hoverRef.current = null;
              }}
              onClick={() => {
                if (active === index) sound.close();
                else sound.fly();
                setActive((value) => (value === index ? null : index));
              }}
            >
              <span className={styles.dotCore} aria-hidden="true" />
              <span className={styles.dotLabel} aria-hidden="true">
                {stone.label}
              </span>
            </button>
            {active === index && (
              <div className={styles.hud} aria-hidden="true">
                <svg className={styles.hudRing} viewBox="0 0 100 100">
                  <circle className={styles.hudDots} cx="50" cy="50" r="48.5" />
                  <circle className={styles.hudArc} cx="50" cy="50" r="44" />
                  <circle className={styles.hudNodeWhite} cx="50" cy="1.5" r="1.4" />
                  <circle className={styles.hudNode} cx="93" cy="72" r="1.1" />
                  <circle className={styles.hudNode} cx="9" cy="70" r="1.1" />
                </svg>
                <div className={styles.hudTag}>
                  <span className={styles.hudReticle}>
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="5.2" />
                      <circle cx="12" cy="12" r="1.3" className={styles.hudReticleDot} />
                      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                    </svg>
                  </span>
                  <span className={styles.hudLeader} />
                  <span className={styles.hudCode}>N-{ECO_BODIES[index].hud}</span>
                  <span className={styles.hudBars}>
                    <i />
                    <i />
                    <b />
                  </span>
                </div>
              </div>
            )}
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
              <div className={styles.detailFooter}>
                <Link href={selected.href} className={styles.detailLink}>
                  {t("learnMore")} <span aria-hidden="true">→</span>
                </Link>
                <span className={styles.detailProgress} aria-hidden="true">
                  <i style={{ left: `${(active! / (orbitStones.length - 1)) * 88}%` }} />
                </span>
              </div>
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
