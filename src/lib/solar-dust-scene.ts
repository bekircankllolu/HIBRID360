/**
 * Ekosistem sahnesi — parçacık sürümü.
 *
 * 19 Eylül 2026'da dokulu gezegen sahnesinin (`solar-scene.ts`) yerine
 * geçti. Kullanıcı: *"Üzerinde bir half tone efekt var ama bunu biraz
 * daha profesyonel bir hale getirmemiz lazım... şu an hâlâ biraz amatör
 * duruyor... Ortada hibrit taşı dönmeye devam etsin, etrafında
 * noktacıklardan oluşan bir ekosistem... sanki Mona'nın noktacıkları bu
 * hibrit taşının etrafını sarmış gibi. 8 tane nokta daha belirgin
 * şekilde büyük, hepsi sarı, birbirine ince çizgilerle bağlı."*
 *
 * ## Neden dokulu gezegenler bırakıldı
 * Sekiz prosedürel doku (albedo + yükseklik, ~300 KB) ve half-tone
 * gölgelendirici, gerçek bir gezegeni TAKLİT etmeye çalışıp yarı yolda
 * kalıyordu — "amatör" hissi oradan geliyordu. Parçacık dili ise
 * sitenin KENDİ dili: MONA da, Works hero'sundaki nöron ağı da aynı
 * noktalardan kurulu. Taklit yok, üslup var. Yan fayda: doku indirmesi
 * tamamen kalktı.
 *
 * ## Korunan her şey
 * Arayüz (`SolarScene`) birebir aynı, dolayısıyla Kepler yörüngeleri,
 * kamera yaklaşması, etiket yerleşimi, detay paneli, klavye erişimi ve
 * e2e sözleşmesi DEĞİŞMEDİ. Değişen yalnız çizim.
 */

import {
  cameraEye,
  lookAt,
  multiply,
  perspective,
  projectToScreen,
  type CameraState,
  type Mat4,
  type ScreenPoint,
  type Vec3,
} from "./solar-orbits";
import {
  buildDust,
  buildNodeCluster,
  buildWeb,
  clusterState,
  type Particle,
} from "./solar-dust";

export interface DustFrame {
  timeSeconds: number;
  camera: CameraState;
  /** Odaklanılan düğüm (-1: yok). */
  focus: number;
  /** Düğüm konumları (solar-orbits.orbitPosition ile hesaplanmış). */
  positions: Vec3[];
}

export interface DustScene {
  resize(): void;
  render(frame: DustFrame): void;
  project(point: Vec3): ScreenPoint;
  pick(x: number, y: number, positions: Vec3[]): number;
  dispose(): void;
}

const FOV = Math.PI / 4;

/** Toz parçacığı sayısı — "çok fazla iş var" hissini veren yoğunluk. */
const DUST_COUNT = 4400;

/**
 * Düğüm kümesi başına parçacık.
 *
 * 190'dan yükseltildi: kamera odaklanınca yaklaşıyor ve az sayıda iri
 * parçacık birbirine karışıp DÜZ SARI BİR LEKEYE dönüşüyordu (ölçüldü,
 * ekran görüntüsüyle). Çok sayıda küçük parçacık yakında da taneli
 * kalıyor — kullanıcının istediği "sıkı formda bir Mona" bu.
 */
const CLUSTER_COUNT = 360;

/* ------------------------------------------------------------ gölgeler */

/**
 * Tek bir parçacık programı hem tozu hem düğüm kümelerini çiziyor.
 * `a_size` piksel cinsinden taban boyut; gerçek boyut kameraya uzaklıkla
 * ölçekleniyor, yani yakındaki parçacık iri.
 */
const POINT_VS = `
attribute vec3 a_position;
attribute float a_size;
attribute float a_alpha;
uniform mat4 u_viewProjection;
uniform float u_pixelRatio;
uniform float u_sizeScale;
uniform float u_alphaScale;
varying float v_alpha;
void main() {
  vec4 clip = u_viewProjection * vec4(a_position, 1.0);
  gl_Position = clip;
  // clip.w = kameraya uzaklık; boyut onunla ters orantılı (perspektif).
  float distance = max(clip.w, 0.001);
  // ÜST SINIR 64 DEĞİL 20: kamera bir düğüme yaklaşınca 1/mesafe ölçeği
  // parçacıkları devleştiriyor ve küme tek bir dolu lekeye dönüşüyordu.
  gl_PointSize = clamp(a_size * u_sizeScale * u_pixelRatio * 22.0 / distance, 1.0, 20.0);
  v_alpha = a_alpha * u_alphaScale;
}
`;

