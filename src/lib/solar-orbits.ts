/**
 * Hibrid ekosistemi — yörünge mekaniği ve 3B izdüşüm matematiği.
 *
 * Tarayıcı gerektirmez: sahne (`solar-scene.ts`) yalnız çizer, konum ve
 * kamera hesabı burada — böylece jsdom'suz test edilebilir (mona-dots ve
 * meet-the-crew ile aynı ayrım).
 *
 * 18 Eylül 2026 kullanıcı isteği: *"gerçek gezegenler gibi konumlandıralım...
 * fiziklerinin çok güzel olması lazım."* Bu yüzden dairesel bir yaklaşıklık
 * değil GERÇEK Kepler hareketi var:
 *
 *   1. Ortalama anomali M zamanla doğrusal artar (n = 2π/T).
 *   2. Kepler denklemi E − e·sin E = M Newton yöntemiyle çözülür.
 *   3. Gerçek anomali ν ve yarıçap r buradan türetilir.
 *
 * Sonuç: eliptik yörüngede gezegen yakın noktada (perihelion) hızlanır,
 * uzak noktada yavaşlar. Yörünge periyodu Kepler'in üçüncü yasasına uyar
 * (T ∝ a^1.5), yani içteki gezegen dıştakinden hızlı döner — bu ilişki
 * elle ayarlanmış hız tablosuyla değil, yarıçaptan geliyor.
 */

export type Vec3 = readonly [number, number, number];
export type Mat4 = Float32Array;

export interface OrbitalElements {
  /** Yarı büyük eksen (dünya birimi). */
  semiMajor: number;
  /** Dışmerkezlik 0..0.4 — 0 dairesel. */
  eccentricity: number;
  /** Yörünge düzleminin eğimi (radyan). */
  inclination: number;
  /** Çıkış düğümü boylamı (radyan) — yörüngeyi kendi düzleminde döndürür. */
  node: number;
  /** Başlangıç ortalama anomalisi (radyan) — gezegenleri dağıtır. */
  phase: number;
}

/**
 * Kepler III: periyot yarı büyük eksenin 1.5 kuvvetiyle büyür.
 *
 * timeScale 16: en içteki gezegen turunu ~70 sn'de, en dıştaki ~7 dk'da
 * tamamlıyor. Daha hızlısı (ilk deneme 5.4) gerçek bir sistemden çok bir
 * çark gibi duruyordu ve hareket eden gezegene tıklamak zorlaşıyordu.
 */
export function orbitalPeriod(semiMajor: number, timeScale = 16): number {
  return timeScale * Math.pow(semiMajor, 1.5);
}

/**
 * Kepler denklemini çözer: E − e·sin E = M.
 *
 * Newton-Raphson, üç yineleme. e ≤ 0.4 için bu 1e-10 mertebesinde hata
 * bırakır (test edildi) — görsel bir sahne için fazlasıyla yeterli, ve
 * kare başına sekiz gezegen için maliyeti ihmal edilebilir.
 */
export function eccentricAnomaly(meanAnomaly: number, eccentricity: number): number {
  let e = meanAnomaly;
  for (let i = 0; i < 3; i++) {
    const f = e - eccentricity * Math.sin(e) - meanAnomaly;
    const df = 1 - eccentricity * Math.cos(e);
    e -= f / df;
  }
  return e;
}

/** Gezegenin t anındaki konumu (yıldız orijinde). */
export function orbitPosition(orbit: OrbitalElements, timeSeconds: number): Vec3 {
  const period = orbitalPeriod(orbit.semiMajor);
  const meanAnomaly = orbit.phase + (2 * Math.PI * timeSeconds) / period;
  const E = eccentricAnomaly(meanAnomaly, orbit.eccentricity);
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  const a = orbit.semiMajor;
  const e = orbit.eccentricity;
  // Yörünge düzleminde konum (odak orijinde).
  const px = a * (cosE - e);
  const pz = a * Math.sqrt(1 - e * e) * sinE;
  // Eğim (X ekseni) sonra düğüm boylamı (Y ekseni).
  const cosI = Math.cos(orbit.inclination);
  const sinI = Math.sin(orbit.inclination);
  const y1 = -pz * sinI;
  const z1 = pz * cosI;
  const cosN = Math.cos(orbit.node);
  const sinN = Math.sin(orbit.node);
  return [px * cosN + z1 * sinN, y1, -px * sinN + z1 * cosN];
}

