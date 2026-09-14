/**
 * Creative S5 — pen tool ile çizilen DNA sarmalının geometrisi
 * (docs/design/SERVICE_CHAPTER_SYSTEM.md §8, imza hareketi).
 *
 * İki iplik, tepe ve çukurlar arasında yatay tutamaçlı cubic Bezier
 * eğrileriyle kurulur. Illustrator'da pen tool ile çizilmiş bir sinüsün
 * anchor'ları da tam böyle durur: uç noktalarda, tutamaçlar yatay.
 * `HANDLE_RATIO = 0.3642`, yatay teğetli tek bir cubic ile yarım kosinüs
 * dalgasına en iyi yaklaşan oran — bu sayede kalem ucu (CSS'te `cos()` ile
 * konumlanıyor) çizginin üstünde kalır, basamak uçları da ipliğe oturur.
 *
 * Saf fonksiyon: aynı girdiye aynı çıktı. SVG'yi DnaHelix.tsx kurar.
 */

export interface Point {
  x: number;
  y: number;
}

export interface HelixAnchor extends Point {
  /** Çizim eşiği (0→1): kalem bu noktaya vardığında anchor belirir. */
  t: number;
  handleIn: Point;
  handleOut: Point;
  strand: "a" | "b";
}

export interface HelixRung {
  x: number;
  y1: number;
  y2: number;
  t: number;
}

export interface HelixGeometry {
  width: number;
  height: number;
  /** A ipliğinin orta çizgiden sapması (viewBox biriminde). */
  amplitude: number;
  /** Tam dalga sayısı — kalem ucunun `cos()` açısı `turns` tur. */
  turns: number;
  strandA: string;
  strandB: string;
  anchors: HelixAnchor[];
  rungs: HelixRung[];
}

/** Tutamaç uzunluğu / iki uç nokta arası mesafe (yarım kosinüse en iyi yaklaşım). */
const HANDLE_RATIO = 0.3642;
/** Genliğin yarı yüksekliğe oranı — anchor kareleri ve imleç kutuya sığsın. */
const AMPLITUDE_RATIO = 0.84;
/** Basamak uçları iplikten bu kadar kısa kalır (px, viewBox biriminde). */
const RUNG_GAP = 4;
/** Bundan kısa basamak çizilmez — iplikler kesişirken basamak kaybolur. */
const MIN_RUNG = 10;

const round = (value: number) => Math.round(value * 100) / 100;

function strandAnchors(
  strand: "a" | "b",
  extrema: number,
  step: number,
  width: number,
  mid: number,
  amplitude: number,
): HelixAnchor[] {
  // A üstten başlar, B aynası olarak alttan.
  const direction = strand === "a" ? -1 : 1;
  const handle = step * HANDLE_RATIO;

  return Array.from({ length: extrema + 1 }, (_, index) => {
    const x = index * step;
    const y = mid + direction * amplitude * (index % 2 === 0 ? 1 : -1);
    return {
      x,
      y,
      t: x / width,
      strand,
      handleIn: { x: x - handle, y },
      handleOut: { x: x + handle, y },
    };
  });
}

function pathFrom(anchors: readonly HelixAnchor[]): string {
  const [first, ...rest] = anchors;
  const segments = rest.map((anchor, index) => {
    const previous = anchors[index];
    return `C${round(previous.handleOut.x)} ${round(previous.y)} ${round(anchor.handleIn.x)} ${round(anchor.y)} ${round(anchor.x)} ${round(anchor.y)}`;
  });
  return [`M0 ${round(first.y)}`, ...segments].join(" ");
}

export function helixGeometry({
  width,
  height,
  turns,
  rungsPerTurn = 6,
}: {
  width: number;
  height: number;
  turns: number;
  rungsPerTurn?: number;
}): HelixGeometry {
  if (!(width > 0) || !(height > 0) || !(turns > 0)) {
    throw new Error("helixGeometry: width, height ve turns pozitif olmalı");
  }

  const extrema = Math.max(1, Math.round(turns * 2));
  const step = width / extrema;
  const mid = height / 2;
  const amplitude = mid * AMPLITUDE_RATIO;

  const anchorsA = strandAnchors("a", extrema, step, width, mid, amplitude);
  const anchorsB = strandAnchors("b", extrema, step, width, mid, amplitude);

  // Basamaklar eşit aralıklı; uçları kosinüsle hesaplanır (Bezier'e
  // görsel yaklaşım) ve iplikten RUNG_GAP kadar kısa bırakılır — hem
  // tasarım detayı hem de yaklaşım hatasını gizler.
  const rungCount = Math.max(1, Math.round(turns * rungsPerTurn));
  const rungs = Array.from({ length: rungCount }, (_, index) => {
    // x önce yuvarlanır ki çizilen konum ile belirme eşiği (t) aynı
    // noktayı göstersin.
    const x = round(((index + 0.5) * width) / rungCount);
    const yA = mid - amplitude * Math.cos((Math.PI * x) / step);
    const yB = height - yA;
    return {
      x,
      y1: round(Math.min(yA, yB) + RUNG_GAP),
      y2: round(Math.max(yA, yB) - RUNG_GAP),
      t: x / width,
    };
  }).filter((rung) => rung.y2 - rung.y1 >= MIN_RUNG);

  return {
    width,
    height,
    amplitude,
    turns: extrema / 2,
    strandA: pathFrom(anchorsA),
    strandB: pathFrom(anchorsB),
    anchors: [...anchorsA, ...anchorsB],
    rungs,
  };
}