const POINT_FS = `
precision mediump float;
uniform vec3 u_color;
varying float v_alpha;
void main() {
  // Noktayı yuvarlak ve merkezden dışa sönen yap: kare piksel yok.
  vec2 offset = gl_PointCoord - vec2(0.5);
  float d = length(offset) * 2.0;
  if (d > 1.0) discard;
  float falloff = pow(1.0 - d, 1.9);
  gl_FragColor = vec4(u_color * falloff, falloff * v_alpha);
}
`;

/** Düğümleri birbirine bağlayan ince çizgiler ve yörünge halkaları. */
const LINE_VS = `
attribute vec3 a_position;
uniform mat4 u_viewProjection;
void main() {
  gl_Position = u_viewProjection * vec4(a_position, 1.0);
}
`;

const LINE_FS = `
precision mediump float;
uniform vec3 u_color;
uniform float u_alpha;
void main() {
  gl_FragColor = vec4(u_color * u_alpha, u_alpha);
}
`;

/** Merkezdeki kristal: kameraya dönük bir dörtgen (billboard). */
const CRYSTAL_VS = `
attribute vec2 a_corner;
uniform mat4 u_viewProjection;
uniform vec3 u_right;
uniform vec3 u_up;
uniform float u_radius;
varying vec2 v_uv;
void main() {
  vec3 world = u_right * (a_corner.x * u_radius) + u_up * (a_corner.y * u_radius);
  v_uv = a_corner * 0.5 + 0.5;
  gl_Position = u_viewProjection * vec4(world, 1.0);
}
`;

const CRYSTAL_FS = `
precision mediump float;
uniform sampler2D u_texture;
uniform float u_hasTexture;
uniform float u_spin;
uniform float u_fade;
varying vec2 v_uv;
void main() {
  vec2 uv = v_uv;
  // Kaynak kare kadrajın ortasında duruyor; hafif döndürme taşın
  // dönmeye devam ettiği hissini veriyor (kullanıcı: "ortada hibrit taşı
  // dönmeye devam etsin").
  vec2 centred = uv - 0.5;
  float c = cos(u_spin);
  float s = sin(u_spin);
  uv = vec2(centred.x * c - centred.y * s, centred.x * s + centred.y * c) + 0.5;

  vec3 colour = vec3(1.0, 0.86, 0.1);
  if (u_hasTexture > 0.5) {
    colour = texture2D(u_texture, uv).rgb;
  }
  // Kenarda yumuşak sönüm: dörtgenin köşeleri görünmesin.
  float d = length(v_uv - 0.5) * 2.0;
  float mask = smoothstep(1.0, 0.25, d) * u_fade;
  gl_FragColor = vec4(colour * mask, mask);
}
`;

/* ----------------------------------------------------------- yardımcılar */

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function link(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertex || !fragment) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function buffer(gl: WebGLRenderingContext, data: Float32Array, usage: number = gl.STATIC_DRAW) {
  const id = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, id);
  gl.bufferData(gl.ARRAY_BUFFER, data, usage);
  return id;
}

const BRAND_YELLOW: Vec3 = [1, 0.988, 0];

