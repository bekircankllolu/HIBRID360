"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  buildNetwork,
  choosePaths,
  makeRandom,
  pointAt,
  type Network,
  type Signal,
} from "./teamwork-neurons";
import styles from "./TeamworkField.module.css";

/**
 * "THE ART OF TEAMWORK" — noktalardan kurulu nöron ağı.
 *
 * 19 Eylül 2026 kullanıcı isteği: *"Bu sayfa yine nokta nokta olacak
 * şekilde, Mona'nın noktaları gibi. Beyin nöronlarını, o beyin sinir
 * ağlarını gösterebiliriz ve ışıklar böyle geçişli elektrik akımları...
 * sanki bilgi transferi yapılıyormuş gibi bir yerden bir yere gitmesi
 * lazım sürekli. Bir nokta aydınlanacak sonra başka bir nokta
 * aydınlanacak. Ekip çalışmasındaki o bilgi aktarımını, düşüncelerin
 * aktarımını bu şekilde anlatabiliriz."*
 *
 * Sayfanın konusu ekip çalışması; sahne onu birebir anlatıyor: ayrı ayrı
 * duran gövdeler, aralarındaki yollar ve o yollardan sürekli geçen bilgi.
 *
 * ## Bir önceki sürümden farkı
 * Önceki hâl ÇİZGİLERLE kurulmuş bir kafes ağdı ve kullanıcı onu
 * "takımyıldız" gibi buldu. Burada çizgi YOK: dendritler ve aksonlar
 * nokta zincirleri (MONA'nın nokta dili). Geometri ve sinyal kararları
 * `teamwork-neurons.ts` içinde, testiyle birlikte.
 *
 * ## Etkileşim TERSİNE ÇEVRİLDİ
 * Kullanıcı: *"imleçten kaçan bir ışık sistemi olabilir. İmlecin olmadığı
 * yerler parlayacak, imlecin olduğu yerlerde biraz daha sönük bir renk
 * alacak."* İki katmanda uygulandı:
 *   1. ÇİZİM — imlece yakın noktalar sönüyor (`repel`).
 *   2. YÖNLENDİRME — yeni sinyaller imlece yakın yolları düşük ağırlıkla
 *      seçiyor (`choosePaths`), yani aktivite gözle görülür biçimde
 *      imlecin uzağına göç ediyor.
 *
 * ## Çizim tekniği
 * Her nokta `arc()` ile çizilseydi ~3500 nokta/kare pahalı olurdu. Bunun
 * yerine tek bir radyal-degrade "nokta" bir kez offscreen canvas'a
 * çiziliyor ve her nokta için `drawImage` ile ölçeklenerek basılıyor;
 * `globalCompositeOperation = "lighter"` üst üste binen noktalarda
 * gerçek bir bloom üretiyor — referans görseldeki parlama bu.
 *
 * ## Erişilebilirlik ve performans
 * - Dekoratif: `aria-hidden`, klavye hedefi değil.
 * - `prefers-reduced-motion`: tek statik kare, döngü hiç başlamaz.
 * - Görünür değilken rAF durur (IntersectionObserver).
 * - Durum DOM'da: `data-motion`, `data-running` (e2e bunları ölçüyor).
 */

/** İmleç etki yarıçapı (CSS pikseli). */
const POINTER_RADIUS = 190;

/** Aynı anda havada olabilecek en fazla sinyal. */
const MAX_SIGNALS = 26;

/** Sinyal başının etrafında parlayan bölgenin yarıçapı (piksel). */
const PULSE_REACH = 34;

/** Nokta damgasının çözünürlüğü; yarıçap 1'in kaç katına kadar büyütülüyor. */
const SPRITE_RADIUS = 16;