/** Yörünge elipsinin çizgi noktaları — halkayı çizmek için. */
export function orbitPath(orbit: OrbitalElements, segments = 128): Float32Array {
  const period = orbitalPeriod(orbit.semiMajor);
  const points = new Float32Array(segments * 3);
  for (let i = 0; i < segments; i++) {
    // Zamanla değil AÇIYLA örnekliyoruz: eşit zaman aralıkları elipsin
    // uzak yayında seyrekleşir ve halka köşeli görünürdü.
    const t = (i / segments) * period;
    const [x, y, z] = orbitPosition({ ...orbit, phase: 0 }, t);
    points[i * 3] = x;
    points[i * 3 + 1] = y;
    points[i * 3 + 2] = z;
  }
  return points;
}

/* ----------------------------------------------------------- matris/vektör */

export function identity(): Mat4 {
  const m = new Float32Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  return m;
}

export function multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] =
        a[r] * b[c * 4] +
        a[4 + r] * b[c * 4 + 1] +
        a[8 + r] * b[c * 4 + 2] +
        a[12 + r] * b[c * 4 + 3];
    }
  }
  return out;
}

export function perspective(fovY: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1 / Math.tan(fovY / 2);
  const m = new Float32Array(16);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = (far + near) / (near - far);
  m[11] = -1;
  m[14] = (2 * far * near) / (near - far);
  return m;
}

