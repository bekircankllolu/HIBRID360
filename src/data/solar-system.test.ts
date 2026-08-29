import { describe, expect, it } from "vitest";
import {
  createCrystalPlayback,
  createParticleTrail,
  returnWeight,
  RETURN_SECONDS,
  TRAIL_CAPACITY,
  PARTICLE_LIFETIME,
  wrapTime,
} from "../lib/solar-motion";

import {
  orbitStones,
  stonePoint,
  stoneTrail,
  ORBIT_RINGS,
  ORBIT_TILT,
  ORBIT_VIEW,
  RING_SPEED,
  TRAIL_SAMPLES,
  TRAIL_SECONDS,
  CRYSTAL_MEDIA,
  cardSide,
  CRYSTAL_HALF_WIDTH,
  COMPACT_RINGS,
  COMPACT_TILT,
} from "./solar-system";

/**
 * Bu dosyanın asıl işi tek bir hata sınıfını yakalamak: noktaların ya da
 * kuyruk izinin yörünge halkasından KAYMASI. Halka SVG'si ve konum
 * matematiği aynı sabitlerden türemek zorunda; ayrı kaynak kullanılırsa
 * iz halkanın yanından geçer ve sahne anında sahte görünür.
 *
 * Elips denklemi: ((x-cx)/rx)² + ((y-cy)/(rx·tilt))² = 1
 */
function ellipseResidual(x: number, y: number, rx: number): number {
  const dx = (x - ORBIT_VIEW.cx) / rx;
  const dy = (y - ORBIT_VIEW.cy) / (rx * ORBIT_TILT);
  return Math.abs(dx * dx + dy * dy - 1);
}

describe("yörünge verisi", () => {
  it("sekiz servis noktası tanımlı", () => {
    expect(orbitStones).toHaveLength(8);
  });

  it("her noktanın halkası ve hızı tanımlı", () => {
    for (const stone of orbitStones) {
      expect(ORBIT_RINGS[stone.ring]).toBeTypeOf("number");
      expect(RING_SPEED[stone.ring]).toBeTypeOf("number");
    }
  });

  it("her halkada tam iki nokta var", () => {
    const perRing = [0, 0, 0, 0];
    for (const stone of orbitStones) perRing[stone.ring]++;
    expect(perRing).toEqual([2, 2, 2, 2]);
  });

  it("aynı halkadaki iki nokta karşılıklı dizilir", () => {
    for (let ring = 0; ring < 4; ring++) {
      const pair = orbitStones.filter((s) => s.ring === ring);
      const delta = Math.abs(pair[0].phase - pair[1].phase);
      expect(delta).toBeCloseTo(Math.PI, 6);
    }
  });

  it("her nokta gerçek bir What We Do rotasına bağlanır", () => {
    for (const stone of orbitStones) {
      expect(stone.href.startsWith("/what-we-do/")).toBe(true);
    }
  });

  it("Photography kaldırılır ve Cloud TV ekosistemde yer alır", () => {
    expect(orbitStones.some((stone) => stone.label === "CLOUD TV")).toBe(true);
    expect(
      orbitStones.some((stone) => stone.href.includes("photography")),
    ).toBe(false);
  });

  it("halkalar dıştan içe hızlanır (fiziksel olarak doğru yön)", () => {
    for (let i = 1; i < RING_SPEED.length; i++) {
      expect(RING_SPEED[i]).toBeLessThan(RING_SPEED[i - 1]);
    }
  });
});

