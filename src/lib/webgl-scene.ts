import { readBrandColor, type Rgb } from "@/lib/brand-colors";
import { orbitStones } from "@/data/solar-system";

/**
 * Güneş sistemi sahnesi — native WebGL, kütüphane yok.
 *
 * CLAUDE.md performans kuralı: "aynı anda en fazla BİR WebGL sahnesi
 * çalışır; ekrandan çıkınca durur." Bu modül global bir kilit tutar —
 * ikinci bir sahne açılmaya çalışırsa başlatılmaz. Animasyon döngüsü
 * yalnızca sahne görünürken çalışır (bkz. SolarSystem bileşeni).
 *
 * Kütüphane yerine native WebGL tercih edildi: Three.js ilk yükleme
 * bütçesine (<2MB, pratikte çok daha azı hedefleniyor) ~150KB ekliyordu.
 * Sahne yalnızca merkez (güneş) ışıması + yörünge halkalarını çiziyor;
 * taşların kendisi artık gerçek görsel varlık (public/images/stones/,
 * brief 4.5'in AI ile üretilmiş sarı ve fuşya varyantı) — bkz.
 * src/components/hero/SolarSystem.tsx, HTML katmanında <img> olarak
 * render ediliyor ve konumu bu dosyadaki stoneScreenPosition ile
 * senkron. Görüntüler WebGL dokusu değil, gerçek <img>: ekran
 * okuyucuya erişilebilir kalması ve ayrı ayrı lazy-load edilebilmesi
 * için.
 */

let sceneLockHolder: symbol | null = null;

export function acquireSceneLock(holder: symbol): boolean {
  if (sceneLockHolder && sceneLockHolder !== holder) return false;
  sceneLockHolder = holder;
  return true;
}

export function releaseSceneLock(holder: symbol): void {
  if (sceneLockHolder === holder) sceneLockHolder = null;
}

const VERTEX_SHADER = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const ORBIT_COUNT = orbitStones.length;

const FRAGMENT_SHADER = `
precision mediump float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uFuchsia;
uniform vec3 uYellow;
uniform vec2 uPointer;

const int ORBIT_COUNT = ${ORBIT_COUNT};

// Yörünge yarıçapı — merkezden dışa doğru eşit aralıklı.
float orbitRadius(int index) {
  return 0.16 + float(index) * 0.085;
}

// Her yörünge farklı hızda döner; dıştaki yavaş (güneş sistemi mantığı).
float orbitAngle(int index, float time) {
  float speed = 0.32 / (1.0 + float(index) * 0.42);
  return time * speed + float(index) * 0.9;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / min(uResolution.x, uResolution.y);
  float dist = length(uv);

  vec3 color = vec3(0.0);

  // Merkez: HİBRİD güneşi. Fuşya çekirdek, sarı hale.
  float sun = smoothstep(0.13, 0.0, dist);
  float corona = smoothstep(0.30, 0.10, dist);
  color += uFuchsia * sun * 0.9;
  color += uYellow * corona * 0.16;

  for (int i = 0; i < ORBIT_COUNT; i++) {
    float r = orbitRadius(i);

    // Yörünge halkası — ince, düşük opaklık.
    float ring = smoothstep(0.004, 0.0, abs(dist - r));
    color += uYellow * ring * 0.12;

    // Taşın konumunda hafif bir zemin ışıması — gerçek görsel (HTML <img>)
    // bu koordinatın üstüne bindiriliyor, bu ışıma ona bir "oturma" hissi
    // veriyor. uPointer, imleç yaklaşınca ışımayı güçlendirir (brief 4.1
    // "elastik fare tepkisi"nin güneş sistemindeki karşılığı).
    float angle = orbitAngle(i, uTime);
    vec2 stone = vec2(cos(angle), sin(angle) * 0.42) * r;
    float d = length(uv - stone);
    float pointerBoost = 1.0 - smoothstep(0.0, 0.35, length(uPointer - stone));
    float glow = smoothstep(0.09, 0.0, d);
    vec3 stoneColor = mix(uYellow, uFuchsia, float(i) / float(ORBIT_COUNT));
    color += stoneColor * glow * (0.10 + pointerBoost * 0.22);
  }

  gl_FragColor = vec4(color, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile failed:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export interface SceneHandle {
  /** Tek kare çizer — prefers-reduced-motion için (animasyon yok). */
  renderFrame: (timeSeconds: number) => void;
  setPointer: (x: number, y: number) => void;
  resize: () => void;
  dispose: () => void;
}

/**
 * Sahneyi kurar. WebGL desteklenmiyorsa null döner — çağıran taraf
 * erişilebilir HTML yedeğini gösterir.
 */
export function createSolarSystemScene(canvas: HTMLCanvasElement): SceneHandle | null {
  const gl =
    (canvas.getContext("webgl", { antialias: true, alpha: false }) as
      | WebGLRenderingContext
      | null) ?? null;
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
    console.error("Program link failed:", gl.getProgramInfoLog(program));
    return null;
  }
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  const positionLocation = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const uResolution = gl.getUniformLocation(program, "uResolution");
  const uTime = gl.getUniformLocation(program, "uTime");
  const uFuchsia = gl.getUniformLocation(program, "uFuchsia");
  const uYellow = gl.getUniformLocation(program, "uYellow");
  const uPointer = gl.getUniformLocation(program, "uPointer");

  const fuchsia: Rgb = readBrandColor("--color-brand-fuchsia", [1, 0, 1]);
  const yellow: Rgb = readBrandColor("--color-brand-yellow", [1, 0.988, 0]);
  gl.uniform3fv(uFuchsia, fuchsia);
  gl.uniform3fv(uYellow, yellow);

  let pointerX = 0;
  let pointerY = 0;

  const resize = () => {
    // Mobilde gereksiz piksel doldurmamak için DPR 2 ile sınırlandırıldı.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.floor(canvas.clientWidth * dpr);
    const height = Math.floor(canvas.clientHeight * dpr);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uResolution, canvas.width, canvas.height);
  };

  resize();

  return {
    renderFrame(timeSeconds: number) {
      gl.uniform1f(uTime, timeSeconds);
      gl.uniform2f(uPointer, pointerX, pointerY);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    setPointer(x: number, y: number) {
      pointerX = x;
      pointerY = y;
    },
    resize,
    dispose() {
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(buffer);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

/** Taşın ekran üzerindeki konumu — HTML link katmanını hizalamak için. */
export function stoneScreenPosition(
  index: number,
  timeSeconds: number,
): { x: number; y: number } {
  const r = 0.16 + index * 0.085;
  const speed = 0.32 / (1 + index * 0.42);
  const angle = timeSeconds * speed + index * 0.9;
  return { x: Math.cos(angle) * r, y: Math.sin(angle) * 0.42 * r };
}
