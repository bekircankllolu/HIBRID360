/**
 * Ekosistem sahnesinin PARÇACIK GEOMETRİSİ.
 *
 * WebGL'den ayrı: buradaki her şey saf sayı, dolayısıyla testi var.
 * `solar-dust-scene.ts` bunu GPU'ya yükler, karar vermez.
 *
 * 19 Eylül 2026 kullanıcı isteği (ekosistem yeniden tasarımı):
 * *"Ortada hibrit taşı dönmeye devam etsin. Etrafında noktacıklardan
 * oluşan bir ekosistem... sanki Mona'nın noktacıkları bu hibrit taşının
 * etrafını sarmış gibi. 8 tane nokta da diğer noktalardan daha belirgin
 * şekilde büyük, hepsinin rengi sarı. Bu 8 tane nokta birbirine ince
 * çizgilerle bağlı. Aslında yaptığımız çok fazla iş var bu ekosistemde
 * ama biz 8 tanesini öne çıkartıyoruz — en iyi yaptığımız 8 iş. Noktaya
 * tıkladığımız zaman nokta büyüsün... belki o noktayı yakınlaşmış, daha
 * sıkı formda bir Mona olarak görebiliriz."*
 *
 * Yani sahnenin anlatısı: merkezde marka, çevresinde yaptığımız işlerin
 * tozu, onun içinden sıyrılan sekiz iş, ve o sekizinin birbirine bağlı
 * olması. Toz "çok fazla iş var" demek; sekiz düğüm "bunları öne
 * çıkarıyoruz" demek.
 */

export type Vec3 = [number, number, number];

/** Tek bir parçacık — hem toz hem düğüm kümesi bundan kuruluyor. */
export interface Particle {
  /** Merkeze göre konum (dünya birimi). */
  position: Vec3;
  /** Piksel cinsinden taban boyutu (mesafeyle ölçekleniyor). */
  size: number;
  /** 0-1 taban parlaklık. */
  alpha: number;
  /**
   * Hangi düğüme ait: -1 serbest toz, >=0 o hizmetin kümesindeki
   * parçacık. Odaklanınca yalnız ilgili küme sıkışıp parlıyor.
   */
  owner: number;
}

/** Deterministik rastgelelik — aynı tohum aynı bulutu verir. */
export function makeRandom(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0xffffffff;
  };
}

/**
 * Küre yüzeyinde EŞ DAĞILIMLI yön.
 *
 * `acos(1 - 2u)` şart: açıyı doğrudan rastgele seçmek parçacıkları
 * kutuplarda yığıyor ve toz bulutu iki tepesi şişmiş bir limon gibi
 * duruyor.
 */
function sphericalDirection(random: () => number): Vec3 {
  const z = 1 - 2 * random();
  const r = Math.sqrt(Math.max(0, 1 - z * z));
  const phi = random() * Math.PI * 2;
  return [r * Math.cos(phi), z, r * Math.sin(phi)];
}

export interface DustOptions {
  /** Kaç serbest toz parçacığı. */
  count: number;
  /** Bulutun iç ve dış yarıçapı (dünya birimi). */
  innerRadius: number;
  outerRadius: number;
  seed?: number;
}

/**
 * Merkezi saran toz kabuğu.
 *
 * Parçacıklar bir KÜRE KABUĞU içinde, ama dikeyde basık (0.42): sistem
 * bir top değil, bir disk hissi veriyor — yörüngeler ve düğümler de o
 * düzlemde. Tamamen düz bir disk ise derinliği öldürüyordu.
 */