describe("stonePoint", () => {
  it("compact positions and rings use the same projection", () => {
    for (const stone of orbitStones) {
      for (let time = 0; time < 90; time += 0.71) {
        const p = stonePoint(stone, time, true);
        const radius = COMPACT_RINGS[stone.ring];
        const residual =
          ((p.x - ORBIT_VIEW.cx) / radius) ** 2 +
          ((p.y - ORBIT_VIEW.cy) / (radius * COMPACT_TILT)) ** 2;
        expect(residual).toBeCloseTo(1, 9);
      }
    }
  });
  it("her nokta her zaman kendi halkasının TAM üzerindedir", () => {
    for (const stone of orbitStones) {
      for (let t = 0; t < 60; t += 0.37) {
        const p = stonePoint(stone, t);
        expect(ellipseResidual(p.x, p.y, ORBIT_RINGS[stone.ring])).toBeLessThan(
          1e-9,
        );
      }
    }
  });

  it("depth 0..1 aralığında kalır", () => {
    for (const stone of orbitStones) {
      for (let t = 0; t < 40; t += 0.23) {
        const { depth } = stonePoint(stone, t);
        expect(depth).toBeGreaterThanOrEqual(0);
        expect(depth).toBeLessThanOrEqual(1);
      }
    }
  });

  it("depth, sahnenin alt yarısında (öne yakın) yüksektir", () => {
    // sin > 0 → y merkezin altında → izleyiciye yakın taraf.
    for (const stone of orbitStones) {
      for (let t = 0; t < 30; t += 0.19) {
        const p = stonePoint(stone, t);
        if (p.y > ORBIT_VIEW.cy) expect(p.depth).toBeGreaterThan(0.5);
        if (p.y < ORBIT_VIEW.cy) expect(p.depth).toBeLessThan(0.5);
      }
    }
  });

  it("bir tur sonra başlangıç konumuna döner", () => {
    for (const stone of orbitStones) {
      const period = (2 * Math.PI) / RING_SPEED[stone.ring];
      const start = stonePoint(stone, 0);
      const after = stonePoint(stone, period);
      expect(after.x).toBeCloseTo(start.x, 6);
      expect(after.y).toBeCloseTo(start.y, 6);
    }
  });
});

describe("interactive motion", () => {
  it("returns continuously, with a small overshoot and an exact finish", () => {
    expect(returnWeight(0)).toBe(1);
    expect(returnWeight(0.0001)).toBeCloseTo(1, 5);
    expect(returnWeight(0.5)).toBeLessThan(0);
    expect(Math.abs(returnWeight(0.5))).toBeLessThan(0.03);
    expect(returnWeight(RETURN_SECONDS)).toBe(0);
    expect(returnWeight(50)).toBe(0);
  });

  it("wraps forward and backward without producing invalid media times", () => {
    expect(wrapTime(-0.25, 7)).toBe(6.75);
    expect(wrapTime(7.25, 7)).toBe(0.25);
    expect(wrapTime(1, Number.NaN)).toBe(0);
    expect(wrapTime(1, 0)).toBe(0);
  });

  it("emits a bounded trail along a dragged path, then lets it expire at rest", () => {
    const trail = createParticleTrail(360, 24);
    const from = { x: 100, y: 80, depth: 0.6 };
    const to = { x: 500, y: 400, depth: 1 };
    for (let i = 0; i < 200; i++) trail.step(0.04, from, to, null);
    expect(trail.particles).toHaveLength(24);
    expect(
      trail.particles.some((p) => p.x > 200 && p.x < 450 && p.y > 150),
    ).toBe(true);
    for (let i = 0; i < 160; i++) trail.step(0.04, to, to, null);
    expect(trail.particles.every((p) => p.age >= p.life)).toBe(true);
  });

  it("nearby particles move away from the pointer", () => {
    const a = createParticleTrail(360, TRAIL_CAPACITY.desktop);
    const b = createParticleTrail(360, TRAIL_CAPACITY.desktop);
    const from = { x: 100, y: 100, depth: 1 };
    const to = { x: 110, y: 100, depth: 1 };
    for (let i = 0; i < 3; i++) {
      a.step(0.04, from, to, null);
      b.step(0.04, from, to, null);
    }
    const p = a.particles[0];
    a.step(0.04, to, to, { x: p.x - 10, y: p.y, depth: 1 }, false);
    b.step(0.04, to, to, null, false);
    expect(a.particles[0].x).toBeGreaterThan(b.particles[0].x);
  });

  it("keeps a dense, multi-second trail within the desktop and mobile budgets", () => {
    for (const capacity of Object.values(TRAIL_CAPACITY)) {
      const trail = createParticleTrail(360, capacity);
      for (let i = 0; i < 300; i++) {
        trail.step(
          0.02,
          { x: i, y: 100, depth: 1 },
          { x: i + 1, y: 100, depth: 1 },
          null,
        );
      }
      const alive = trail.particles.filter((p) => p.age < p.life);
      expect(trail.particles).toHaveLength(capacity);
      expect(alive.length).toBeGreaterThan(capacity * 0.65);
      expect(alive.some((p) => p.age > 3)).toBe(true);
      for (const p of alive) {
        expect(p.life).toBeGreaterThanOrEqual(PARTICLE_LIFETIME.min);
        expect(p.life).toBeLessThanOrEqual(PARTICLE_LIFETIME.max);
      }
    }
  });
});

