import { describe, expect, it } from "vitest";

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
  CRYSTAL_SPRITE,
  cardSide,
  CRYSTAL_HALF_WIDTH,
} from "./solar-system";

/**
 * Bu dosyanın asıl işi tek bir hata sınıfını yakalamak: noktaların ya da
 * kuyruk izinin yörünge halkasından KAYMASI. Halka SVG'si ve konum
 * matematiği aynı sabitlerden türemek zorunda; ayrı kaynak kullanılırsa
 * iz halkanın yanından geçer ve sahne anında sahte görünür.
 *
 * Elips denklemi: ((x-cx)/rx)² + ((y-cy)/(rx·tilt))² = 1
 */
function ellipseResidual(
  x: number,
  y: number,
  rx: number,
): number {
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

  it("halkalar dıştan içe hızlanır (fiziksel olarak doğru yön)", () => {
    for (let i = 1; i < RING_SPEED.length; i++) {
      expect(RING_SPEED[i]).toBeLessThan(RING_SPEED[i - 1]);
    }
  });
});

describe("stonePoint", () => {
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

describe("CRYSTAL_SPRITE", () => {
  it("kare sayısı en az 1", () => {
    expect(CRYSTAL_SPRITE.frames).toBeGreaterThanOrEqual(1);
  });

  it("tur süresi pozitif — sıfır olursa döngüde bölme hatası olur", () => {
    expect(CRYSTAL_SPRITE.turnSeconds).toBeGreaterThan(0);
  });

  it("kare boyutları tanımlı (CLS 0 için gerekli)", () => {
    expect(CRYSTAL_SPRITE.width).toBeGreaterThan(0);
    expect(CRYSTAL_SPRITE.height).toBeGreaterThan(0);
  });
});

describe("cardSide", () => {
  const CX = ORBIT_VIEW.cx;
  const REACH = 260;

  it("kristale binecekse dışarı açılır", () => {
    // Merkeze yakın bir nokta: içeri açılış (sağa) kristali kapatırdı.
    const nearLeft = CX - 176;
    expect(cardSide(nearLeft, REACH)).toBe("left");
    expect(cardSide(CX + 176, REACH)).toBe("right");
  });

  it("uzak noktalarda içeri açılış korunur (sahne dışına taşmasın)", () => {
    // Dış halka: içeri açılan kart kristale ulaşamıyor.
    const farLeft = CX - 424;
    expect(cardSide(farLeft, REACH)).toBe("right");
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
        expect(from < CX + CRYSTAL_HALF_WIDTH && to > CX - CRYSTAL_HALF_WIDTH).toBe(
          false,
        );
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