export function buildDust({
  count,
  innerRadius,
  outerRadius,
  seed = 1,
}: DustOptions): Particle[] {
  const random = makeRandom(seed);
  const particles: Particle[] = [];
  for (let i = 0; i < count; i += 1) {
    const direction = sphericalDirection(random);
    // Yarıçap dağılımı küp kökle: hacimde eş dağılım, yani içerisi
    // dışarısı kadar seyrek görünüyor.
    const t = random() ** (1 / 3);
    const radius = innerRadius + (outerRadius - innerRadius) * t;
    particles.push({
      position: [
        direction[0] * radius,
        direction[1] * radius * 0.42,
        direction[2] * radius,
      ],
      size: 1.1 + random() * 2.2,
      // Dışa doğru sönüm: kadrajın kenarında bulut eriyor, sert bir
      // küre sınırı görünmüyor.
      alpha: (0.3 + random() * 0.45) * (1 - t * 0.4),
      owner: -1,
    });
  }
  return particles;
}

export interface NodeClusterOptions {
  /** Küme başına parçacık. */
  count: number;
  /** Kümenin yarıçapı (dünya birimi). */
  radius: number;
  seed?: number;
}

/**
 * Bir hizmet düğümünün parçacık kümesi — MERKEZE GÖRE göreli konumlar.
 * Her karede düğümün o anki yörünge konumuna eklenerek çiziliyor.
 *
 * Kullanıcının "daha sıkı formda bir Mona" dediği his buradan geliyor:
 * küme normalde nefes alır gibi gevşek, odaklanınca sıkışıyor
 * (`focusTightness`) ve tanımlı bir küreye dönüşüyor.
 */
export function buildNodeCluster({
  count,
  radius,
  seed = 1,
}: NodeClusterOptions): Particle[] {
  const random = makeRandom(seed);
  const particles: Particle[] = [];
  for (let i = 0; i < count; i += 1) {
    const direction = sphericalDirection(random);
    // Yüzeye yakın yığılma (0.55 üssü): küme içi boş bir top gibi değil,
    // kabuğu belirgin bir küre gibi okunuyor.
    const t = random() ** 0.55;
    particles.push({
      position: [
        direction[0] * radius * t,
        direction[1] * radius * t,
        direction[2] * radius * t,
      ],
      size: 2.2 + random() * 3.4,
      alpha: 0.55 + random() * 0.45,
      owner: 0,
    });
  }
  return particles;
}

/**
 * Sekiz düğümü birbirine bağlayan ince çizgilerin uç çiftleri.
 *
 * TAM graf DEĞİL: sekiz düğümün hepsini birbirine bağlamak 28 çizgi
 * eder ve merkez bir yumağa dönüşür. Her düğüm komşu halkada kendinden
 * sonrakine bağlanıyor (kapalı bir çember: 8 çizgi) ARTI karşısındakine
 * (4 çizgi) — toplam 12. Çember "hepsi bir ekosistem", çaprazlar
 * "birbirinden bağımsız değiller" demek.
 */
export function buildWeb(count: number): [number, number][] {
  const pairs: [number, number][] = [];
  for (let i = 0; i < count; i += 1) {
    pairs.push([i, (i + 1) % count]);
  }
  const half = Math.floor(count / 2);
  for (let i = 0; i < half; i += 1) {
    pairs.push([i, i + half]);
  }
  return pairs;
}

/**
 * Odak durumuna göre kümenin sıkılığı ve parlaklığı.
 *
 * `focus` odaklanılan düğüm (-1 yok), `index` sorulan düğüm.
 * Dönen `tightness` 1 iken küme durağan yarıçapında; 0.55'te sıkışmış.
 */
export function clusterState(
  focus: number,
  index: number,
  breathe: number,
): { tightness: number; glow: number } {
  if (focus === index) {
    // 0.55 denendi ve bırakıldı: küme o kadar sıkışınca yakından bile
    // küçük kalıyordu. 0.8 hâlâ "toparlanmış" okunuyor.
    return { tightness: 0.8, glow: 1 };
  }
  if (focus >= 0) {
    // Odak varken diğerleri geri çekiliyor: sahne dağılmıyor ama dikkat
    // tek yerde. 0.42 fazla parlaktı — ön plandaki kümeler seçilenin
    // önüne geçiyordu.
    return { tightness: 1 + breathe * 0.06, glow: 0.26 };
  }
  return { tightness: 1 + breathe * 0.06, glow: 0.78 };
}
