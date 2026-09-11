/**
 * MONA parçacık varlığı — saf WebGL sahnesi (Three.js yok).
 *
 * Her nokta tek bir GL_POINT. Organik biçim, akış, açılışta ekran dışından
 * gelme, göz/kalp/halka şekilleri, irkilme, uyku, kaçış, imleç mıknatısı ve
 * konuşma dalgası tamamen vertex shader'da uniform'lardan hesaplanır. Bu
 * sayede iz için FBO gerekmez: geçmiş karelerin uniform durumlarıyla aynı
 * bulut sönük "hayalet" olarak tekrar çizilir. Kurulum/temizlik kalıbı
 * hibrid-wordmark-scene.ts ile aynıdır: WebGL yoksa null döner.
 */

import type { ParticleCloud } from "./mona-dots-geometry";

const VERTEX_SHADER = `
attribute vec3 a_position;
attribute vec4 a_meta;   // faz, boyut, katman, gecikme
attribute vec2 a_start;
attribute vec4 a_eye;    // xyz + bakışı izler mi (iris, gözbebeği)
attribute vec3 a_heart;
attribute vec3 a_ring;

uniform float u_time;
uniform float u_intro;
uniform vec2 u_rotation;
uniform vec2 u_center;
uniform float u_radius;
uniform float u_aspect;
uniform vec2 u_pointer;
uniform float u_pointerStrength;
uniform float u_level;
uniform float u_pointSize;
uniform vec2 u_parallax;
uniform float u_scale;
uniform float u_dim;
uniform float u_flash;
uniform float u_scatter;
uniform vec2 u_scatterOrigin;
uniform vec3 u_shape;    // göz, kalp, halka ağırlıkları
uniform vec2 u_look;
uniform float u_blink;
uniform vec4 u_morph;
uniform float u_ghost;   // 1 ana çizim, <1 iz

varying float v_alpha;
varying float v_glow;
varying float v_core;

// Akıntı alanı: gezen sinüs dalgalarından kurulan bir vektör potansiyelinin
// analitik curl'ü. Diverjanssız olduğu için noktalar sıkışıp dağılmadan,
// birbirine dolanan akıntılar halinde akar. İki oktav, 12 trigonometri.
vec3 swirl(vec3 p, float t) {
  vec3 k1 = vec3(1.7, 2.3, 1.1), k2 = vec3(-2.1, 1.3, 2.7), k3 = vec3(1.2, -1.9, 2.2);
  vec3 c = cos(vec3(dot(k1, p) + t * 0.9, dot(k2, p) + t * 0.7, dot(k3, p) + t * 1.1));
  vec3 flow = vec3(k3.y * c.z - k2.z * c.y, k1.z * c.x - k3.x * c.z, k2.x * c.y - k1.y * c.x);
  vec3 q = p * 2.3 + 11.0;
  vec3 d = cos(vec3(dot(k2, q) - t * 1.3, dot(k3, q) + t * 1.1, dot(k1, q) - t * 0.8));
  flow += 1.15 * vec3(k1.y * d.z - k3.z * d.y, k2.z * d.x - k1.x * d.z, k3.x * d.y - k2.y * d.x);
  return flow;
}

// Farklı frekanslı dalgalar; u_morph fazları rastgele kaydıkça biçim sürekli değişir.
float organic(vec3 d, float t, vec4 m) {
  return sin(d.x * 2.3 + t * 0.35 + m.x) * sin(d.y * 2.9 - t * 0.28 + m.y) * sin(d.z * 2.1 + t * 0.22 + m.z)
       + 0.5 * sin((d.x + d.y) * 4.1 - t * 0.5 + m.w)
       + 0.25 * sin((d.y - d.z) * 7.3 + t * 0.7 + m.x - m.z);
}

vec3 spin(vec3 p, vec2 r) {
  float cy = cos(r.x), sy = sin(r.x), cp = cos(r.y), sp = sin(r.y);
  p = vec3(cy * p.x + sy * p.z, p.y, -sy * p.x + cy * p.z);
  return vec3(p.x, cp * p.y - sp * p.z, sp * p.y + cp * p.z);
}

void main() {
  float phase = a_meta.x;
  float layer = a_meta.z;
  float isShell = 1.0 - step(0.5, layer);
  float isCore = step(0.5, layer) - step(1.5, layer);
  float isHalo = step(1.5, layer) - step(2.5, layer);
  float isDust = step(2.5, layer) - step(3.5, layer);
  float isHaze = step(3.5, layer);
  float isOuter = isHalo + isDust;
  float isBody = isShell + isCore;

  vec3 base = a_position;
  float radius = max(length(base), 0.0001);

  // Hale ve toz kütlenin etrafında daha yavaş, kendi hızında döner.
  base = spin(base, vec2(isOuter * u_time * (0.05 + 0.04 * sin(phase)), 0.0));

  // Akış: kabuk yüzey boyunca kayar, çekirdek hafifçe, hale ve toz serbestçe girdap yapar.
  vec3 flow = swirl(base * 0.9, u_time * 0.35);
  vec3 normal = base / radius;
  vec3 slid = normalize(base + (flow - dot(flow, normal) * normal) * 0.03) * radius;
  base = mix(base + flow * (0.02 * isCore + 0.09 * isOuter), slid, isShell);
  vec3 dir = base / max(length(base), 0.0001);

  float speechWave = 0.5 + 0.5 * sin(dir.y * 7.0 - u_time * 6.5 + phase);
  float swell = isBody * (0.13 * organic(dir, u_time, u_morph) + u_level * (0.05 + 0.1 * speechWave));
  vec3 drift = vec3(sin(u_time * 0.7 + phase), cos(u_time * 0.9 + phase * 1.3), sin(u_time * 0.6 + phase * 0.7))
             * (0.018 + isOuter * 0.04);
  vec3 blob = spin(base * (1.0 + swell) + drift, u_rotation);

  // Şekiller izleyiciye dönük durur. Göz imlece bakar ve kırpar; halka döner.
  vec3 eye = a_eye.xyz;
  eye.xy += u_look * 0.24 * a_eye.w;
  eye.y *= 1.0 - 0.92 * u_blink;
  float ra = u_time * 0.4;
  vec3 ring = vec3(cos(ra) * a_ring.x - sin(ra) * a_ring.y, sin(ra) * a_ring.x + cos(ra) * a_ring.y, a_ring.z);
  ring = vec3(ring.x, 0.9 * ring.y - 0.435 * ring.z, 0.435 * ring.y + 0.9 * ring.z);
  float shapeSum = u_shape.x + u_shape.y + u_shape.z;
  float shapeWeight = shapeSum * isBody;
  vec3 shaped = (eye * u_shape.x + a_heart * u_shape.y + ring * u_shape.z) / max(shapeSum, 0.0001)
              + flow * 0.006 + drift * 0.5;
  vec3 p = mix(blob, shaped, shapeWeight) * u_scale;
  float depth = p.z / max(length(p), 0.0001);

  float perspective = 1.0 / (1.0 - p.z * 0.22);
  vec2 target = u_center + vec2(p.x / u_aspect, p.y) * u_radius * perspective;
  // Parallax: yakın noktalar imlecin tarafına daha çok kayar.
  target += u_parallax * vec2(1.0 / u_aspect, 1.0) * u_radius * (0.06 + 0.08 * p.z);

  // Kaçış: tıklanan yerden uzağa, her nokta kendi yönüyle karışık saçılır.
  vec2 away = (target - u_scatterOrigin) * vec2(u_aspect, 1.0);
  vec2 flee = mix(away / max(length(away), 0.0001), vec2(cos(phase * 3.1), sin(phase * 3.1)), 0.45);
  flee /= max(length(flee), 0.0001);
  target += flee * vec2(1.0 / u_aspect, 1.0) * u_scatter * (0.5 + fract(phase * 5.3) * 1.3);

  // Açılış: ekran dışından kavisli yolla, yavaşlayarak ve kalabalık akıntılar halinde gelir.
  float local = clamp((u_intro - a_meta.w) / 0.7, 0.0, 1.0);
  float eased = 1.0 - pow(1.0 - local, 3.0);
  vec2 flight = target - a_start;
  vec2 bow = vec2(-flight.y, flight.x) * 0.22 * sin(eased * 3.14159) * (fract(phase * 1.7) - 0.5);
  vec2 screen = mix(a_start, target, eased) + bow;
  float inFlight = (1.0 - eased) * step(0.0001, local);

  // Mıknatıs: imlece yakın noktalar ona doğru çekilir ve etrafında hafifçe döner.
  vec2 toPointer = (u_pointer - screen) * vec2(u_aspect, 1.0);
  float pull = u_pointerStrength * (1.0 - smoothstep(0.0, 0.45, length(toPointer)));
  vec2 swirled = vec2(-toPointer.y, toPointer.x) * 0.14 * sin(u_time * 1.7 + phase);
  screen += (toPointer * 0.55 + swirled) * pull / vec2(u_aspect, 1.0);

  gl_Position = vec4(screen, 0.0, 1.0);

  // Kütlede zamanla kayan delikler ve parlayan dalgalı kenar; şekillerde kapalı.
  float bodyOnly = isBody * (1.0 - shapeWeight);
  float holes = mix(1.0, smoothstep(-0.35, -0.05, organic(dir * 1.7 + 3.1, u_time * 0.6, u_morph.wzyx)), bodyOnly);
  float facing = 0.5 + 0.5 * depth;
  float rim = pow(1.0 - abs(depth), 3.0) * (1.0 - shapeWeight);
  float twinkle = 0.55 + 0.45 * sin(u_time * (1.5 + fract(phase * 7.0) * 2.5) + phase * 5.0);
  float alpha = isShell * (0.2 + 0.5 * facing + 0.65 * rim)
              + isCore * (0.3 + 0.35 * facing)
              + isHalo * 0.35 * twinkle
              + isDust * 0.2 * twinkle
              + isHaze * 0.045
              + shapeWeight * 0.25
              + inFlight * 0.45 * (1.0 - isHaze);
  v_alpha = alpha * holes * smoothstep(0.0, 0.08, local) * u_dim * u_ghost;

  // Işıma: büyük, çekilen, konuşan, irkilen ve uçan noktalar yumuşak bir hale alır.
  // İz çizimlerinde hale yok; aura noktaları her zaman yalnızca yumuşak lekedir.
  float isGhost = step(u_ghost, 0.99);
  float glow = clamp((a_meta.y - 1.4) / 1.6, 0.0, 1.0) * 0.9 + pull * 0.8
             + isBody * u_level * speechWave * 0.6 + isShell * rim * 0.35
             + u_flash * 0.6 + inFlight * 0.4;
  v_glow = mix(min(1.3, glow) * (1.0 - isGhost), 1.0, isHaze);
  float spread = mix(1.0 + v_glow * 3.0, 1.0, isHaze);
  v_core = mix(1.0 / spread, 0.02, isHaze);
  gl_PointSize = u_pointSize * a_meta.y * mix(1.0, 0.7, isOuter) * mix(0.6, 1.1, facing) * spread
               * mix(1.0, 0.85, isGhost) * (1.0 + 0.5 * inFlight);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
uniform vec3 u_color;
varying float v_alpha;
varying float v_glow;
varying float v_core;

void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  if (r > 1.0) discard;
  float core = 1.0 - smoothstep(v_core * 0.35, v_core, r);
  float halo = exp(-r * r * 5.0) * v_glow * 0.75;
  vec3 color = mix(u_color, vec3(1.0), clamp(v_glow * 0.25, 0.0, 0.4) * core);
  gl_FragColor = vec4(color * (core + halo) * v_alpha, 1.0);
}
`;

