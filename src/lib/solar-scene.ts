/**
 * Hibrid ekosistemi — WebGL uzay sahnesi.
 *
 * 18 Eylül 2026 kullanıcı isteği: *"gerçek bir uzay yaratalım... hibrit taşı
 * bir yıldız, etrafını dönenler gezegenler... üzerine tıklayınca o gezegen
 * bize yakınlaşsın, boşluğa tıklayınca uzaklaşsın... çok gerçekçi olmalı."*
 *
 * Önceki sahne Canvas 2B idi: düz noktalar, sahte derinlik. Burada gerçek
 * 3B var — perspektif kamera, küre gövdeler, tek ışık kaynağı (yıldız),
 * yükseklik haritasından türetilen yüzey normalleri, atmosfer halkası ve
 * derinlik testi. Konum/kamera matematiği `solar-orbits.ts`'te (tarayıcısız
 * test edilebilir); burası yalnız ÇİZİYOR.
 *
 * Mimari kararlar:
 * - **WebGL1 (GLSL ES 1.00)**: kod tabanındaki MONA sahnesiyle aynı hedef,
 *   aynı uyumluluk tabanı. Dokular 1024x512 / 512x256 — ikinin kuvveti,
 *   yani mipmap ve `REPEAT` sorunsuz.
 * - **Bloom yok, ışıma var**: tam bir post-process zinciri (FBO + blur)
 *   yerine yıldızın etrafına toplamalı (additive) bir hale billboard'u
 *   çiziliyor. Görsel kazanç neredeyse aynı, kare maliyeti onda biri.
 * - **Tek ışık**: yıldız orijinde. Gezegenlerin gece yüzü gerçekten karanlık;
 *   yalnız "lights" türü dünyada (Digital) gece yüzünde şehir ışıkları var.
 */

import {
  cameraEye,
  lookAt,
  multiply,
  orbitPath,
  perspective,
  planetModel,
  projectToScreen,
  type CameraState,
  type Mat4,
  type OrbitalElements,
  type ScreenPoint,
  type Vec3,
} from "./solar-orbits";

export interface SolarRing {
  /** Gezegen yarıçapının katı olarak iç/dış sınır. */
  inner: number;
  outer: number;
}

export interface SolarBodyDef {
  id: string;
  albedo: string;
  height: string;
  /** Dünya birimi yarıçap. */
  radius: number;
  /** Eksen eğimi (radyan). */
  tilt: number;
  /** Kendi ekseni etrafında dönüş hızı (rad/s). */
  spin: number;
  orbit: OrbitalElements;
  ring?: SolarRing;
  /** Gece yüzünde ışık yayan dünya (Digital). */
  nightLights?: boolean;
}

export interface SolarFrame {
  timeSeconds: number;
  camera: CameraState;
  /** Odaklanılan gövde (-1: yok) — o gövde biraz daha parlak çizilir. */
  focus: number;
  /** Gövde konumları (solar-orbits.orbitPosition ile hesaplanmış). */
  positions: Vec3[];
}

export interface SolarScene {
  resize(): void;
  render(frame: SolarFrame): void;
  /** Etiketleri yerleştirmek için ekran koordinatları (son render'a göre). */
  project(point: Vec3): ScreenPoint;
  /** Ekran pikselinde hangi gövde var? (etiketler DOM'da, bu ek kolaylık.) */
  pick(x: number, y: number, positions: Vec3[]): number;
  dispose(): void;
}

const FOV = Math.PI / 4;

/* --------------------------------------------------------------- yardımcı */

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Solar shader failed:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function link(gl: WebGLRenderingContext, vertex: string, fragment: string) {
  const vs = compile(gl, gl.VERTEX_SHADER, vertex);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Solar program failed:", gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

/** UV küre — kutupta üçgenler incelir, ekvatorda kare; klasik ve yeterli. */
function sphereMesh(segments: number, rings: number) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let y = 0; y <= rings; y++) {
    const v = y / rings;
    const theta = v * Math.PI;
    for (let x = 0; x <= segments; x++) {
      const u = x / segments;
      const phi = u * Math.PI * 2;
      positions.push(
        Math.sin(theta) * Math.cos(phi),
        Math.cos(theta),
        Math.sin(theta) * Math.sin(phi),
      );
      uvs.push(u, v);
    }
  }
  for (let y = 0; y < rings; y++) {
    for (let x = 0; x < segments; x++) {
      const a = y * (segments + 1) + x;
      const b = a + segments + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  return {
    positions: new Float32Array(positions),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices),
  };
}