function createSprite(): HTMLCanvasElement {
  const sprite = document.createElement("canvas");
  sprite.width = SPRITE_RADIUS * 2;
  sprite.height = SPRITE_RADIUS * 2;
  const ctx = sprite.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(
      SPRITE_RADIUS,
      SPRITE_RADIUS,
      0,
      SPRITE_RADIUS,
      SPRITE_RADIUS,
      SPRITE_RADIUS,
    );
    // Sıcak çekirdek → marka sarısı → sönüm. Damga BEYAZ çizilmiyor:
    // sarıyı burada pişirmek her kareyi tek bir drawImage'a indiriyor.
    gradient.addColorStop(0, "rgba(255, 255, 220, 1)");
    gradient.addColorStop(0.28, "rgba(255, 252, 0, 0.92)");
    gradient.addColorStop(0.6, "rgba(255, 210, 0, 0.26)");
    gradient.addColorStop(1, "rgba(255, 190, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, sprite.width, sprite.height);
  }
  return sprite;
}

export function TeamworkField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx = context;

    const sprite = createSprite();
    const random = makeRandom(20260919);

    let width = 0;
    let height = 0;
    let dpr = 1;
    let network: Network | null = null;
    let signals: Signal[] = [];
    let frame = 0;
    let running = false;
    let last = 0;
    let sinceFire = 0;
    const pointer = { x: 0, y: 0, active: false, strength: 0 };

    const setRunning = (value: boolean) => {
      running = value;
      canvas.dataset.running = String(value);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      /*
       * Ağ her yeniden boyutlandırmada YENİDEN kuruluyor ama TOHUM sabit:
       * aynı ölçüde hep aynı ağ çıkıyor. Oranlamak (eski çözüm) burada
       * işe yaramaz — dendrit uzunlukları ve dal açıları ölçüye bağlı,
       * gerilmiş bir dendrit ağacı yamuk duruyor.
       */
      const somaCount = Math.round(Math.min(11, Math.max(4, (width * height) / 150000)));
      network = buildNetwork({ width, height, somaCount, seed: 20260919 });
      signals = [];
      return network;
    };

    /** İmlecin bir noktayı ne kadar söndürdüğü: 0 (uzak) → 1 (tam üstünde). */
    const repelAt = (x: number, y: number) => {
      if (pointer.strength < 0.01) return 0;
      const d = Math.hypot(pointer.x - x, pointer.y - y);
      if (d > POINTER_RADIUS) return 0;
      const t = 1 - d / POINTER_RADIUS;
      // Kare alma kenarı yumuşatıyor: sönüm dairesel bir maske gibi
      // görünmüyor, ışık gerçekten çekiliyormuş gibi duruyor.
      return t * t * pointer.strength;
    };

    const draw = () => {
      if (!network) return;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      // 1. Durağan ağ.
      for (const dot of network.dots) {
        const glow = dot.base * (1 - repelAt(dot.x, dot.y) * 0.88);
        if (glow < 0.02) continue;
        const size = dot.radius * 3.8;
        ctx.globalAlpha = Math.min(1, glow * 0.72);
        ctx.drawImage(sprite, dot.x - size, dot.y - size, size * 2, size * 2);
      }

      // 2. Ateşlenmiş gövdeler — sinyal geldiğinde parlayan düğüm.
      for (const soma of network.somas) {
        if (soma.charge < 0.02) continue;
        const glow = soma.charge * (1 - repelAt(soma.x, soma.y) * 0.85);
        const size = 10 + soma.charge * 26;
        ctx.globalAlpha = Math.min(1, glow * 0.85);
        ctx.drawImage(sprite, soma.x - size, soma.y - size, size * 2, size * 2);
      }

      // 3. Sinyal başları — yol üzerinde ilerleyen akım. Baştan geriye
      //    doğru sönen bir kuyruk bırakıyor: hareket yönü okunuyor.
      for (const signal of signals) {
        const path = network.paths[signal.path];
        for (let tail = 0; tail < 5; tail += 1) {
          const at = signal.at - tail * (PULSE_REACH / 5);
          if (at < 0) break;
          const { x, y } = pointAt(path, at);
          const fade = (1 - tail / 5) ** 1.6;
          const glow = signal.power * fade * (1 - repelAt(x, y) * 0.7);
          if (glow < 0.02) continue;
          const size = (7 - tail) * 1.5;
          ctx.globalAlpha = Math.min(1, glow);
          ctx.drawImage(sprite, x - size, y - size, size * 2, size * 2);
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    /** Bir gövdeyi ateşler ve yollarına sinyal salar. */
    const fire = (index: number, power: number) => {
      if (!network) return;
      const soma = network.somas[index];
      soma.charge = Math.max(soma.charge, power);
      if (signals.length >= MAX_SIGNALS) return;
      const count = 1 + (random() < 0.45 ? 1 : 0);
      for (const pathIndex of choosePaths(
        soma,
        network.paths,
        count,
        pointer,
        POINTER_RADIUS,
        random,
      )) {
        const path = network.paths[pathIndex];
        // Yolun hangi ucundan girildiği önemli: akson iki gövdeyi
        // bağlıyor ve sinyal doğru yönde akmalı. Yollar gövdeden
        // başlayacak biçimde kuruldu, bu yüzden hep baştan giriliyor.
        if (path.fromSoma !== index) continue;
        signals.push({ path: pathIndex, at: 0, speed: 130 + random() * 110, power });
      }
    };

    const step = (now: number) => {
      frame = 0;
      if (!network) return;
      const delta = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;

      pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * 0.12;

      // Sinyalleri ilerlet.
      const alive: Signal[] = [];
      for (const signal of signals) {
        const path = network.paths[signal.path];
        const { x, y } = pointAt(path, signal.at);
        // KAÇIŞ: imlecin alanına giren sinyal hızlanıyor — ışık oradan
        // çekiliyormuş gibi. Kullanıcının "ışık bir anda diğer bir tarafa
        // gelecek" dediği his bu.
        const flee = 1 + repelAt(x, y) * 2.4;
        signal.at += signal.speed * flee * delta;
        signal.power *= Math.exp(-0.55 * delta);

        if (signal.at >= path.total) {
          // Akson bir gövdeye varıyorsa ORASI ateşleniyor: bilgi
          // aktarıldı. Dendrit ucunda sinyal sönüyor.
          if (path.toSoma !== null && signal.power > 0.25) {
            fire(path.toSoma, signal.power * 0.92);
          }
          continue;
        }
        if (signal.power > 0.06) alive.push(signal);
      }
      signals = alive;

      for (const soma of network.somas) soma.charge *= Math.exp(-2.4 * delta);

      // Kendiliğinden ateşleme: imleç olmasa da ağ çalışıyor. Havada
      // sinyal azaldıkça sıklaşıyor, yani sahne hiç ölmüyor.
      sinceFire += delta;
      const idle = signals.length / MAX_SIGNALS;
      if (sinceFire > 0.35 + idle * 1.6) {
        sinceFire = 0;
        // Başlangıç gövdesi de imleçten kaçıyor: en uzaktakiler daha
        // olasılıklı.
        const somas = network.somas;
        let pick = Math.floor(random() * somas.length);
        if (pointer.strength > 0.15) {
          let best = -1;
          for (let i = 0; i < 3; i += 1) {
            const candidate = Math.floor(random() * somas.length);
            const d = Math.hypot(
              somas[candidate].x - pointer.x,
              somas[candidate].y - pointer.y,
            );
            if (d > best) {
              best = d;
              pick = candidate;
            }
          }
        }
        fire(pick, 0.85 + random() * 0.15);
      }

      draw();
      if (running) frame = requestAnimationFrame(step);
    };

    const start = () => {
      if (running || reducedMotion) return;
      setRunning(true);
      last = 0;
      frame = requestAnimationFrame(step);
    };
    const stop = () => {
      setRunning(false);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    canvas.dataset.motion = reducedMotion ? "reduced" : "full";
    const initial = resize();
    if (reducedMotion) {
      // Durağan kare de ölü olmasın: birkaç gövde açık bırakılıyor.
      for (let i = 0; i < initial.somas.length; i += 2) initial.somas[i].charge = 0.55;
    }
    draw();

    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: "10% 0px" },
    );
    observer.observe(canvas);

    const onResize = () => {
      resize();
      draw();
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active =
        pointer.x >= 0 && pointer.x <= rect.width && pointer.y >= 0 && pointer.y <= rect.height;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      stop();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className={styles.field} aria-hidden="true" />;
}