export type Rgb = [number, number, number];

export interface MonaDotsLayout {
  /** Kütlenin merkezi, canvas genişliği/yüksekliğine oranla (0..1). */
  centerX: number;
  centerY: number;
  /** Yarıçap, CSS pikseli. */
  radius: number;
}

export interface MonaDotsFrame {
  time: number;
  /** Açılış ilerlemesi 0..1 — 1'de tüm noktalar yerinde. */
  intro: number;
  yaw: number;
  pitch: number;
  /** İmleç, canvas'a oranla (0..1, üst-sol orijin). */
  pointerX: number;
  pointerY: number;
  pointerStrength: number;
  /** Konuşma seviyesi 0..1. */
  level: number;
  /** İmlecin sahne merkezine göre konumu (-0.5..0.5); imleç yoksa 0. */
  parallaxX: number;
  parallaxY: number;
  scale: number;
  dim: number;
  flash: number;
  scatter: number;
  /** Kaçışın kökeni, canvas'a oranla (0..1). */
  scatterOriginX: number;
  scatterOriginY: number;
  shapeEye: number;
  shapeHeart: number;
  shapeRing: number;
  /** Gözbebeğinin bakış yönü (-1..1). */
  lookX: number;
  lookY: number;
  blink: number;
  morph: readonly [number, number, number, number];
}