function buffer(gl: WebGLRenderingContext, data: Float32Array) {
  const b = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return b;
}

/**
 * Doku yükleme. Yüklenene kadar 1x1 gri piksel kullanılır — sahne ilk
 * karede de doğru çiziliyor, "doku gelene kadar siyah delik" olmuyor.
 */
function loadTexture(gl: WebGLRenderingContext, url: string, onLoad?: () => void) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([42, 40, 38, 255]),
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  const image = new Image();
  image.crossOrigin = "anonymous";
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    onLoad?.();
  };
  image.src = url;
  return texture;
}

/* ---------------------------------------------------------------- shaderlar */

const PLANET_VS = `
attribute vec3 a_position;
attribute vec2 a_uv;
uniform mat4 u_model;
uniform mat4 u_viewProjection;
uniform mat3 u_normalMatrix;
varying vec2 v_uv;
varying vec3 v_normal;
varying vec3 v_world;
void main() {
  vec4 world = u_model * vec4(a_position, 1.0);
  v_world = world.xyz;
  v_normal = normalize(u_normalMatrix * a_position);
  v_uv = a_uv;
  gl_Position = u_viewProjection * world;
}`;

/*
 * Gezegen yüzeyi:
 * - normal, yükseklik haritasının merkezi farkından türetiliyor (gerçek
 *   kabartma; düz doku "sticker" gibi görünürdü),
 * - tek ışık kaynağı yıldız (orijin),
 * - terminatör (gece/gündüz sınırı) yumuşatılmış,
 * - atmosfer: görüş açısına bağlı kenar halkası, gündüz tarafında güçlü,
 * - gece ışıkları yalnız `u_nightLights` açıkken.
 */
const PLANET_FS = `
precision highp float;
varying vec2 v_uv;
varying vec3 v_normal;
varying vec3 v_world;
uniform sampler2D u_albedo;
uniform sampler2D u_height;
uniform vec3 u_eye;
uniform vec3 u_atmosphere;
uniform float u_nightLights;
uniform float u_focus;
uniform float u_relief;
uniform float u_halftone;
uniform float u_cell;
uniform float u_pixelRatio;

void main() {
  vec3 lightDir = normalize(-v_world);          // yıldız orijinde
  vec2 texel = vec2(1.0 / 512.0, 1.0 / 256.0);
  float hL = texture2D(u_height, v_uv - vec2(texel.x, 0.0)).r;
  float hR = texture2D(u_height, v_uv + vec2(texel.x, 0.0)).r;
  float hD = texture2D(u_height, v_uv - vec2(0.0, texel.y)).r;
  float hU = texture2D(u_height, v_uv + vec2(0.0, texel.y)).r;

  vec3 normal = normalize(v_normal);
  // Teğet uzayı: kürede basit ve yeterli bir yaklaşıklık.
  vec3 tangent = normalize(cross(vec3(0.0, 1.0, 0.0), normal) + vec3(1e-5));
  vec3 bitangent = cross(normal, tangent);
  normal = normalize(normal + (tangent * (hL - hR) + bitangent * (hD - hU)) * u_relief * 6.0);

  float ndl = dot(normal, lightDir);
  float day = smoothstep(-0.12, 0.35, ndl);     // yumuşak terminatör
  vec3 albedo = texture2D(u_albedo, v_uv).rgb;

  vec3 viewDir = normalize(u_eye - v_world);
  vec3 halfway = normalize(lightDir + viewDir);
  float specular = pow(max(dot(normal, halfway), 0.0), 42.0) * 0.26 * day;

  float fresnel = pow(1.0 - max(dot(normalize(v_normal), viewDir), 0.0), 3.0);
  vec3 atmosphere = u_atmosphere * fresnel * (0.22 + 0.78 * day);

  // Gece yüzü: ışıklı dünyada doku parlaklığı emisyona dönüşüyor.
  float night = 1.0 - day;
  vec3 lights = albedo * night * u_nightLights * 1.35 * step(0.30, length(albedo));

  vec3 color = albedo * (0.085 + day * 1.12) + specular + atmosphere + lights;

  /*
   * YARIM TON (halftone) — 19 Eylül 2026 kullanıcı isteği: "gezegenler biraz
   * daha stilize olabilir... halftone şeklinde nokta nokta... birebir gezegen
   * değil, biraz tasarımsal bir dokunuş."
   *
   * Nokta ızgarası EKRAN uzayında ve 22° döndürülmüş — serigrafide tram
   * açısı böyle verilir. Nokta yarıçapı ışığın kareköküyle büyüyor: aydınlık
   * yüzde noktalar birleşip dolu alan, terminatöre doğru incelip kayboluyor.
   * Yani gölgelendirme kaybolmuyor, TRAM'a çevriliyor.
   *
   * Karışım tam değil (u_halftone): gezegen tamamen noktalara dönüşünce
   * küçük gövdeler okunmaz oluyordu; yüzey dokusu altta kalmaya devam ediyor.
   */
  float tone = clamp(dot(color, vec3(0.299, 0.587, 0.114)), 0.0, 1.0);
  vec2 px = gl_FragCoord.xy / max(u_pixelRatio, 0.5);
  float a = 0.384;                                   // ≈22°
  vec2 rotated = vec2(px.x * cos(a) - px.y * sin(a), px.x * sin(a) + px.y * cos(a));
  vec2 cellPos = mod(rotated, u_cell) - u_cell * 0.5;
  float radius = sqrt(tone) * u_cell * 0.62;
  float dotMask = smoothstep(radius + 0.7, radius - 0.7, length(cellPos));
  vec3 ink = normalize(max(color, vec3(0.0001))) * (0.55 + 0.75 * tone);
  vec3 screened = ink * dotMask;
  color = mix(color, screened, u_halftone);

  color *= 1.0 + u_focus * 0.16;                // odaktaki gövde bir tık parlak
  gl_FragColor = vec4(color, 1.0);
}`;