export function createDustScene(options: {
  canvas: HTMLCanvasElement;
  bodyCount: number;
  crystalTexture?: HTMLVideoElement | HTMLImageElement | null;
  crystalRadius: number;
  orbitPaths: Float32Array[];
}): DustScene | null {
  const { canvas, bodyCount, crystalRadius, orbitPaths } = options;
  const context = canvas.getContext("webgl", {
    alpha: false,
    antialias: true,
    // Derinlik testi YOK: her şey toplamalı karışımla çiziliyor, sıraya
    // değil parlaklığa göre üst üste biniyor. Derinlik açık olsaydı
    // parçacıklar birbirini keser ve bulut delik deşik görünürdü.
    depth: false,
    powerPreference: "low-power",
    preserveDrawingBuffer: false,
  }) as WebGLRenderingContext | null;
  if (!context) return null;
  const gl = context;

  const pointProgram = link(gl, POINT_VS, POINT_FS);
  const lineProgram = link(gl, LINE_VS, LINE_FS);
  const crystalProgram = link(gl, CRYSTAL_VS, CRYSTAL_FS);
  if (!pointProgram || !lineProgram || !crystalProgram) return null;
  const points = pointProgram;
  const lines = lineProgram;
  const crystal = crystalProgram;

  /* --- toz --- */
  /*
   * İç yarıçap kristalin hemen dışında (×1.15): kullanıcının istediği
   * "Mona'nın noktacıkları bu hibrit taşının etrafını sarmış gibi"
   * hissi, bulut taşa DEĞDİĞİNDE oluşuyor. ×1.9'da taş ile bulut
   * arasında boş bir halka kalıyordu ve ikisi ayrı iki nesne gibi
   * duruyordu.
   */
  const dust = buildDust({
    count: DUST_COUNT,
    innerRadius: crystalRadius * 1.15,
    outerRadius: 8.2,
    seed: 20260919,
  });
  const dustPositions = new Float32Array(dust.length * 3);
  const dustSizes = new Float32Array(dust.length);
  const dustAlphas = new Float32Array(dust.length);
  for (const [i, p] of dust.entries()) {
    dustPositions.set(p.position, i * 3);
    dustSizes[i] = p.size;
    dustAlphas[i] = p.alpha;
  }
  const dustPositionBuffer = buffer(gl, dustPositions);
  const dustSizeBuffer = buffer(gl, dustSizes);
  const dustAlphaBuffer = buffer(gl, dustAlphas);

  /* --- düğüm kümeleri --- */
  const clusters: Particle[][] = [];
  for (let i = 0; i < bodyCount; i += 1) {
    clusters.push(buildNodeCluster({ count: CLUSTER_COUNT, radius: 0.3, seed: 101 + i * 17 }));
  }
  // Tek bir yazılabilir tampon: her düğüm için konumlar yeniden
  // dolduruluyor (kümeler yörüngeyle birlikte taşınıyor).
  const clusterScratch = new Float32Array(CLUSTER_COUNT * 3);
  const clusterSizes = new Float32Array(CLUSTER_COUNT);
  const clusterAlphas = new Float32Array(CLUSTER_COUNT);
  for (let i = 0; i < CLUSTER_COUNT; i += 1) {
    clusterSizes[i] = clusters[0][i].size;
    clusterAlphas[i] = clusters[0][i].alpha;
  }
  const clusterPositionBuffer = buffer(gl, clusterScratch, gl.DYNAMIC_DRAW);
  const clusterSizeBuffer = buffer(gl, clusterSizes);
  const clusterAlphaBuffer = buffer(gl, clusterAlphas);

  /* --- ağ çizgileri --- */
  const web = buildWeb(bodyCount);
  const webScratch = new Float32Array(web.length * 6);
  const webBuffer = buffer(gl, webScratch, gl.DYNAMIC_DRAW);

  /* --- yörünge halkaları --- */
  const orbitBuffers = orbitPaths.map((path) => ({
    id: buffer(gl, path),
    count: path.length / 3,
  }));

  /* --- kristal --- */
  const crystalCorners = buffer(
    gl,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
  );
  let crystalTexture: WebGLTexture | null = null;
  if (options.crystalTexture) {
    crystalTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, crystalTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([255, 220, 40, 255]),
    );
  }

  let viewProjection: Mat4 = perspective(FOV, 1, 0.1, 100);
  let pixelRatio = 1;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * pixelRatio));
    const height = Math.max(1, Math.round(rect.height * pixelRatio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
  };

  const bindAttribute = (
    program: WebGLProgram,
    name: string,
    id: WebGLBuffer | null,
    size: number,
  ) => {
    const location = gl.getAttribLocation(program, name);
    if (location < 0) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, id);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
  };

  const drawLines = (id: WebGLBuffer | null, count: number, alpha: number, mode: number) => {
    gl.useProgram(lines);
    gl.uniformMatrix4fv(gl.getUniformLocation(lines, "u_viewProjection"), false, viewProjection);
    gl.uniform3fv(gl.getUniformLocation(lines, "u_color"), new Float32Array(BRAND_YELLOW));
    gl.uniform1f(gl.getUniformLocation(lines, "u_alpha"), alpha);
    bindAttribute(lines, "a_position", id, 3);
    gl.drawArrays(mode, 0, count);
  };

  const render = (frame: DustFrame) => {
    const rect = canvas.getBoundingClientRect();
    const aspect = Math.max(0.1, rect.width / Math.max(1, rect.height));
    const eye = cameraEye(frame.camera);
    viewProjection = multiply(
      perspective(FOV, aspect, 0.1, 100),
      lookAt(eye, frame.camera.target),
    );

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    // Toplamalı karışım: üst üste binen parçacıklar birikerek parlıyor.
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    // 1. Yörünge halkaları — en arkada, çok sönük.
    for (const orbit of orbitBuffers) {
      drawLines(orbit.id, orbit.count, frame.focus >= 0 ? 0.05 : 0.1, gl.LINE_LOOP);
    }

    // 2. Sekiz düğümü bağlayan ağ. Odak varken geri çekiliyor.
    for (const [index, [a, b]] of web.entries()) {
      const from = frame.positions[a];
      const to = frame.positions[b];
      if (!from || !to) continue;
      webScratch.set(from, index * 6);
      webScratch.set(to, index * 6 + 3);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, webBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, webScratch);
    drawLines(webBuffer, web.length * 2, frame.focus >= 0 ? 0.12 : 0.26, gl.LINES);

    // 3. Toz bulutu. Yavaşça dönüyor — sahne hiç durmuyor.
    gl.useProgram(points);
    const spin = frame.timeSeconds * 0.035;
    const spinCos = Math.cos(spin);
    const spinSin = Math.sin(spin);
    // Dönüşü görünüm matrisine katmak, her parçacığı CPU'da döndürmekten
    // ucuz: tek bir matris çarpımı.
    const spinMatrix = new Float32Array([
      spinCos, 0, -spinSin, 0,
      0, 1, 0, 0,
      spinSin, 0, spinCos, 0,
      0, 0, 0, 1,
    ]);
    gl.uniformMatrix4fv(
      gl.getUniformLocation(points, "u_viewProjection"),
      false,
      multiply(viewProjection, spinMatrix),
    );
    gl.uniform1f(gl.getUniformLocation(points, "u_pixelRatio"), pixelRatio);
    gl.uniform1f(gl.getUniformLocation(points, "u_sizeScale"), 1);
    gl.uniform1f(gl.getUniformLocation(points, "u_alphaScale"), frame.focus >= 0 ? 0.55 : 1.35);
    gl.uniform3fv(gl.getUniformLocation(points, "u_color"), new Float32Array(BRAND_YELLOW));
    bindAttribute(points, "a_position", dustPositionBuffer, 3);
    bindAttribute(points, "a_size", dustSizeBuffer, 1);
    bindAttribute(points, "a_alpha", dustAlphaBuffer, 1);
    gl.drawArrays(gl.POINTS, 0, dust.length);

    // 4. Düğüm kümeleri — dönmüyorlar, yörünge konumlarında duruyorlar.
    gl.uniformMatrix4fv(
      gl.getUniformLocation(points, "u_viewProjection"),
      false,
      viewProjection,
    );
    const breathe = Math.sin(frame.timeSeconds * 0.8);
    for (let index = 0; index < clusters.length; index += 1) {
      const centre = frame.positions[index];
      if (!centre) continue;
      const { tightness, glow } = clusterState(frame.focus, index, breathe);
      const cluster = clusters[index];
      for (let i = 0; i < cluster.length; i += 1) {
        const p = cluster[i].position;
        clusterScratch[i * 3] = centre[0] + p[0] * tightness;
        clusterScratch[i * 3 + 1] = centre[1] + p[1] * tightness;
        clusterScratch[i * 3 + 2] = centre[2] + p[2] * tightness;
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, clusterPositionBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, clusterScratch);
      gl.uniform1f(gl.getUniformLocation(points, "u_alphaScale"), glow);
      gl.uniform1f(gl.getUniformLocation(points, "u_sizeScale"), frame.focus === index ? 1.35 : 1);
      bindAttribute(points, "a_position", clusterPositionBuffer, 3);
      bindAttribute(points, "a_size", clusterSizeBuffer, 1);
      bindAttribute(points, "a_alpha", clusterAlphaBuffer, 1);
      gl.drawArrays(gl.POINTS, 0, cluster.length);
    }

    // 5. Merkezdeki kristal — en son, en parlak.
    gl.useProgram(crystal);
    if (crystalTexture && options.crystalTexture) {
      const media = options.crystalTexture;
      const ready =
        media instanceof HTMLVideoElement
          ? media.readyState >= 2
          : (media as HTMLImageElement).complete;
      if (ready) {
        gl.bindTexture(gl.TEXTURE_2D, crystalTexture);
        try {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, media);
        } catch {
          // Kare henüz çözülmediyse bir önceki doku kullanılmaya devam
          // eder; sahne durmaz.
        }
      }
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, crystalTexture);
      gl.uniform1i(gl.getUniformLocation(crystal, "u_texture"), 0);
    }
    gl.uniform1f(gl.getUniformLocation(crystal, "u_hasTexture"), crystalTexture ? 1 : 0);
    gl.uniform1f(gl.getUniformLocation(crystal, "u_spin"), frame.timeSeconds * 0.16);
    /*
     * Odak varken taş GERİ ÇEKİLİYOR. Kamera bir düğüme yaklaştığında taş
     * merkezde kalıyor ve yakın mesafede kadrajı kaplayıp asıl konuyu —
     * seçilen hizmetin kümesini — gölgeliyordu (ölçüldü, ekran
     * görüntüsüyle). Tamamen kaybolmuyor: ekosistemin merkezi olduğu
     * okunmaya devam ediyor.
     */
    gl.uniform1f(gl.getUniformLocation(crystal, "u_fade"), frame.focus >= 0 ? 0.3 : 1);
    gl.uniformMatrix4fv(
      gl.getUniformLocation(crystal, "u_viewProjection"),
      false,
      viewProjection,
    );
    // Billboard eksenleri: kameraya bakan düzlem.
    const forward = [-eye[0], -eye[1], -eye[2]] as Vec3;
    const length = Math.hypot(forward[0], forward[1], forward[2]) || 1;
    const f: Vec3 = [forward[0] / length, forward[1] / length, forward[2] / length];
    const right: Vec3 = [f[2], 0, -f[0]];
    const rightLength = Math.hypot(right[0], right[1], right[2]) || 1;
    const r: Vec3 = [right[0] / rightLength, 0, right[2] / rightLength];
    const up: Vec3 = [
      r[1] * f[2] - r[2] * f[1],
      r[2] * f[0] - r[0] * f[2],
      r[0] * f[1] - r[1] * f[0],
    ];
    gl.uniform3fv(gl.getUniformLocation(crystal, "u_right"), new Float32Array(r));
    gl.uniform3fv(gl.getUniformLocation(crystal, "u_up"), new Float32Array(up));
    gl.uniform1f(gl.getUniformLocation(crystal, "u_radius"), crystalRadius * 1.5);
    bindAttribute(crystal, "a_corner", crystalCorners, 2);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  const project = (point: Vec3): ScreenPoint => {
    const rect = canvas.getBoundingClientRect();
    return projectToScreen(viewProjection, point, rect.width, rect.height);
  };

  const pick = (x: number, y: number, positions: Vec3[]) => {
    let best = -1;
    let bestDistance = 46;
    for (const [index, position] of positions.entries()) {
      const screen = project(position);
      if (!screen.visible) continue;
      const d = Math.hypot(screen.x - x, screen.y - y);
      if (d < bestDistance) {
        bestDistance = d;
        best = index;
      }
    }
    return best;
  };

  const dispose = () => {
    gl.deleteBuffer(dustPositionBuffer);
    gl.deleteBuffer(dustSizeBuffer);
    gl.deleteBuffer(dustAlphaBuffer);
    gl.deleteBuffer(clusterPositionBuffer);
    gl.deleteBuffer(clusterSizeBuffer);
    gl.deleteBuffer(clusterAlphaBuffer);
    gl.deleteBuffer(webBuffer);
    gl.deleteBuffer(crystalCorners);
    for (const orbit of orbitBuffers) gl.deleteBuffer(orbit.id);
    if (crystalTexture) gl.deleteTexture(crystalTexture);
    gl.deleteProgram(points);
    gl.deleteProgram(lines);
    gl.deleteProgram(crystal);
  };

  resize();
  return { resize, render, project, pick, dispose };
}