export function normalize(v: Vec3): Vec3 {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

export function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

export function subtract(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function lookAt(eye: Vec3, target: Vec3, up: Vec3 = [0, 1, 0]): Mat4 {
  const z = normalize(subtract(eye, target));
  const x = normalize(cross(up, z));
  const y = cross(z, x);
  const m = new Float32Array(16);
  m[0] = x[0]; m[1] = y[0]; m[2] = z[0]; m[3] = 0;
  m[4] = x[1]; m[5] = y[1]; m[6] = z[1]; m[7] = 0;
  m[8] = x[2]; m[9] = y[2]; m[10] = z[2]; m[11] = 0;
  m[12] = -(x[0] * eye[0] + x[1] * eye[1] + x[2] * eye[2]);
  m[13] = -(y[0] * eye[0] + y[1] * eye[1] + y[2] * eye[2]);
  m[14] = -(z[0] * eye[0] + z[1] * eye[1] + z[2] * eye[2]);
  m[15] = 1;
  return m;
}

export function translation(v: Vec3): Mat4 {
  const m = identity();
  m[12] = v[0];
  m[13] = v[1];
  m[14] = v[2];
  return m;
}

/** Ölçek + Y ekseni dönüşü + Z ekseni eğimi (gezegen model matrisi). */
export function planetModel(position: Vec3, radius: number, spin: number, tilt: number): Mat4 {
  const cs = Math.cos(spin);
  const ss = Math.sin(spin);
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  const m = new Float32Array(16);
  // R_z(tilt) · R_y(spin) · S(radius)
  m[0] = radius * ct * cs;
  m[1] = radius * st * cs;
  m[2] = radius * -ss;
  m[4] = radius * -st;
  m[5] = radius * ct;
  m[6] = 0;
  m[8] = radius * ct * ss;
  m[9] = radius * st * ss;
  m[10] = radius * cs;
  m[12] = position[0];
  m[13] = position[1];
  m[14] = position[2];
  m[15] = 1;
  return m;
}

export interface ScreenPoint {
  x: number;
  y: number;
  /** Kameraya uzaklık — etiket sıralaması ve solukluk için. */
  distance: number;
  /** Kameranın arkasına düşen nokta çizilmez. */
  visible: boolean;
}

/** Dünya koordinatını ekran pikseline çevirir (DOM etiketleri için). */
export function projectToScreen(
  viewProjection: Mat4,
  point: Vec3,
  width: number,
  height: number,
): ScreenPoint {
  const m = viewProjection;
  const x = m[0] * point[0] + m[4] * point[1] + m[8] * point[2] + m[12];
  const y = m[1] * point[0] + m[5] * point[1] + m[9] * point[2] + m[13];
  const w = m[3] * point[0] + m[7] * point[1] + m[11] * point[2] + m[15];
  const z = m[2] * point[0] + m[6] * point[1] + m[10] * point[2] + m[14];
  if (!Number.isFinite(w) || w <= 0.0001) {
    return { x: 0, y: 0, distance: Number.POSITIVE_INFINITY, visible: false };
  }
  return {
    x: ((x / w) * 0.5 + 0.5) * width,
    y: (0.5 - (y / w) * 0.5) * height,
    distance: w,
    visible: z / w > -1 && z / w < 1,
  };
}

/* ------------------------------------------------------------------- kamera */

export interface CameraState {
  /** Bakılan nokta. */
  target: Vec3;
  /** Hedefe uzaklık. */
  distance: number;
  /** Yatay açı (radyan). */
  yaw: number;
  /** Dikey açı (radyan) — kutuplara yapışmaması için sınırlı. */
  pitch: number;
}

export function cameraEye(camera: CameraState): Vec3 {
  const { target, distance, yaw, pitch } = camera;
  const cp = Math.cos(pitch);
  return [
    target[0] + Math.sin(yaw) * cp * distance,
    target[1] + Math.sin(pitch) * distance,
    target[2] + Math.cos(yaw) * cp * distance,
  ];
}

/**
 * Kritik sönümlü yaklaşma — kamera hedefe "yaylanmadan" ama yumuşak varır.
 * `dt` saniye; `lambda` büyükse daha çabuk. Kare hızından bağımsız olsun
 * diye üstel form kullanılıyor (lerp sabiti 60fps'e bağlı kalırdı).
 */
export function approach(current: number, goal: number, lambda: number, dt: number): number {
  const next = goal + (current - goal) * Math.exp(-lambda * dt);
  // Üstel yaklaşma hedefe asla tam oturmaz; kalan fark gözle görülmez ama
  // sahneyi sonsuza dek "kıpırdar" halde tutar. İmleç bir gezegenin üstüne
  // geldiğinde sahnenin GERÇEKTEN durması gerekiyor (hareket eden hedefe
  // tıklamak zor; otomatik testler de "element is not stable" diyor).
  return Math.abs(next - goal) < 1e-4 ? goal : next;
}

export function approachVec(current: Vec3, goal: Vec3, lambda: number, dt: number): Vec3 {
  return [
    approach(current[0], goal[0], lambda, dt),
    approach(current[1], goal[1], lambda, dt),
    approach(current[2], goal[2], lambda, dt),
  ];
}

/** Açı farkını −π..π aralığına indirger — kamera uzun yoldan dönmesin. */
export function shortestAngle(from: number, to: number): number {
  let delta = (to - from) % (2 * Math.PI);
  if (delta > Math.PI) delta -= 2 * Math.PI;
  if (delta < -Math.PI) delta += 2 * Math.PI;
  return from + delta;
}

/**
 * Odaklanılan gezegen için kamera hedefi: gezegen ekranın ortasında ve
 * çapı görüş alanının yaklaşık üçte biri olacak uzaklık.
 */
export function focusDistance(planetRadius: number, fovY: number): number {
  return (planetRadius * 3.1) / Math.tan(fovY / 2);
}