const STAR_VS = `
attribute vec2 a_corner;
uniform mat4 u_viewProjection;
uniform vec3 u_right;
uniform vec3 u_up;
uniform float u_size;
varying vec2 v_corner;
void main() {
  v_corner = a_corner;
  vec3 world = (u_right * a_corner.x + u_up * a_corner.y) * u_size;
  gl_Position = u_viewProjection * vec4(world, 1.0);
}`;

/*
 * Yıldız BILLBOARD olarak çiziliyor, küre olarak DEĞİL.
 *
 * İlk sürümde kristal videosu küreye sarılmıştı ve yıldız neredeyse siyah
 * çıkıyordu: video zaten SİYAH ZEMİN üzerine altın bir kristal, küreye
 * sarılınca ekranın çoğuna o siyah zemin düşüyor. Billboard + TOPLAMALI
 * karışım doğru çözüm: siyah zemin kendiliğinden yok oluyor, kristal
 * kendi ışığıyla kalıyor — üstelik müşterinin teslim ettiği kompozisyon
 * (kristalin yüzü) korunuyor.
 */
const STAR_FS = `
precision highp float;
varying vec2 v_corner;
uniform sampler2D u_texture;
uniform float u_time;
void main() {
  vec2 uv = v_corner * 0.5 + 0.5;
  vec3 crystal = texture2D(u_texture, vec2(uv.x, 1.0 - uv.y)).rgb;
  float pulse = 0.93 + 0.07 * sin(u_time * 0.7);
  // Kenarda yumuşak kesim: kare billboard sınırı görünmesin.
  float edge = smoothstep(1.0, 0.72, length(v_corner));
  gl_FragColor = vec4(crystal * pulse * edge * 1.25, 1.0);
}`;

/* Toplamalı hale — yıldızın etrafındaki korona ve ışık saçılması. */
const GLOW_VS = `
attribute vec2 a_corner;
uniform mat4 u_viewProjection;
uniform vec3 u_center;
uniform vec3 u_right;
uniform vec3 u_up;
uniform float u_size;
varying vec2 v_corner;
void main() {
  v_corner = a_corner;
  vec3 world = u_center + (u_right * a_corner.x + u_up * a_corner.y) * u_size;
  gl_Position = u_viewProjection * vec4(world, 1.0);
}`;