export const NEUTRAL_FRAME: MonaDotsFrame = {
  time: 0, intro: 1, yaw: 0.6, pitch: 0.28, pointerX: 0.5, pointerY: 0.5, pointerStrength: 0,
  level: 0, parallaxX: 0, parallaxY: 0, scale: 1, dim: 1, flash: 0, scatter: 0,
  scatterOriginX: 0.5, scatterOriginY: 0.5, shapeEye: 0, shapeHeart: 0, shapeRing: 0,
  lookX: 0, lookY: 0, blink: 0, morph: [0, 0, 0, 0],
};

export interface MonaDotsGhost {
  frame: MonaDotsFrame;
  alpha: number;
}

export interface MonaDotsScene {
  resize: () => void;
  /** Önce izleri (eski kareler), sonra ana kareyi çizer. */
  render: (frame: MonaDotsFrame, ghosts?: readonly MonaDotsGhost[]) => void;
  dispose: () => void;
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("MONA dots shader failed:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** Masaüstünde kütle konuşma kolonunun sağında, dar ekranda üst yarıda. */
export function monaDotsLayout(width: number, height: number): MonaDotsLayout {
  if (width <= 1024) {
    // Başlığın altında kalacak kadar aşağıda; organik şişme payı bırakır.
    return { centerX: 0.5, centerY: 0.27, radius: Math.min(width * 0.297, height * 0.153) };
  }
  return { centerX: 0.64, centerY: 0.5, radius: Math.min(height * 0.324, width * 0.216) };
}

const UNIFORMS = [
  "u_time", "u_intro", "u_rotation", "u_center", "u_radius", "u_aspect", "u_pointer",
  "u_pointerStrength", "u_level", "u_pointSize", "u_parallax", "u_scale", "u_dim", "u_flash",
  "u_scatter", "u_scatterOrigin", "u_shape", "u_look", "u_blink", "u_morph", "u_ghost", "u_color",
] as const;

export function createMonaDotsScene(
  canvas: HTMLCanvasElement,
  cloud: ParticleCloud,
  colors: { dot: Rgb; background: Rgb },
): MonaDotsScene | null {
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: true,
    premultipliedAlpha: false,
  }) as WebGLRenderingContext | null;
  if (!gl) return null;

