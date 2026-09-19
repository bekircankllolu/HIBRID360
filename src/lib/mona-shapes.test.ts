import { describe, expect, it } from "vitest";
import { GALLERY } from "./mona-creature";
import { createParticleCloud, LAYER } from "./mona-dots-geometry";
import { buildGallery, GALLERY_SHAPES } from "./mona-shapes";

/** Testler hızlı kalsın diye küçük bir bulut — oranlar gerçeğiyle aynı. */
const cloud = createParticleCloud({ shell: 400, core: 150, halo: 60, dust: 30, haze: 20 });

describe("MONA şekil galerisi", () => {
  it("davranış modülündeki sıra hedef üreticisiyle aynı", () => {
    // Bu eşleşme SÖZLEŞME: `creatureFrame` bir indeks döndürüyor ve sahne
    // o indeksle GPU tamponu seçiyor. Sıralar ayrışırsa MONA yanlış şekli
    // alır ve hiçbir tip hatası bunu yakalamaz.
    expect([...GALLERY]).toEqual([...GALLERY_SHAPES]);
  });

  it("her şekil için bulutun tamamı kadar hedef üretir", () => {
    const gallery = buildGallery(cloud);
    expect(gallery).toHaveLength(GALLERY_SHAPES.length);
    for (const targets of gallery) {
      expect(targets).toHaveLength(cloud.count * 3);
      expect(targets.every(Number.isFinite)).toBe(true);
    }
  });

  it("kabuk ve çekirdek şekle gider, dış katmanlar yerinde kalır", () => {
    // Hale/toz/aura kütlenin atmosferi: şekil anında da yerinde durmalı,
    // yoksa geçiş "her şey birden zıpladı" gibi görünür.
    for (const targets of buildGallery(cloud)) {
      let moved = 0;
      for (let index = 0; index < cloud.count; index++) {
        const layer = cloud.meta[index * 4 + 2];
        const same =
          targets[index * 3] === cloud.positions[index * 3] &&
          targets[index * 3 + 1] === cloud.positions[index * 3 + 1] &&
          targets[index * 3 + 2] === cloud.positions[index * 3 + 2];
        if (layer === LAYER.shell || layer === LAYER.core) {
          if (!same) moved++;
        } else {
          expect(same).toBe(true);
        }
      }
      // Gövde noktalarının hemen hepsi yer değiştirmeli (birebir aynı
      // yere denk gelen birkaç nokta istatistiksel olarak olabilir).
      expect(moved).toBeGreaterThan(cloud.count * 0.9 * 0.5);
    }
  });

  it("hedefler kütlenin ölçeğinde kalır — kadraj dışına taşmaz", () => {
    for (const targets of buildGallery(cloud)) {
      for (let index = 0; index < cloud.count; index++) {
        const layer = cloud.meta[index * 4 + 2];
        if (layer !== LAYER.shell && layer !== LAYER.core) continue;
        expect(Math.abs(targets[index * 3])).toBeLessThanOrEqual(1);
        expect(Math.abs(targets[index * 3 + 1])).toBeLessThanOrEqual(1);
        expect(Math.abs(targets[index * 3 + 2])).toBeLessThanOrEqual(0.2);
      }
    }
  });

  it("aynı tohum aynı galeriyi verir", () => {
    const first = buildGallery(cloud, 4242);
    const second = buildGallery(cloud, 4242);
    for (let i = 0; i < first.length; i++) expect(Array.from(first[i])).toEqual(Array.from(second[i]));
  });

  it("farklı şekiller farklı hedefler üretir", () => {
    const [face, crystal] = buildGallery(cloud);
    expect(Array.from(face)).not.toEqual(Array.from(crystal));
  });
});
