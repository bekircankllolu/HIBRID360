/**
 * Works hero — nöron ağının GEOMETRİSİ ve SİNYAL MANTIĞI.
 *
 * Çizimden ayrı bir dosyada, çünkü buradaki kararların hepsi ölçülebilir
 * (kaç gövde, kaç dal, sinyal hangi yola gider) ve testi var. Çizim
 * tarafı (`TeamworkField.tsx`) bu modelin ürettiğini boyar, karar vermez.
 *
 * 19 Eylül 2026 kullanıcı isteği: *"Bu sayfa yine nokta nokta olacak
 * şekilde, Mona'nın noktaları gibi. Beyin nöronlarını gösterebiliriz...
 * ışıklar böyle geçişli elektrik akımları... sanki bilgi transferi
 * yapılıyormuş gibi bir yerden bir yere gitmesi lazım sürekli. Bir nokta
 * aydınlanacak sonra başka bir nokta aydınlanacak. Ekip çalışmasındaki o
 * bilgi aktarımını, düşüncelerin aktarımını bu şekilde anlatabiliriz."*
 *
 * Ve etkileşim TERSİNE: *"imleçten kaçan bir ışık sistemi olabilir.
 * İmlecin olmadığı yerler parlayacak. İmlecin olduğu yerlerde biraz daha
 * sönük bir renk alacak."*
 */

/** Ağdaki tek bir nokta. Her şey noktadan çiziliyor — çizgi yok. */
export interface Dot {
  x: number;
  y: number;
  /** Piksel yarıçapı. Gövdeye yakın iri, uca doğru inceliyor. */
  radius: number;
  /** 0-1 durağan parlaklık. */
  base: number;
}

/** Sinyalin üzerinde yürüdüğü yol: sıralı noktalar + kümülatif uzunluk. */
export interface Path {
  dots: Dot[];
  /** `dots[i]`ye kadar olan toplam uzunluk; sinyal konumu bununla çözülür. */
  lengths: number[];
  total: number;
  /** Yol bir gövdeden diğerine gidiyorsa hedef gövdenin indeksi. */
  toSoma: number | null;
  fromSoma: number;
}

export interface Soma {
  x: number;
  y: number;
  /** 0-1 ateşleme parlaklığı; zamanla sönüyor. */
  charge: number;
  /** Bu gövdeden çıkan yol indeksleri. */
  paths: number[];
}

export interface Network {
  somas: Soma[];
  paths: Path[];
  /** Tüm noktalar tek dizide — çizim döngüsü bunu geziyor. */
  dots: Dot[];
}

/** Sinyal: bir yolun üzerinde ilerleyen ışık. */
export interface Signal {
  path: number;
  /** Yol üzerindeki uzaklık (piksel). */
  at: number;
  speed: number;
  /** 0-1; yeni doğanlar parlak, sönerek ölüyor. */
  power: number;
}

/** Deterministik rastgelelik — aynı tohum aynı ağı verir (test edilebilir). */
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

/** İki nokta arası mesafe. */
function distance(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(bx - ax, by - ay);
}

/**
 * Bir noktalar dizisinden yol kurar: kümülatif uzunlukları önceden
 * hesaplar ki sinyal her karede baştan toplama yapmasın.
 */
function toPath(dots: Dot[], fromSoma: number, toSoma: number | null): Path {
  const lengths: number[] = [0];
  let total = 0;
  for (let i = 1; i < dots.length; i += 1) {
    total += distance(dots[i - 1].x, dots[i - 1].y, dots[i].x, dots[i].y);
    lengths.push(total);
  }
  return { dots, lengths, total, fromSoma, toSoma };
}

/**
 * Dendrit dalı: gövdeden dışarı, her adımda hafifçe sapan ve incelen bir
 * nokta zinciri. Düz çizgi değil — gerçek dendritler gibi kıvrılıyor.
 */
function growBranch(
  random: () => number,
  x: number,
  y: number,
  angle: number,
  length: number,
  spacing: number,
  startRadius: number,
): Dot[] {
  const dots: Dot[] = [];
  let cx = x;
  let cy = y;
  let direction = angle;
  const steps = Math.max(3, Math.round(length / spacing));
  for (let i = 0; i < steps; i += 1) {
    const progress = i / steps;
    // Sapma uçta artıyor: kök düz, uç dağınık.
    direction += (random() - 0.5) * (0.18 + progress * 0.42);
    cx += Math.cos(direction) * spacing;
    cy += Math.sin(direction) * spacing;
    dots.push({
      x: cx,
      y: cy,
      radius: Math.max(0.55, startRadius * (1 - progress * 0.72)),
      // Uca doğru sönüyor; en uçta tamamen kaybolmuyor ki ağ kesilmiş
      // gibi durmasın.
      base: 0.85 - progress * 0.55,
    });
  }
  return dots;
}