describe("crystal playback", () => {
  function fixture() {
    const video = {
      currentTime: 3,
      duration: 7,
      paused: true,
      seeking: false,
      readyState: 4,
      playCount: 0,
      play() {
        this.playCount++;
        this.paused = false;
        return Promise.resolve();
      },
      pause() {
        this.paused = true;
      },
    };
    return { video, controller: createCrystalPlayback(video) };
  }

  it("hover overrides scroll and resumes from the held frame", async () => {
    const { video, controller } = fixture();
    controller.step(0, false);
    await Promise.resolve();
    controller.step(10, true);
    controller.scroll(200, 800, 20, true);
    controller.step(30, true);
    expect(video.paused).toBe(true);
    expect(video.currentTime).toBe(3);
    await Promise.resolve();
    controller.step(100, false);
    expect(video.currentTime).toBe(3);
    expect(video.paused).toBe(false);
  });

  it("uses the latest scroll target and waits for decoding before seeking again", () => {
    const { video, controller } = fixture();
    controller.scroll(100, 1000, 0, false);
    controller.step(10, false);
    expect(video.currentTime).toBeCloseTo(Math.round(3.35 * 24) / 24);
    video.seeking = true;
    controller.scroll(-200, 1000, 20, false);
    controller.step(30, false);
    expect(video.currentTime).toBeCloseTo(Math.round(3.35 * 24) / 24);
    video.seeking = false;
    controller.step(40, false);
    expect(video.currentTime).toBeCloseTo(Math.round(2.65 * 24) / 24);
    controller.step(250, false);
    expect(controller.mode).toBe("idle");
    expect(video.paused).toBe(false);
  });

  it("resumes when a completed seek still needs playback to decode data", () => {
    const { video, controller } = fixture();
    controller.scroll(100, 1000, 0, false);
    controller.step(10, false);
    video.readyState = 1;
    controller.step(250, false);
    expect(controller.mode).toBe("idle");
    expect(video.playCount).toBe(1);
  });

  it("does not repeat a completed seek when a decoder rounds its clock", () => {
    const { video, controller } = fixture();
    controller.scroll(100, 1000, 0, false);
    controller.step(10, false);
    video.currentTime -= 0.04;
    const decodedTime = video.currentTime;
    controller.step(250, false);
    expect(controller.mode).toBe("idle");
    expect(video.currentTime).toBe(decodedTime);
  });

  it("retries a transient aborted play with a bounded backoff", async () => {
    const { video } = fixture();
    video.play = function () {
      this.playCount++;
      return Promise.reject(
        new DOMException("Seek interrupted play", "AbortError"),
      );
    };
    const controller = createCrystalPlayback(video);
    controller.step(0, false);
    await Promise.resolve();
    controller.step(100, false);
    expect(video.playCount).toBe(1);
    controller.step(150, false);
    await Promise.resolve();
    controller.step(449, false);
    expect(video.playCount).toBe(2);
    controller.step(450, false);
    await Promise.resolve();
    controller.step(1000, false);
    expect(video.playCount).toBe(3);
  });

  it("does not repeatedly retry a browser autoplay denial", async () => {
    const { video } = fixture();
    video.play = function () {
      this.playCount++;
      return Promise.reject(new DOMException("Not allowed", "NotAllowedError"));
    };
    const controller = createCrystalPlayback(video);
    controller.step(0, false);
    await Promise.resolve();
    for (let time = 100; time < 2000; time += 100) controller.step(time, false);
    expect(video.playCount).toBe(1);
  });

  it("late play resolution cannot restart an offscreen scene", async () => {
    const { video } = fixture();
    let resolve!: () => void;
    video.play = () =>
      new Promise<void>((done) => {
        resolve = () => {
          video.paused = false;
          done();
        };
      });
    const controller = createCrystalPlayback(video);
    controller.step(0, false);
    controller.stop();
    resolve();
    await Promise.resolve();
    expect(video.paused).toBe(true);
    expect(controller.mode).toBe("paused");
  });
});

