import { describe, expect, it } from "vitest";
import {
  buildNetwork,
  choosePaths,
  makeRandom,
  pointAt,
  type Path,
} from "./teamwork-neurons";

const SIZE = { width: 1440, height: 740, somaCount: 8 } as const;

describe("buildNetwork", () => {
  it("istenen sayıda gövde kurar ve hepsi kadrajın içinde kalır", () => {
    const net = buildNetwork({ ...SIZE, seed: 7 });
    expect(net.somas).toHaveLength(8);
    for (const soma of net.somas) {
      expect(soma.x).toBeGreaterThan(0);
      expect(soma.x).toBeLessThan(SIZE.width);
      expect(soma.y).toBeGreaterThan(0);
      expect(soma.y).toBeLessThan(SIZE.height);
    }
  });

  it("aynı tohum aynı ağı verir", () => {
    const a = buildNetwork({ ...SIZE, seed: 42 });
    const b = buildNetwork({ ...SIZE, seed: 42 });
    expect(a.dots.length).toBe(b.dots.length);
    expect(a.somas[3].x).toBeCloseTo(b.somas[3].x, 10);
  });

  it("farklı tohum farklı ağ verir", () => {
    const a = buildNetwork({ ...SIZE, seed: 1 });
    const b = buildNetwork({ ...SIZE, seed: 2 });
    expect(a.somas[0].x).not.toBeCloseTo(b.somas[0].x, 3);
  });

  /*
   * Sahnenin tamamı noktadan çiziliyor; nokta sayısı hem görsel yoğunluğu
   * hem çizim maliyetini belirliyor. Alt sınır "ağ seyrek görünmesin",
   * üst sınır "her kare 60fps'te çizilebilsin" için.
   */
  it("nokta yoğunluğu çizilebilir bantta kalır", () => {
    const net = buildNetwork({ ...SIZE, seed: 3 });
    expect(net.dots.length).toBeGreaterThan(900);
    expect(net.dots.length).toBeLessThan(6000);
  });

  it("her gövde en az bir yol taşır ve yollar o gövdeden başlar", () => {
    const net = buildNetwork({ ...SIZE, seed: 5 });
    for (const [index, soma] of net.somas.entries()) {
      expect(soma.paths.length).toBeGreaterThan(0);
      for (const pathIndex of soma.paths) {
        expect(net.paths[pathIndex].fromSoma).toBe(index);
      }
    }
  });

  /*
   * Ağ TEK parça olmalı: iki gövde arasında akson yoksa sinyal bir yarıda
   * sıkışır ve kadrajın öbür yarısı hiç yanmaz.
   */
  it("gövdeler aksonlarla tek bir bileşende bağlanır", () => {
    const net = buildNetwork({ ...SIZE, seed: 11 });
    const neighbours = new Map<number, Set<number>>();
    for (const soma of net.somas.keys()) neighbours.set(soma, new Set());
    for (const path of net.paths) {
      if (path.toSoma === null) continue;
      neighbours.get(path.fromSoma)!.add(path.toSoma);
      neighbours.get(path.toSoma)!.add(path.fromSoma);
    }
    const seen = new Set([0]);
    const queue = [0];
    while (queue.length > 0) {
      for (const next of neighbours.get(queue.shift()!)!) {
        if (!seen.has(next)) {
          seen.add(next);
          queue.push(next);
        }
      }
    }
    expect(seen.size).toBe(net.somas.length);
  });

  it("aynı iki gövde arasında çift akson kurmaz", () => {
    const net = buildNetwork({ ...SIZE, seed: 13 });
    const keys = net.paths
      .filter((p) => p.toSoma !== null)
      .map((p) => (p.fromSoma < p.toSoma! ? `${p.fromSoma}-${p.toSoma}` : `${p.toSoma}-${p.fromSoma}`));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("dar kadrajda da çöküp boş ağ üretmez", () => {
    const net = buildNetwork({ width: 320, height: 420, somaCount: 4, seed: 9 });
    expect(net.somas).toHaveLength(4);
    expect(net.dots.length).toBeGreaterThan(200);
  });
});

describe("pointAt", () => {
  const straight: Path = (() => {
    const dots = [0, 10, 20, 30].map((x) => ({ x, y: 0, radius: 1, base: 1 }));
    const lengths = [0, 10, 20, 30];
    return { dots, lengths, total: 30, fromSoma: 0, toSoma: null };
  })();

  it("yol boyunca doğrusal ilerler", () => {
    expect(pointAt(straight, 0).x).toBeCloseTo(0);
    expect(pointAt(straight, 15).x).toBeCloseTo(15);
    expect(pointAt(straight, 30).x).toBeCloseTo(30);
  });

  it("sınırların dışını kırpar", () => {
    expect(pointAt(straight, -50).x).toBeCloseTo(0);
    expect(pointAt(straight, 999).x).toBeCloseTo(30);
  });
});

describe("choosePaths — imleçten kaçan ışık", () => {
  const net = buildNetwork({ ...SIZE, seed: 21 });
  const soma = net.somas[0];

  it("imleç yokken her yolu seçebilir", () => {
    const random = makeRandom(4);
    const picked = new Set<number>();
    for (let i = 0; i < 400; i += 1) {
      for (const p of choosePaths(soma, net.paths, 1, { x: 0, y: 0, active: false }, 190, random)) {
        picked.add(p);
      }
    }
    expect(picked.size).toBe(soma.paths.length);
  });

  it("aynı anda istenenden fazla yol döndürmez ve tekrar etmez", () => {
    const random = makeRandom(8);
    const picked = choosePaths(soma, net.paths, 2, { x: 0, y: 0, active: false }, 190, random);
    expect(picked.length).toBeLessThanOrEqual(2);
    expect(new Set(picked).size).toBe(picked.length);
  });

  /*
   * ASIL DAVRANIŞ: imleç bir yolun ucuna konduğunda o yol belirgin
   * biçimde daha az seçilmeli. Tek bir çekiliş rastlantısal olacağı için
   * çok sayıda çekilişin dağılımı ölçülüyor.
   */
  it("imlecin dibindeki yol belirgin biçimde daha az seçilir", () => {
    const random = makeRandom(99);
    const near = net.paths[soma.paths[0]];
    const tip = near.dots[near.dots.length - 1];
    const pointer = { x: tip.x, y: tip.y, active: true };

    let nearHits = 0;
    const runs = 3000;
    for (let i = 0; i < runs; i += 1) {
      const [choice] = choosePaths(soma, net.paths, 1, pointer, 190, random);
      if (choice === soma.paths[0]) nearHits += 1;
    }
    const fairShare = runs / soma.paths.length;
    expect(nearHits).toBeLessThan(fairShare * 0.5);
  });

  it("imleç uzaktayken dağılım yeniden dengelenir", () => {
    const random = makeRandom(99);
    const pointer = { x: -5000, y: -5000, active: true };
    let nearHits = 0;
    const runs = 3000;
    for (let i = 0; i < runs; i += 1) {
      const [choice] = choosePaths(soma, net.paths, 1, pointer, 190, random);
      if (choice === soma.paths[0]) nearHits += 1;
    }
    const fairShare = runs / soma.paths.length;
    expect(nearHits).toBeGreaterThan(fairShare * 0.7);
  });
});
