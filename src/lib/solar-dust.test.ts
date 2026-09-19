import { describe, expect, it } from "vitest";
import {
  buildDust,
  buildNodeCluster,
  buildWeb,
  clusterState,
  makeRandom,
} from "./solar-dust";

describe("buildDust", () => {
  const dust = buildDust({ count: 800, innerRadius: 2, outerRadius: 8, seed: 5 });

  it("istenen sayıda parçacık üretir", () => {
    expect(dust).toHaveLength(800);
  });

  it("parçacıklar iç ve dış yarıçap arasında kalır", () => {
    for (const p of dust) {
      // Dikey eksen 0.42 ile basık; yarıçap kontrolü o ölçek geri
      // alınarak yapılıyor.
      const r = Math.hypot(p.position[0], p.position[1] / 0.42, p.position[2]);
      expect(r).toBeGreaterThanOrEqual(2 - 1e-6);
      expect(r).toBeLessThanOrEqual(8 + 1e-6);
    }
  });

  /*
   * Eş dağılımın asıl sınavı: kutuplarda yığılma olmamalı. Açıyı
   * doğrudan rastgele seçen (yanlış) yöntem parçacıkların ~%40'ını üst
   * ve alt dilime atıyor. Doğru yöntemde dikey bileşen düzgün dağılır,
   * yani |y| ortalaması yarıçapın yarısı civarındadır.
   */
  it("küre yüzeyinde eş dağılımlı — kutuplarda yığılmıyor", () => {
    let top = 0;
    for (const p of dust) {
      const r = Math.hypot(p.position[0], p.position[1] / 0.42, p.position[2]);
      if (Math.abs(p.position[1] / 0.42) > r * 0.8) top += 1;
    }
    // Eş dağılımda |z| > 0.8r olanların payı tam %20'dir.
    expect(top / dust.length).toBeGreaterThan(0.12);
    expect(top / dust.length).toBeLessThan(0.28);
  });

  it("dikeyde basık: yatay yayılım dikeyden belirgin geniş", () => {
    const horizontal = dust.reduce((s, p) => s + Math.hypot(p.position[0], p.position[2]), 0);
    const vertical = dust.reduce((s, p) => s + Math.abs(p.position[1]), 0);
    expect(horizontal / vertical).toBeGreaterThan(2);
  });

  it("aynı tohum aynı bulutu verir", () => {
    const a = buildDust({ count: 50, innerRadius: 1, outerRadius: 3, seed: 9 });
    const b = buildDust({ count: 50, innerRadius: 1, outerRadius: 3, seed: 9 });
    expect(a[7].position).toEqual(b[7].position);
  });

  it("hepsi serbest toz olarak işaretlenir", () => {
    expect(dust.every((p) => p.owner === -1)).toBe(true);
  });
});

describe("buildNodeCluster", () => {
  const cluster = buildNodeCluster({ count: 120, radius: 0.5, seed: 3 });

  it("yarıçapı aşmaz", () => {
    for (const p of cluster) {
      expect(Math.hypot(...p.position)).toBeLessThanOrEqual(0.5 + 1e-6);
    }
  });

  /* Küme içi boş bir top gibi değil, kabuğu belirgin olmalı. */
  it("parçacıklar yüzeye yakın toplanır", () => {
    const outer = cluster.filter((p) => Math.hypot(...p.position) > 0.5 * 0.6).length;
    expect(outer / cluster.length).toBeGreaterThan(0.55);
  });

  it("toz parçacıklarından belirgin biçimde iri", () => {
    const dust = buildDust({ count: 200, innerRadius: 2, outerRadius: 8, seed: 5 });
    const avg = (list: { size: number }[]) => list.reduce((s, p) => s + p.size, 0) / list.length;
    expect(avg(cluster)).toBeGreaterThan(avg(dust));
  });
});

describe("buildWeb", () => {
  const web = buildWeb(8);

  it("sekiz düğüm için on iki bağ kurar", () => {
    expect(web).toHaveLength(12);
  });

  it("her düğüm en az iki bağ taşır — kopuk düğüm yok", () => {
    const degree = new Map<number, number>();
    for (const [a, b] of web) {
      degree.set(a, (degree.get(a) ?? 0) + 1);
      degree.set(b, (degree.get(b) ?? 0) + 1);
    }
    for (let i = 0; i < 8; i += 1) {
      expect(degree.get(i) ?? 0).toBeGreaterThanOrEqual(2);
    }
  });

  it("aynı çifti iki kez bağlamaz ve kendine bağlamaz", () => {
    const keys = web.map(([a, b]) => (a < b ? `${a}-${b}` : `${b}-${a}`));
    expect(new Set(keys).size).toBe(keys.length);
    expect(web.every(([a, b]) => a !== b)).toBe(true);
  });

  it("çember tek parça: her düğüme yürünebiliyor", () => {
    const near = new Map<number, number[]>();
    for (const [a, b] of web) {
      near.set(a, [...(near.get(a) ?? []), b]);
      near.set(b, [...(near.get(b) ?? []), a]);
    }
    const seen = new Set([0]);
    const queue = [0];
    while (queue.length) {
      for (const n of near.get(queue.shift()!) ?? []) {
        if (!seen.has(n)) {
          seen.add(n);
          queue.push(n);
        }
      }
    }
    expect(seen.size).toBe(8);
  });
});

describe("clusterState", () => {
  it("odaklanan küme sıkışır ve tam parlar", () => {
    const state = clusterState(2, 2, 0);
    expect(state.tightness).toBeLessThan(1);
    expect(state.glow).toBe(1);
  });

  it("odak varken diğerleri geri çekilir", () => {
    expect(clusterState(2, 5, 0).glow).toBeLessThan(clusterState(-1, 5, 0).glow);
  });

  it("odak yokken hepsi aynı durumda nefes alır", () => {
    const a = clusterState(-1, 0, 1);
    const b = clusterState(-1, 7, 1);
    expect(a).toEqual(b);
    expect(a.tightness).toBeGreaterThan(1);
  });
});

describe("makeRandom", () => {
  it("0-1 aralığında kalır", () => {
    const random = makeRandom(12345);
    for (let i = 0; i < 5000; i += 1) {
      const v = random();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it("tohum 0 verilse de çalışır", () => {
    expect(() => makeRandom(0)()).not.toThrow();
  });
});