describe("stoneTrail", () => {
  it("istenen sayıda örnek üretir", () => {
    expect(stoneTrail(orbitStones[0], 3)).toHaveLength(TRAIL_SAMPLES);
    expect(stoneTrail(orbitStones[0], 3, 12)).toHaveLength(12);
  });

  it("izin BAŞI noktanın kendisidir", () => {
    for (const stone of orbitStones) {
      const head = stoneTrail(stone, 4.2)[0];
      const now = stonePoint(stone, 4.2);
      expect(head.x).toBeCloseTo(now.x, 10);
      expect(head.y).toBeCloseTo(now.y, 10);
      expect(head.t).toBe(0);
    }
  });

  it("izin HER örneği halkanın üzerindedir — kaymaz", () => {
    for (const stone of orbitStones) {
      for (let t = 0; t < 25; t += 0.61) {
        for (const p of stoneTrail(stone, t)) {
          expect(
            ellipseResidual(p.x, p.y, ORBIT_RINGS[stone.ring]),
          ).toBeLessThan(1e-9);
        }
      }
    }
  });

  it("t değeri baştan kuyruğa 0'dan 1'e artar", () => {
    const points = stoneTrail(orbitStones[2], 7);
    expect(points[0].t).toBe(0);
    expect(points[points.length - 1].t).toBeCloseTo(1, 10);
    for (let i = 1; i < points.length; i++) {
      expect(points[i].t).toBeGreaterThan(points[i - 1].t);
    }
  });

  it("kuyruğun ucu tam TRAIL_SECONDS kadar geçmiştedir", () => {
    const stone = orbitStones[5];
    const tail = stoneTrail(stone, 9).at(-1)!;
    const past = stonePoint(stone, 9 - TRAIL_SECONDS);
    expect(tail.x).toBeCloseTo(past.x, 10);
    expect(tail.y).toBeCloseTo(past.y, 10);
  });

  it("izlerin TUR ORTALAMASI sekiz nokta için yaklaşık aynıdır", () => {
    // Uzunluk açı değil ZAMAN cinsinden tanımlı; halkaların çizgisel hızı
    // birbirine yakın olduğu için (176×0.15 ≈ 424×0.058) sabit süre
    // halkadan halkaya benzer uzunluk verir. Sabit AÇI kullanılsaydı dış
    // halkanın izi çok daha uzun olurdu.
    //
    // Ölçüm bir TUR boyunca ortalanıyor: anlık uzunluk faza göre 3 kata
    // kadar değişir, çünkü eğik yörüngede x uçlarındaki nokta (hareketi
    // tilt ile sıkışan y ekseninde) yavaş, y uçlarındaki hızlıdır. Bu
    // istenen davranış — iz gerçek bir yörünge gibi gerilip toparlanır —
    // ama halkalar arası tutarlılığın ölçüsü değil.
    const meanLengths = orbitStones.map((stone) => {
      const period = (2 * Math.PI) / RING_SPEED[stone.ring];
      const samples = 120;
      let sum = 0;

      for (let s = 0; s < samples; s++) {
        const points = stoneTrail(stone, (s * period) / samples);
        for (let i = 1; i < points.length; i++) {
          sum += Math.hypot(
            points[i].x - points[i - 1].x,
            points[i].y - points[i - 1].y,
          );
        }
      }

      return sum / samples;
    });

    expect(Math.max(...meanLengths) / Math.min(...meanLengths)).toBeLessThan(
      1.2,
    );
  });

  it("anlık iz uzunluğu faza göre değişir (yörünge gerilip toparlanır)", () => {
    // Yukarıdaki testin tersi: bu değişimin VAR olduğunu doğruluyoruz.
    // Kaybolursa iz ölü bir çubuk gibi okunur.
    const stone = orbitStones[0];
    const lengthAt = (t: number) => {
      const points = stoneTrail(stone, t);
      let total = 0;
      for (let i = 1; i < points.length; i++) {
        total += Math.hypot(
          points[i].x - points[i - 1].x,
          points[i].y - points[i - 1].y,
        );
      }
      return total;
    };

    const period = (2 * Math.PI) / RING_SPEED[stone.ring];
    const samples = Array.from({ length: 40 }, (_, i) =>
      lengthAt((i * period) / 40),
    );
    expect(Math.max(...samples) / Math.min(...samples)).toBeGreaterThan(1.5);
  });

  it("negatif zamanda da (sahne başlarken) halkada kalır", () => {
    for (const p of stoneTrail(orbitStones[0], 0)) {
      expect(ellipseResidual(p.x, p.y, ORBIT_RINGS[0])).toBeLessThan(1e-9);
    }
  });
});