  const vertexShader = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("MONA dots program link failed:", gl.getProgramInfoLog(program));
    return null;
  }
  gl.useProgram(program);

  const buffers = ([
    ["a_position", cloud.positions, 3],
    ["a_meta", cloud.meta, 4],
    ["a_start", cloud.starts, 2],
    ["a_eye", cloud.eye, 4],
    ["a_heart", cloud.heart, 3],
    ["a_ring", cloud.ring, 3],
  ] as const).map(([name, data, size]) => {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const location = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    return buffer;
  });

  const u = Object.fromEntries(UNIFORMS.map(name => [name, gl.getUniformLocation(program, name)])) as
    Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>;
  gl.uniform3fv(u.u_color, new Float32Array(colors.dot));

  // Siyah zemin üzerinde toplamalı karışım: üst üste binen noktalar parlar.
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE);

  let dpr = 1;
  let narrow = false;
  let layout = monaDotsLayout(1, 1);
  const bodyCount = cloud.count - cloud.hazeCount;

  const resize = () => {
    narrow = window.innerWidth <= 640;
    dpr = Math.min(window.devicePixelRatio || 1, narrow ? 1.5 : 2);
    const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    layout = monaDotsLayout(canvas.clientWidth, canvas.clientHeight);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();

  const apply = (frame: MonaDotsFrame, ghost: number) => {
    const cssWidth = Math.max(1, canvas.clientWidth);
    const cssHeight = Math.max(1, canvas.clientHeight);
    gl.uniform1f(u.u_time, frame.time);
    gl.uniform1f(u.u_intro, frame.intro);
    gl.uniform2f(u.u_rotation, frame.yaw, frame.pitch);
    gl.uniform2f(u.u_center, layout.centerX * 2 - 1, 1 - layout.centerY * 2);
    gl.uniform1f(u.u_radius, (layout.radius * 2) / cssHeight);
    gl.uniform1f(u.u_aspect, cssWidth / cssHeight);
    gl.uniform2f(u.u_pointer, frame.pointerX * 2 - 1, 1 - frame.pointerY * 2);
    gl.uniform1f(u.u_pointerStrength, frame.pointerStrength);
    gl.uniform1f(u.u_level, frame.level);
    gl.uniform1f(u.u_pointSize, Math.max(1.6, layout.radius / 150) * dpr);
    gl.uniform2f(u.u_parallax, frame.parallaxX, -frame.parallaxY);
    gl.uniform1f(u.u_scale, frame.scale);
    gl.uniform1f(u.u_dim, frame.dim);
    gl.uniform1f(u.u_flash, frame.flash);
    gl.uniform1f(u.u_scatter, frame.scatter);
    gl.uniform2f(u.u_scatterOrigin, frame.scatterOriginX * 2 - 1, 1 - frame.scatterOriginY * 2);
    gl.uniform3f(u.u_shape, frame.shapeEye, frame.shapeHeart, frame.shapeRing);
    gl.uniform2f(u.u_look, frame.lookX, -frame.lookY);
    gl.uniform1f(u.u_blink, frame.blink);
    gl.uniform4f(u.u_morph, frame.morph[0], frame.morph[1], frame.morph[2], frame.morph[3]);
    gl.uniform1f(u.u_ghost, ghost);
  };

  return {
    resize,
    render(frame, ghosts = []) {
      const [r, g, b] = colors.background;
      gl.clearColor(r, g, b, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      // İzler aurasız çizilir; dar ekranda aura da atlanır (doldurma maliyeti).
      for (const ghost of ghosts) {
        apply(ghost.frame, ghost.alpha);
        gl.drawArrays(gl.POINTS, 0, bodyCount);
      }
      apply(frame, 1);
      gl.drawArrays(gl.POINTS, 0, narrow ? bodyCount : cloud.count);
    },
    dispose() {
      buffers.forEach(buffer => gl.deleteBuffer(buffer));
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
