/**
 * Pen tool imza çizimleri — paylaşılan geometri sözlüğü.
 *
 * Her servis sayfasının kendi çizimi var (sinema optiği, timeline, sinyal,
 * sahne, arayüz rotası, dağıtım yörüngesi, insan + AI akışı). Ortak olan bu yol
 * kurucu sözlüğü ve tip sözleşmesi; şekillerin kendisi sayfa modüllerinde
 * ve birbirinden bağımsız — "aynı ikonun rengi değişmiş hâli" olmasınlar.
 *
 * Yollar saf fonksiyonlarla üretilir (rastgelelik yok), böylece vitest ile
 * determinizm ve yapı test edilebilir — `dna-helix.ts` ile aynı yaklaşım.
 */

export type SignatureRole = "front" | "back" | "construction" | "accent";

export interface SignaturePath {
  id: string;
  d: string;
  /** Beyaz çizim katmanları ve yalnız final vurgusunda kullanılan sarı accent. */
  role: SignatureRole;
  /** Çizim koreografisi: `--draw` bu aralıkta yolu tamamlar (0-1). */
  from: number;
  to: number;
}

export interface SignatureNode {
  x: number;
  y: number;
  /** Görünme eşiği; çizimin son bölümü için 0.75+ verilir. */
  t: number;
  /** Dolu kare (seçili yol) veya içi boş kare (yardımcı). */
  kind: "filled" | "hollow";
}

export interface SignatureHandle {
  x: number;
  y: number;
  inX: number;
  inY: number;
  outX: number;
  outY: number;
  t: number;
}

export interface SignatureGeometry {
  width: number;
  height: number;
  paths: SignaturePath[];
  nodes: SignatureNode[];
  handles: SignatureHandle[];
}

/** Yol dizelerini kısa ve deterministik tutar (test edilebilir çıktı). */
export function n(value: number): string {
  return Number(value.toFixed(2)).toString();
}

export function line(x1: number, y1: number, x2: number, y2: number): string {
  return `M${n(x1)} ${n(y1)}L${n(x2)} ${n(y2)}`;
}

export function polyline(points: readonly (readonly [number, number])[], close = false): string {
  if (points.length === 0) return "";
  const [head, ...rest] = points;
  const body = rest.map(([x, y]) => `L${n(x)} ${n(y)}`).join("");
  return `M${n(head[0])} ${n(head[1])}${body}${close ? "Z" : ""}`;
}

export function rect(x: number, y: number, width: number, height: number): string {
  return polyline(
    [
      [x, y],
      [x + width, y],
      [x + width, y + height],
      [x, y + height],
    ],
    true,
  );
}

export function roundedRect(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): string {
  const r = Math.min(radius, width / 2, height / 2);
  return [
    `M${n(x + r)} ${n(y)}`,
    `L${n(x + width - r)} ${n(y)}`,
    `A${n(r)} ${n(r)} 0 0 1 ${n(x + width)} ${n(y + r)}`,
    `L${n(x + width)} ${n(y + height - r)}`,
    `A${n(r)} ${n(r)} 0 0 1 ${n(x + width - r)} ${n(y + height)}`,
    `L${n(x + r)} ${n(y + height)}`,
    `A${n(r)} ${n(r)} 0 0 1 ${n(x)} ${n(y + height - r)}`,
    `L${n(x)} ${n(y + r)}`,
    `A${n(r)} ${n(r)} 0 0 1 ${n(x + r)} ${n(y)}`,
    "Z",
  ].join("");
}

export function circlePath(cx: number, cy: number, r: number): string {
  return [
    `M${n(cx - r)} ${n(cy)}`,
    `A${n(r)} ${n(r)} 0 1 1 ${n(cx + r)} ${n(cy)}`,
    `A${n(r)} ${n(r)} 0 1 1 ${n(cx - r)} ${n(cy)}`,
    "Z",
  ].join("");
}

export function ellipsePath(cx: number, cy: number, rx: number, ry: number): string {
  return [
    `M${n(cx)} ${n(cy - ry)}`,
    `A${n(rx)} ${n(ry)} 0 1 1 ${n(cx)} ${n(cy + ry)}`,
    `A${n(rx)} ${n(ry)} 0 1 1 ${n(cx)} ${n(cy - ry)}`,
    "Z",
  ].join("");
}

/** Açılar derece, saat yönünde, 0° sağ. */
export function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  const start = (startDeg * Math.PI) / 180;
  const end = (endDeg * Math.PI) / 180;
  const sweep = endDeg > startDeg ? 1 : 0;
  const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  return [
    `M${n(cx + r * Math.cos(start))} ${n(cy + r * Math.sin(start))}`,
    `A${n(r)} ${n(r)} 0 ${large} ${sweep} ${n(cx + r * Math.cos(end))} ${n(cy + r * Math.sin(end))}`,
  ].join("");
}

export function cubic(
  x1: number,
  y1: number,
  c1x: number,
  c1y: number,
  c2x: number,
  c2y: number,
  x2: number,
  y2: number,
): string {
  return `M${n(x1)} ${n(y1)}C${n(c1x)} ${n(c1y)} ${n(c2x)} ${n(c2y)} ${n(x2)} ${n(y2)}`;
}

/** Aynı yapıdaki çizgileri tek bir yolda toplar (tek eleman, tek çizim). */
export function joinPaths(parts: readonly string[]): string {
  return parts.filter((part) => part !== "").join("");
}

/**
 * Ölçüm/eksen işaretleri — teknik çizim sözlüğünün ortak parçası.
 * Sayfalar arası tutarlılık için burada, sayfaya özel modüllerde değil.
 */

/** Bir taban çizgisi boyunca dikey ölçüm çentikleri (eksen, timeline, vb.). */
export function tickRow(xs: readonly number[], y: number, len: number): string {
  return joinPaths(xs.map((x) => line(x, y - len / 2, x, y + len / 2)));
}

/** Bir elips/daire kenarından dışa doğru radyal ölçüm çentikleri (odak halkası skalası). */
export function rimTicks(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  startDeg: number,
  endDeg: number,
  count: number,
  len: number,
): string {
  const parts: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const t = count === 1 ? 0 : index / (count - 1);
    const deg = startDeg + (endDeg - startDeg) * t;
    const rad = (deg * Math.PI) / 180;
    const ex = cx + Math.cos(rad) * rx;
    const ey = cy + Math.sin(rad) * ry;
    const fx = cx + Math.cos(rad) * (rx + len);
    const fy = cy + Math.sin(rad) * (ry + len);
    parts.push(line(ex, ey, fx, fy));
  }
  return joinPaths(parts);
}

/** Bir dikdörtgenin dört köşesine yakın vida/montaj delikleri (plaka, flanş). */
export function cornerHoles(x: number, y: number, width: number, height: number, r: number, inset: number): string {
  return joinPaths([
    circlePath(x + inset, y + inset, r),
    circlePath(x + width - inset, y + inset, r),
    circlePath(x + inset, y + height - inset, r),
    circlePath(x + width - inset, y + height - inset, r),
  ]);
}