const GLOW_FS = `
precision mediump float;
varying vec2 v_corner;
uniform vec3 u_color;
uniform float u_intensity;
void main() {
  float d = length(v_corner);
  if (d > 1.0) discard;
  // İki bileşenli düşüş: sıkı çekirdek + geniş saçılma. Tek üstel düşüş
  // ya keskin bir disk ya da bulanık bir leke veriyordu.
  float core = pow(max(0.0, 1.0 - d), 5.0);
  float halo = pow(max(0.0, 1.0 - d), 1.6) * 0.42;
  gl_FragColor = vec4(u_color * (core + halo) * u_intensity, 1.0);
}`;

/* Yıldız alanı: derinlikte dağılmış noktalar, her biri kendi ritminde
   titriyor (gerçek gökyüzünde titreşim atmosferden gelir — burada da
   sahneye canlılık veren şey bu). */
const STARS_VS = `
attribute vec3 a_position;
attribute vec2 a_seed;
uniform mat4 u_viewProjection;
uniform float u_time;
uniform float u_pixelRatio;
varying float v_alpha;
varying float v_warm;
void main() {
  gl_Position = u_viewProjection * vec4(a_position, 1.0);
  float twinkle = 0.72 + 0.28 * sin(u_time * (0.7 + a_seed.x * 1.9) + a_seed.y * 6.28);
  v_alpha = (0.28 + a_seed.x * 0.72) * twinkle;
  v_warm = a_seed.y;
  gl_PointSize = (0.7 + a_seed.x * 2.1) * u_pixelRatio * twinkle;
}`;

const STARS_FS = `
precision mediump float;
varying float v_alpha;
varying float v_warm;
void main() {
  vec2 d = gl_PointCoord - vec2(0.5);
  float mask = smoothstep(0.5, 0.06, length(d));
  // Yıldızların çoğu beyaz, bir kısmı altın: tek renkli alan yapay duruyor.
  vec3 color = mix(vec3(1.0), vec3(1.0, 0.86, 0.45), step(0.82, v_warm));
  gl_FragColor = vec4(color * v_alpha * mask, 1.0);
}`;

/* Yörünge halkası — ince, sönük çizgi. */
const ORBIT_VS = `
attribute vec3 a_position;
uniform mat4 u_viewProjection;
void main() { gl_Position = u_viewProjection * vec4(a_position, 1.0); }`;

const ORBIT_FS = `
precision mediump float;
uniform vec3 u_color;
uniform float u_alpha;
void main() { gl_FragColor = vec4(u_color * u_alpha, 1.0); }`;

/* Gezegen halkası (Satürn tipi): yarıçapa göre bantlı, yarı saydam disk. */
const RING_VS = `
attribute vec2 a_corner;
uniform mat4 u_model;
uniform mat4 u_viewProjection;
varying vec2 v_corner;
void main() {
  v_corner = a_corner;
  gl_Position = u_viewProjection * u_model * vec4(a_corner.x, 0.0, a_corner.y, 1.0);
}`;

const RING_FS = `
precision mediump float;
varying vec2 v_corner;
uniform vec3 u_color;
uniform float u_inner;
void main() {
  float r = length(v_corner);
  if (r > 1.0 || r < u_inner) discard;
  float t = (r - u_inner) / (1.0 - u_inner);
  // Boşluklu bantlar — düz bir disk plastik görünüyor.
  float bands = 0.55 + 0.45 * sin(t * 34.0);
  float edge = smoothstep(0.0, 0.12, t) * smoothstep(1.0, 0.82, t);
  gl_FragColor = vec4(u_color * bands * edge * 0.75, 1.0);
}`;

/* ------------------------------------------------------------------ sahne */