/**
 * Gövdeler arası akson: hafif yaylı (quadratic) bir nokta zinciri.
 * Düz olsaydı ağ bir örümcek ağına benzerdi; yay ona organik bir his
 * veriyor ve iki gövde arasındaki yolu okunur kılıyor.
 */
function growAxon(
  random: () => number,
  from: Soma,
  to: Soma,
  spacing: number,
): Dot[] {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const span = Math.hypot(dx, dy) || 1;
  // Dikey kaydırma: yayın derinliği mesafenin %8-18'i, yönü rastgele.
  const bow = span * (0.08 + random() * 0.1) * (random() < 0.5 ? -1 : 1);
  const controlX = midX + (-dy / span) * bow;
  const controlY = midY + (dx / span) * bow;

  const steps = Math.max(6, Math.round(span / spacing));
  const dots: Dot[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const inverse = 1 - t;
    const x = inverse * inverse * from.x + 2 * inverse * t * controlX + t * t * to.x;
    const y = inverse * inverse * from.y + 2 * inverse * t * controlY + t * t * to.y;
    // Uçlarda (gövdelerde) iri, ortada ince — akson gövdeden çıkıp
    // gövdeye giriyormuş gibi.
    const taper = Math.abs(t - 0.5) * 2;
    dots.push({ x, y, radius: 0.7 + taper * 0.7, base: 0.3 + taper * 0.22 });
  }
  return dots;
}

/**
 * Gövde konumları: ızgara + kayma. Tamamen rastgele dağıtmak kümeleşme
 * ve boş çeyrekler üretiyordu; ızgara kadrajı dengeli dolduruyor, kayma
 * da dizilmiş görünmesini engelliyor.
 */
function placeSomas(
  random: () => number,
  width: number,
  height: number,
  count: number,
): Soma[] {
  const columns = Math.max(2, Math.round(Math.sqrt(count * (width / Math.max(1, height)))));
  const rows = Math.max(2, Math.ceil(count / columns));
  const somas: Soma[] = [];
  for (let row = 0; row < rows && somas.length < count; row += 1) {
    for (let column = 0; column < columns && somas.length < count; column += 1) {
      const cellW = width / columns;
      const cellH = height / rows;
      somas.push({
        x: (column + 0.5) * cellW + (random() - 0.5) * cellW * 0.62,
        y: (row + 0.5) * cellH + (random() - 0.5) * cellH * 0.62,
        charge: 0,
        paths: [],
      });
    }
  }
  return somas;
}

export interface BuildOptions {
  width: number;
  height: number;
  /** Gövde sayısı; çağıran alana göre veriyor. */
  somaCount: number;
  seed?: number;
}

/**
 * Ağı kurar: gövdeler, her gövdeden çıkan dendritler ve gövdeleri
 * birbirine bağlayan aksonlar.
 *
 * Her gövde EN YAKIN İKİ komşusuna bağlanıyor (çift bağları tekilleyerek).
 * Daha fazlası kadrajı çizgi yumağına çeviriyor, daha azı ağı ikiye
 * bölüyor — sinyal bir yarıda sıkışıp kalıyor.
 */