describe("CRYSTAL_MEDIA", () => {
  it("keeps the smaller crystal at the newly requested normal playback rate", () => {
    expect(CRYSTAL_MEDIA.scale).toBe(0.85);
    expect(CRYSTAL_MEDIA.playbackRate).toBe(1);
  });

  it("uses the new client loop and its matching first-frame poster", () => {
    expect(CRYSTAL_MEDIA.interactive).toBe(
      "/videos/hibrid-stone-loop-20260827.mp4",
    );
    expect(CRYSTAL_MEDIA.poster).toBe(
      "/videos/hibrid-stone-loop-20260827.webp",
    );
    expect(CRYSTAL_MEDIA.fps).toBe(24);
  });

  it("retains the earlier source formats for reference", () => {
    expect(CRYSTAL_MEDIA.webm.endsWith(".webm")).toBe(true);
    expect(CRYSTAL_MEDIA.mp4.endsWith(".mp4")).toBe(true);
  });

  it("poster tanımlı — preload=none olduğu için ilk kare oradan gelir", () => {
    expect(CRYSTAL_MEDIA.poster.length).toBeGreaterThan(0);
  });

  it("kare boyutları pozitif (CLS 0 için gerekli)", () => {
    expect(CRYSTAL_MEDIA.width).toBeGreaterThan(0);
    expect(CRYSTAL_MEDIA.height).toBeGreaterThan(0);
  });

  it("taşın belgelenen kadraj oranı 0..1 arasında", () => {
    expect(CRYSTAL_MEDIA.stoneRatio).toBeGreaterThan(0);
    expect(CRYSTAL_MEDIA.stoneRatio).toBeLessThanOrEqual(1);
  });

  it("merkez kaydırması küçük kalır — büyük kayma taşı yörüngeden çıkarır", () => {
    expect(Math.abs(CRYSTAL_MEDIA.offsetX)).toBeLessThan(0.1);
    expect(Math.abs(CRYSTAL_MEDIA.offsetY)).toBeLessThan(0.1);
  });
});

describe("cardSide", () => {
  const CX = ORBIT_VIEW.cx;
  const REACH = 260;

  it("kristale binecekse dışarı açılır", () => {
    // Merkeze yakın bir nokta: içeri açılış (sağa) kristali kapatırdı.
    expect(cardSide(CX - 176, REACH)).toBe("left");
    expect(cardSide(CX + 176, REACH)).toBe("right");
  });

  it("uzak noktalarda içeri açılış korunur (sahne dışına taşmasın)", () => {
    // Dış halka: içeri açılan kart kristale ulaşamıyor.
    expect(cardSide(CX - 424, REACH)).toBe("right");
    expect(cardSide(CX + 424, REACH)).toBe("left");
  });

  it("kart hiçbir konumda kristalin ORTA EKSENİNİ geçmez", () => {
    // Garanti edilebilen şey bu. "Karta hiç değmesin" geometrik olarak
    // imkânsız: iç halka merkeze 176 birim, kristalin yarı genişliği 115,
    // kartın erişimi 260 — nokta kristalin x bandındayken (elipsin üst/alt
    // uçları) kart iki yöne de açılsa taşa değer. Değerli olan, taşın
    // YÜZÜNÜN kapanmaması; kart merkez ekseni geçmediği sürece kristal
    // okunur kalır.
    for (const stone of orbitStones) {
      for (let t = 0; t < 45; t += 0.29) {
        const p = stonePoint(stone, t);
        const side = cardSide(p.x, REACH);
        const [from, to] =
          side === "right" ? [p.x, p.x + REACH] : [p.x - REACH, p.x];
        expect(from < CX && to > CX).toBe(false);
      }
    }
  });

  it("içeri açıldığında kristale hiç değmez", () => {
    // İçeri açılışa yalnızca kartın kristale ulaşamadığı uzaklıkta izin
    // veriliyor; oradaki garanti tam.
    for (const stone of orbitStones) {
      for (let t = 0; t < 45; t += 0.29) {
        const p = stonePoint(stone, t);
        const side = cardSide(p.x, REACH);
        const inward = p.x < CX ? "right" : "left";
        if (side !== inward) continue;
        const [from, to] =
          side === "right" ? [p.x, p.x + REACH] : [p.x - REACH, p.x];
        expect(
          from < CX + CRYSTAL_HALF_WIDTH && to > CX - CRYSTAL_HALF_WIDTH,
        ).toBe(false);
      }
    }
  });

  it("simetriktir: ayna konumlar ayna yön verir", () => {
    // d = 0 (nokta tam merkez ekseninde) dejenere: iki yön de eşdeğer.
    for (let d = 17; d <= 430; d += 17) {
      const left = cardSide(CX - d, REACH);
      const right = cardSide(CX + d, REACH);
      expect(left).toBe(right === "left" ? "right" : "left");
    }
  });
});
