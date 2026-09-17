/**
 * MONA şekil galerisi — saf fonksiyonlar, DOM/WebGL bağımlılığı yok.
 *
 * Kullanıcının referans görsellerinden (Downloads/mona, 13 Eylül 2026)
 * türetilen dört silüet: yüz profili, kristal, tel kafes küp, iris.
 * MONA bunları belli aralıklarla alır ve kütlesine geri döner.
 *
 * NEDEN BU DÖRDÜ: referans setinde sekiz görsel vardı. Arı+çiçek ve
 * ışınlı güneş varlığı dışarıda bırakıldı — ikisi de ince çizgi ve
 * teknik açıklama katmanları taşıyor, MONA'nın ölçeğinde (yarıçap ~1,
 * ekranda birkaç yüz piksel) nokta bulutuna indirildiğinde silüet
 * okunmuyor, gürültüye dönüşüyor. Nilüfer zaten `mona-lotus.ts`'te ve
 * yalnız Creative'in MonaShard'ına ait (DECISIONS #48).
 *
 * YÖNTEM: göz/kalp/halka matematiksel olarak çizilir; bu dördü çizilemez.
 * Nilüferde kurulan yol izleniyor — referans görselin parlaklığı bir
 * yoğunluk haritasına indiriliyor (`scripts/generate-mona-shapes.mjs` ->
 * `mona-shape-density.ts`), noktalar o haritadan ağırlıklı örnekleniyor.
 * Parlak hücreye çok nokta düşer, sönük hücreye az.
 *
 * Şekiller izleyiciye DÖNÜK durur: shader `u_rotation` dönüşünü yalnız
 * kütleye (blob) uygular, şekillere değil (bkz. mona-dots-scene.ts vertex
 * shader'ı "Şekiller izleyiciye dönük durur"). Düz silüetler bu yüzden
 * yandan bakıldığında kaybolmaz.
 */

import { LAYER, mulberry32, type ParticleCloud } from "./mona-dots-geometry";
import { decodeDensity, sampleDensity } from "./mona-lotus";
import {
  CRYSTAL_DENSITY,
  CUBE_DENSITY,
  FACE_DENSITY,
  IRIS_DENSITY,
} from "./mona-shape-density";

export type GalleryShapeName = "face" | "crystal" | "cube" | "iris";

interface DensityMap {
  readonly size: number;
  readonly data: string;
}

interface GalleryShape {
  readonly name: GalleryShapeName;
  readonly density: DensityMap;
  /** Silüetin model uzayındaki boyu: haritanın [-1,1] karesi × bu değer. */
  readonly scale: number;
  /** Hacim: tamamen düz değil, ince bir kalınlık (model birimi). */
  readonly depth: number;
  /**
   * Çekirdek noktalarının haritayı ne kadar "yumuşak" okuyacağı.
   * < 1 sönük hücrelere de pay verir → iç dolgu; 1 haritayı olduğu gibi
   * kullanır → yalnız parlak kenarlar. Kabuk her zaman 1 ile okur:
   * parlak kenar çizgisini o çizer.
   */
  readonly coreExponent: number;
}

/**
 * Ölçüler referans görsellerin kadrajına göre seçildi. Yüz ve kristal
 * kadrajı dolduruyor (0.95); küp referansta daha küçük duruyor ve 0.95'te
 * köşeleri kütlenin hale katmanına giriyordu (0.82). İris halka olduğu
 * için büyük kalabilir.
 *
 * Derinlik: küp ve kristal hacimli cisimler, ince bir z dağılımı onlara
 * katılık veriyor. Yüz bir profil — neredeyse düz. İris bir disk.
 */
const SHAPES: readonly GalleryShape[] = [
  { name: "face", density: FACE_DENSITY, scale: 0.95, depth: 0.1, coreExponent: 0.55 },
  { name: "crystal", density: CRYSTAL_DENSITY, scale: 0.95, depth: 0.22, coreExponent: 0.5 },
  { name: "cube", density: CUBE_DENSITY, scale: 0.82, depth: 0.26, coreExponent: 0.7 },
  { name: "iris", density: IRIS_DENSITY, scale: 0.98, depth: 0.12, coreExponent: 0.5 },
];

export const GALLERY_SHAPES: readonly GalleryShapeName[] = SHAPES.map((shape) => shape.name);

/**
 * Buluttaki her nokta için hedef konum (xyz).
 *
 * Kabuk ve çekirdek şekle gider; hale, toz ve aura kendi yerinde kalır —
 * göz/kalp/halka/nilüfer hedefleriyle aynı sözleşme, böylece şekil
 * anında kütlenin dış atmosferi yerinde durur ve geçiş sert olmaz.
 *
 * Kendi tohumuyla çalışır: bulutun rastgele dizisine dokunmaz.
 */
export function galleryTargets(
  cloud: Pick<ParticleCloud, "count" | "positions" | "meta">,
  shape: GalleryShape,
  seed: number,
): Float32Array {
  const random = mulberry32(seed);
  const targets = new Float32Array(cloud.count * 3);
  const layerOf = (index: number) => cloud.meta[index * 4 + 2];

  let shellCount = 0;
  let coreCount = 0;
  for (let index = 0; index < cloud.count; index++) {
    if (layerOf(index) === LAYER.shell) shellCount++;
    else if (layerOf(index) === LAYER.core) coreCount++;
  }

  const cells = decodeDensity(shape.density);
  const pools = {
    [LAYER.shell]: { samples: sampleDensity(cells, shape.density.size, shellCount, random), next: 0 },
    [LAYER.core]: {
      samples: sampleDensity(cells, shape.density.size, coreCount, random, shape.coreExponent),
      next: 0,
    },
  };

  for (let index = 0; index < cloud.count; index++) {
    const layer = layerOf(index);
    if (layer !== LAYER.shell && layer !== LAYER.core) {
      targets.set(cloud.positions.subarray(index * 3, index * 3 + 3), index * 3);
      continue;
    }
    const pool = pools[layer as typeof LAYER.shell | typeof LAYER.core];
    targets[index * 3] = pool.samples[pool.next * 2] * shape.scale;
    targets[index * 3 + 1] = pool.samples[pool.next * 2 + 1] * shape.scale;
    targets[index * 3 + 2] = (random() - 0.5) * shape.depth;
    pool.next++;
  }
  return targets;
}

/**
 * Galerinin tamamı, `GALLERY_SHAPES` ile aynı sırada.
 *
 * Her şekil kendi tohumuyla üretilir (taban + sıra): iki şekil aynı
 * noktayı aynı yere göndermesin, geçişte bütün bulut birlikte akmasın.
 */
export function buildGallery(
  cloud: Pick<ParticleCloud, "count" | "positions" | "meta">,
  seed = 9090,
): Float32Array[] {
  return SHAPES.map((shape, index) => galleryTargets(cloud, shape, seed + index * 137));
}