export function buildNetwork({ width, height, somaCount, seed = 1 }: BuildOptions): Network {
  const random = makeRandom(seed);
  const somas = placeSomas(random, width, height, somaCount);
  const paths: Path[] = [];
  const dots: Dot[] = [];

  // Gövdenin kendi çekirdeği: sıkı bir nokta kümesi.
  for (const soma of somas) {
    const grains = 26 + Math.round(random() * 14);
    for (let i = 0; i < grains; i += 1) {
      const angle = random() * Math.PI * 2;
      const spread = random() ** 0.6 * 6.5;
      dots.push({
        x: soma.x + Math.cos(angle) * spread,
        y: soma.y + Math.sin(angle) * spread,
        radius: 0.8 + random() * 1.5,
        base: 0.75 + random() * 0.25,
      });
    }
  }

  // Dendritler.
  const reach = Math.min(width, height) * 0.22;
  for (const [index, soma] of somas.entries()) {
    const branches = 5 + Math.round(random() * 3);
    const offset = random() * Math.PI * 2;
    for (let b = 0; b < branches; b += 1) {
      const angle = offset + (b / branches) * Math.PI * 2 + (random() - 0.5) * 0.5;
      const branch = growBranch(
        random,
        soma.x,
        soma.y,
        angle,
        reach * (0.6 + random() * 0.7),
        4.6,
        2.3,
      );
      dots.push(...branch);
      soma.paths.push(paths.length);
      paths.push(toPath([{ x: soma.x, y: soma.y, radius: 2.2, base: 0.9 }, ...branch], index, null));

      // Bir dalın ucundan ikinci derece çatallanma: ağ tek yönlü
      // ışınlar yerine gerçek bir dendrit ağacı gibi duruyor.
      /*
       * İki derece çatallanma. Referans görseldeki dendritler uca doğru
       * tüy gibi açılıyor; tek derece çatal bunu vermiyordu, dallar
       * "ışın" gibi duruyordu.
       */
      if (branch.length > 6) {
        const forkCount = random() < 0.55 ? 2 : 1;
        for (let f = 0; f < forkCount; f += 1) {
          const forkAt = Math.floor(branch.length * (0.35 + random() * 0.4));
          const root = branch[forkAt];
          const forkAngle =
            angle + (random() < 0.5 ? -1 : 1) * (0.45 + random() * 0.55);
          const fork = growBranch(
            random,
            root.x,
            root.y,
            forkAngle,
            reach * (0.3 + random() * 0.4),
            4.4,
            root.radius,
          );
          dots.push(...fork);

          if (fork.length > 5 && random() < 0.6) {
            const twigAt = Math.floor(fork.length * (0.4 + random() * 0.4));
            const twigRoot = fork[twigAt];
            dots.push(
              ...growBranch(
                random,
                twigRoot.x,
                twigRoot.y,
                forkAngle + (random() < 0.5 ? -1 : 1) * (0.5 + random() * 0.6),
                reach * (0.16 + random() * 0.22),
                4.2,
                twigRoot.radius,
              ),
            );
          }
        }
      }
    }
  }

  // Aksonlar: her gövde en yakın iki komşusuna. Çift yön tekilleniyor.
  const linked = new Set<string>();
  for (const [index, soma] of somas.entries()) {
    const neighbours = somas
      .map((other, otherIndex) => ({ otherIndex, d: distance(soma.x, soma.y, other.x, other.y) }))
      .filter((entry) => entry.otherIndex !== index)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);

    for (const { otherIndex } of neighbours) {
      const key = index < otherIndex ? `${index}-${otherIndex}` : `${otherIndex}-${index}`;
      if (linked.has(key)) continue;
      linked.add(key);
      const axon = growAxon(random, soma, somas[otherIndex], 5.5);
      dots.push(...axon);
      soma.paths.push(paths.length);
      paths.push(toPath(axon, index, otherIndex));
    }
  }

  return { somas, paths, dots };
}

/**
 * Sinyalin yol üzerindeki konumu — hangi iki nokta arasında ve nerede.
 * İkili arama değil doğrusal tarama: yollar kısa (en fazla ~90 nokta) ve
 * sinyal her karede birkaç piksel ilerliyor, dolayısıyla doğrusal tarama
 * pratikte 1-2 adımda bitiyor.
 */
export function pointAt(path: Path, at: number): { x: number; y: number } {
  const clamped = Math.max(0, Math.min(path.total, at));
  let i = 1;
  while (i < path.lengths.length && path.lengths[i] < clamped) i += 1;
  const previous = path.lengths[i - 1];
  const segment = path.lengths[i] - previous || 1;
  const t = (clamped - previous) / segment;
  const a = path.dots[i - 1];
  const b = path.dots[i] ?? a;
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/**
 * Bir gövde ateşlendiğinde hangi yollara sinyal salınacağını seçer.
 *
 * KULLANICININ İSTEDİĞİ TERS ETKİLEŞİM BURADA: imleç varsa, imlece YAKIN
 * yollar daha düşük ağırlık alıyor — yani ışık imleçten kaçıyor. İmleç
 * yokken ağırlıklar eşit, sahne kendi ritminde akıyor.
 */
export function choosePaths(
  soma: Soma,
  paths: Path[],
  count: number,
  pointer: { x: number; y: number; active: boolean },
  pointerRadius: number,
  random: () => number,
): number[] {
  const candidates = soma.paths.map((pathIndex) => {
    const path = paths[pathIndex];
    const end = path.dots[path.dots.length - 1];
    let weight = 1;
    if (pointer.active) {
      const d = distance(end.x, end.y, pointer.x, pointer.y);
      // 0 (imlecin üstünde) → 1 (imleçten uzakta). Taban 0.08: imlecin
      // dibindeki yol imkânsız değil, yalnız çok olasılıksız.
      weight = 0.08 + 0.92 * Math.min(1, d / (pointerRadius * 1.6));
    }
    return { pathIndex, weight };
  });

  const chosen: number[] = [];
  for (let i = 0; i < count && candidates.length > 0; i += 1) {
    const total = candidates.reduce((sum, c) => sum + c.weight, 0);
    let ticket = random() * total;
    let picked = candidates.length - 1;
    for (let c = 0; c < candidates.length; c += 1) {
      ticket -= candidates[c].weight;
      if (ticket <= 0) {
        picked = c;
        break;
      }
    }
    chosen.push(candidates[picked].pathIndex);
    candidates.splice(picked, 1);
  }
  return chosen;
}