export function createSolarScene(options: {
  canvas: HTMLCanvasElement;
  bodies: readonly SolarBodyDef[];
  starTexture?: HTMLVideoElement | HTMLImageElement | null;
  starRadius: number;
  onTextureLoad?: () => void;
}): SolarScene | null {
  const { canvas, bodies, starRadius } = options;
  const context = canvas.getContext("webgl", {
    alpha: false,
    antialias: true,
    depth: true,
    powerPreference: "low-power",
    preserveDrawingBuffer: false,
  }) as WebGLRenderingContext | null;
  if (!context) return null;
  // Ayrı bir `const`: null kontrolü sonrası daraltma iç fonksiyonlara
  // (render/drawGlow) ancak böyle taşınıyor.
  const gl = context;

  const planetProgram = link(gl, PLANET_VS, PLANET_FS);
  const starProgram = link(gl, STAR_VS, STAR_FS);
  const glowProgram = link(gl, GLOW_VS, GLOW_FS);
  const starsProgram = link(gl, STARS_VS, STARS_FS);
  const orbitProgram = link(gl, ORBIT_VS, ORBIT_FS);
  const ringProgram = link(gl, RING_VS, RING_FS);
  if (!planetProgram || !starProgram || !glowProgram || !starsProgram || !orbitProgram || !ringProgram) {
    return null;
  }
  // gl ile aynı gerekçe: daraltma iç fonksiyonlara (render/drawGlow) ancak
  // yeni birer const ile taşınıyor.
  const planet = planetProgram;
  const star = starProgram;
  const glow = glowProgram;
  const stars = starsProgram;
  const orbit = orbitProgram;
  const ring = ringProgram;

  const sphere = sphereMesh(64, 32);
  const spherePositions = buffer(gl, sphere.positions);
  const sphereUvs = buffer(gl, sphere.uvs);
  const sphereIndices = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndices);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.indices, gl.STATIC_DRAW);

  const quad = buffer(gl, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]));

  // Yıldız alanı: küre kabuğuna dağılmış noktalar (Fibonacci dağılımı —
  // rastgele açı seçimi kutuplarda kümelenme yapıyor).
  const STAR_COUNT = 1400;
  const starPositions = new Float32Array(STAR_COUNT * 3);
  const starSeeds = new Float32Array(STAR_COUNT * 2);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < STAR_COUNT; i++) {
    const y = 1 - (i / (STAR_COUNT - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const radius = 64 + ((i * 37) % 23);
    starPositions[i * 3] = Math.cos(theta) * r * radius;
    starPositions[i * 3 + 1] = y * radius;
    starPositions[i * 3 + 2] = Math.sin(theta) * r * radius;
    starSeeds[i * 2] = ((i * 61) % 100) / 100;
    starSeeds[i * 2 + 1] = ((i * 131) % 100) / 100;
  }
  const starsBuffer = buffer(gl, starPositions);
  const starSeedBuffer = buffer(gl, starSeeds);

  const albedoTextures = bodies.map((body) => loadTexture(gl, body.albedo, options.onTextureLoad));
  const heightTextures = bodies.map((body) => loadTexture(gl, body.height));

  // Kristal videosu yıldızın yüzeyi. Video hazır olmadan doku yüklenemez;
  // hazır olana kadar 1x1 altın piksel.
  const starTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, starTexture);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([255, 200, 60, 255]),
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const orbitBuffers = bodies.map((body) => {
    const path = orbitPathPoints(body.orbit);
    return { buffer: buffer(gl, path), count: path.length / 3 };
  });

  let viewProjection: Mat4 = new Float32Array(16);
  let eye: Vec3 = [0, 0, 1];
  let width = 1;
  let height = 1;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function bindSphere(program: WebGLProgram) {
    const position = gl.getAttribLocation(program, "a_position");
    gl.bindBuffer(gl.ARRAY_BUFFER, spherePositions);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);
    const uv = gl.getAttribLocation(program, "a_uv");
    if (uv >= 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, sphereUvs);
      gl.enableVertexAttribArray(uv);
      gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, 0, 0);
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndices);
  }

  function render(frame: SolarFrame) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const aspect = width / Math.max(1, height);
    eye = cameraEye(frame.camera);
    const view = lookAt(eye, frame.camera.target);
    const projection = perspective(FOV, aspect, 0.05, 220);
    viewProjection = multiply(projection, view);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.disable(gl.BLEND);

    /* 1. Yıldız alanı — derinlik yazmıyor, her şeyin arkasında. */
    gl.useProgram(stars);
    gl.depthMask(false);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    const starPos = gl.getAttribLocation(stars, "a_position");
    gl.bindBuffer(gl.ARRAY_BUFFER, starsBuffer);
    gl.enableVertexAttribArray(starPos);
    gl.vertexAttribPointer(starPos, 3, gl.FLOAT, false, 0, 0);
    const starSeed = gl.getAttribLocation(stars, "a_seed");
    gl.bindBuffer(gl.ARRAY_BUFFER, starSeedBuffer);
    gl.enableVertexAttribArray(starSeed);
    gl.vertexAttribPointer(starSeed, 2, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(gl.getUniformLocation(stars, "u_viewProjection"), false, viewProjection);
    gl.uniform1f(gl.getUniformLocation(stars, "u_time"), frame.timeSeconds);
    gl.uniform1f(gl.getUniformLocation(stars, "u_pixelRatio"), dpr);
    gl.drawArrays(gl.POINTS, 0, STAR_COUNT);

    /* 2. Yörünge halkaları — sönük, derinlik testli ama yazmıyor. */
    gl.useProgram(orbit);
    gl.uniformMatrix4fv(gl.getUniformLocation(orbit, "u_viewProjection"), false, viewProjection);
    gl.uniform3f(gl.getUniformLocation(orbit, "u_color"), 1, 0.98, 0.72);
    const orbitAlpha = gl.getUniformLocation(orbit, "u_alpha");
    const orbitPos = gl.getAttribLocation(orbit, "a_position");
    for (const [index, orbit] of orbitBuffers.entries()) {
      gl.bindBuffer(gl.ARRAY_BUFFER, orbit.buffer);
      gl.enableVertexAttribArray(orbitPos);
      gl.vertexAttribPointer(orbitPos, 3, gl.FLOAT, false, 0, 0);
      gl.uniform1f(orbitAlpha, frame.focus === index ? 0.3 : 0.11);
      gl.drawArrays(gl.LINE_LOOP, 0, orbit.count);
    }

    /* 3. Yıldızın halesi — gezegenlerin ARKASINDA kalsın diye önce. */
    // Korona kanvasın kenarında kesilmesin diye ölçülü: sahnenin dışına
    // taşan ışık CSS katmanında (SolarSystem.module.css `.section::before`).
    drawGlow([0, 0, 0], starRadius * 6.2, [1, 0.8, 0.3], 0.62);

    gl.disable(gl.BLEND);
    gl.depthMask(true);

    const distanceTo = (p: Vec3) => Math.hypot(p[0] - eye[0], p[1] - eye[1], p[2] - eye[2]);
    const focalPx = height / (2 * Math.tan(FOV / 2));

    /* 4. Gezegenler. */
    gl.useProgram(planet);
    bindSphere(planet);
    gl.uniformMatrix4fv(gl.getUniformLocation(planet, "u_viewProjection"), false, viewProjection);
    gl.uniform3f(gl.getUniformLocation(planet, "u_eye"), eye[0], eye[1], eye[2]);
    const uModel = gl.getUniformLocation(planet, "u_model");
    const uNormalMatrix = gl.getUniformLocation(planet, "u_normalMatrix");
    const uAtmosphere = gl.getUniformLocation(planet, "u_atmosphere");
    const uNight = gl.getUniformLocation(planet, "u_nightLights");
    const uFocus = gl.getUniformLocation(planet, "u_focus");
    const uRelief = gl.getUniformLocation(planet, "u_relief");
    const uHalftone = gl.getUniformLocation(planet, "u_halftone");
    const uCell = gl.getUniformLocation(planet, "u_cell");
    const uPixelRatio = gl.getUniformLocation(planet, "u_pixelRatio");
    gl.uniform1i(gl.getUniformLocation(planet, "u_albedo"), 0);
    gl.uniform1i(gl.getUniformLocation(planet, "u_height"), 1);

    for (const [index, body] of bodies.entries()) {
      const position = frame.positions[index];
      if (!position) continue;
      const spin = frame.timeSeconds * body.spin;
      gl.uniformMatrix4fv(uModel, false, planetModel(position, body.radius, spin, body.tilt));
      // Küre için normal matrisi = dönüş kısmı; ölçek tekdüze olduğu için
      // ters-devriğe gerek yok.
      gl.uniformMatrix3fv(uNormalMatrix, false, rotationOnly(spin, body.tilt));
      const atmosphere = body.nightLights ? [0.85, 0.15, 0.85] : [1.0, 0.76, 0.3];
      gl.uniform3f(uAtmosphere, atmosphere[0], atmosphere[1], atmosphere[2]);
      gl.uniform1f(uNight, body.nightLights ? 1 : 0);
      gl.uniform1f(uFocus, frame.focus === index ? 1 : 0);
      gl.uniform1f(uRelief, 1);
      // Tram sıklığı gezegenin EKRANDAKİ boyutuna göre: uzaktaki küçük
      // gövdede sık nokta gürültüye dönüşüyor, yakınlaşınca iri nokta
      // istiyoruz. 4.2px → 9px arası.
      const screenRadius = (body.radius / Math.max(0.001, distanceTo(position))) * focalPx;
      gl.uniform1f(uCell, Math.min(9, Math.max(4.2, screenRadius * 0.075)));
      gl.uniform1f(uHalftone, 0.78);
      gl.uniform1f(uPixelRatio, dpr);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, albedoTextures[index]);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, heightTextures[index]);
      gl.drawElements(gl.TRIANGLES, sphere.indices.length, gl.UNSIGNED_SHORT, 0);
    }

    /* 5. Yıldız — kameraya bakan billboard, toplamalı karışım. Derinlik
       testi AÇIK (önünden geçen gezegen kristali örter), yazma kapalı. */
    if (options.starTexture) {
      const media = options.starTexture;
      const ready =
        media instanceof HTMLVideoElement
          ? media.readyState >= 2
          : (media as HTMLImageElement).complete;
      if (ready) {
        gl.bindTexture(gl.TEXTURE_2D, starTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, media);
      }
    }
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.depthMask(false);
    gl.useProgram(star);
    const starCorner = gl.getAttribLocation(star, "a_corner");
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(starCorner);
    gl.vertexAttribPointer(starCorner, 2, gl.FLOAT, false, 0, 0);
    {
      const toEye: Vec3 = [-eye[0], -eye[1], -eye[2]];
      const len = Math.hypot(toEye[0], toEye[1], toEye[2]) || 1;
      const f: Vec3 = [toEye[0] / len, toEye[1] / len, toEye[2] / len];
      const rl = Math.hypot(f[2], f[0]) || 1;
      const right: Vec3 = [f[2] / rl, 0, -f[0] / rl];
      const up: Vec3 = [
        f[1] * right[2] - f[2] * right[1],
        f[2] * right[0] - f[0] * right[2],
        f[0] * right[1] - f[1] * right[0],
      ];
      gl.uniformMatrix4fv(gl.getUniformLocation(star, "u_viewProjection"), false, viewProjection);
      gl.uniform3f(gl.getUniformLocation(star, "u_right"), right[0], right[1], right[2]);
      gl.uniform3f(gl.getUniformLocation(star, "u_up"), up[0], up[1], up[2]);
      gl.uniform1f(gl.getUniformLocation(star, "u_size"), starRadius * 1.9);
      gl.uniform1f(gl.getUniformLocation(star, "u_time"), frame.timeSeconds);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, starTexture);
      gl.uniform1i(gl.getUniformLocation(star, "u_texture"), 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    /* 6. Gezegen halkaları — saydam, gezegenlerden sonra. */
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.depthMask(false);
    gl.useProgram(ring);
    const ringCorner = gl.getAttribLocation(ring, "a_corner");
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(ringCorner);
    gl.vertexAttribPointer(ringCorner, 2, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(gl.getUniformLocation(ring, "u_viewProjection"), false, viewProjection);
    for (const [index, body] of bodies.entries()) {
      if (!body.ring) continue;
      const position = frame.positions[index];
      if (!position) continue;
      const scale = body.radius * body.ring.outer;
      const model = planetModel(position, scale, 0, body.tilt);
      gl.uniformMatrix4fv(gl.getUniformLocation(ring, "u_model"), false, model);
      gl.uniform1f(gl.getUniformLocation(ring, "u_inner"), body.ring.inner / body.ring.outer);
      const color = body.nightLights ? [1, 0.3, 1] : [1, 0.84, 0.42];
      gl.uniform3f(gl.getUniformLocation(ring, "u_color"), color[0], color[1], color[2]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    /* 7. Gezegen parıltıları — odaktakine hafif bir hale. */
    if (frame.focus >= 0 && frame.positions[frame.focus]) {
      const body = bodies[frame.focus];
      drawGlow(
        frame.positions[frame.focus],
        body.radius * 3.4,
        body.nightLights ? [1, 0.25, 1] : [1, 0.78, 0.3],
        0.16,
      );
    }
    gl.depthMask(true);
    gl.disable(gl.BLEND);
  }

  function drawGlow(center: Vec3, size: number, color: number[], intensity: number) {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.useProgram(glow);
    const corner = gl.getAttribLocation(glow, "a_corner");
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(corner);
    gl.vertexAttribPointer(corner, 2, gl.FLOAT, false, 0, 0);
    // Billboard: kameraya bakan iki eksen view matrisinin satırlarından.
    const forward: Vec3 = [
      center[0] - eye[0],
      center[1] - eye[1],
      center[2] - eye[2],
    ];
    const len = Math.hypot(forward[0], forward[1], forward[2]) || 1;
    const f: Vec3 = [forward[0] / len, forward[1] / len, forward[2] / len];
    const right: Vec3 = [f[2], 0, -f[0]];
    const rlen = Math.hypot(right[0], right[1], right[2]) || 1;
    const r: Vec3 = [right[0] / rlen, 0, right[2] / rlen];
    const up: Vec3 = [
      f[1] * r[2] - f[2] * r[1],
      f[2] * r[0] - f[0] * r[2],
      f[0] * r[1] - f[1] * r[0],
    ];
    gl.uniformMatrix4fv(gl.getUniformLocation(glow, "u_viewProjection"), false, viewProjection);
    gl.uniform3f(gl.getUniformLocation(glow, "u_center"), center[0], center[1], center[2]);
    gl.uniform3f(gl.getUniformLocation(glow, "u_right"), r[0], r[1], r[2]);
    gl.uniform3f(gl.getUniformLocation(glow, "u_up"), up[0], up[1], up[2]);
    gl.uniform1f(gl.getUniformLocation(glow, "u_size"), size);
    gl.uniform3f(gl.getUniformLocation(glow, "u_color"), color[0], color[1], color[2]);
    gl.uniform1f(gl.getUniformLocation(glow, "u_intensity"), intensity);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  return {
    resize,
    render,
    project: (point: Vec3) => projectToScreen(viewProjection, point, width, height),
    pick(x, y, positions) {
      let best = -1;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (const [index, position] of positions.entries()) {
        const screen = projectToScreen(viewProjection, position, width, height);
        if (!screen.visible) continue;
        const body = bodies[index];
        // Ekrandaki yarıçap: perspektif bölme sonrası yaklaşık.
        const radiusPx =
          ((body.radius / Math.max(0.001, screen.distance)) * height) / (2 * Math.tan(FOV / 2));
        const d = Math.hypot(screen.x - x, screen.y - y);
        // Dokunma hedefi en az 22px — küçük gezegenler de tıklanabilir olsun.
        if (d < Math.max(22, radiusPx * 1.15) && d < bestDistance) {
          best = index;
          bestDistance = d;
        }
      }
      return best;
    },
    dispose() {
      for (const texture of [...albedoTextures, ...heightTextures, starTexture]) {
        gl.deleteTexture(texture);
      }
      for (const b of [spherePositions, sphereUvs, quad, starsBuffer, starSeedBuffer]) {
        gl.deleteBuffer(b);
      }
      for (const orbit of orbitBuffers) gl.deleteBuffer(orbit.buffer);
      gl.deleteBuffer(sphereIndices);
      for (const program of [planet, star, glowProgram, stars, orbit, ring]) {
        gl.deleteProgram(program);
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

/** Küre için normal matrisi — tekdüze ölçekte yalnız dönüş kısmı yeterli. */
function rotationOnly(spin: number, tilt: number): Float32Array {
  const cs = Math.cos(spin);
  const ss = Math.sin(spin);
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  return new Float32Array([
    ct * cs, st * cs, -ss,
    -st, ct, 0,
    ct * ss, st * ss, cs,
  ]);
}

/** Yörünge çizgisi: 160 parça, elipsin köşeli görünmeyeceği kadar sık. */
function orbitPathPoints(orbit: OrbitalElements): Float32Array {
  return orbitPath(orbit, 160);
}
