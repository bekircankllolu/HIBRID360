/**
 * Hibrid ekosistemi — Three.js sahnesi (20 Eylül 2026 yeniden tasarımı).
 *
 * Referans 1.png: siyah zeminde eşmerkezli ince halkalar, halkalarda cilalı
 * küreler, merkezde parlayan kristal. Referans 2.png: bir küre seçilince
 * kamera yaklaşır, küre keskin kalır, geri kalan sahne bulanıklaşır.
 *
 * Bu modül `SolarSystem.tsx` tarafından `import()` ile TEMBEL yüklenir:
 * Three.js yalnız sahne görünür alana girince indirilir (performans bütçesi).
 *
 * Bileşenle sözleşme (eski `SolarScene` ile aynı biçim): `render(frame)` her
 * karede çağrılır, `project(konum)` DOM etiketlerini konumlar. Konumlar
 * bileşenden gelir (`ecosystem-orbits.ts`) — buton ile küre aynı noktada.
 */
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import {
  ECO_BODIES,
  ECO_CAMERA,
  ECO_CRYSTAL_SIZE,
  ECO_FOV,
  ECO_RING_RADII,
  bodyPosition,
  buildDecor,
  ecosystemRingPoints,
  parallaxAngle,
  type EcoDecor,
} from "@/lib/ecosystem-orbits";
import { cameraEye, type CameraState, type ScreenPoint, type Vec3 } from "@/lib/solar-orbits";
import { ECO_CRYSTAL_SPHERES } from "@/data/solar-system";

export type EcosystemQuality = "high" | "medium";
/** Kademeli geri düşme merdiveni: high → medium → lite. */
export type EcosystemTier = "high" | "medium" | "lite";

export interface EcosystemBodyDef {
  radius: number;
  color: "yellow" | "fuchsia";
}

export interface EcosystemFrame {
  timeSeconds: number;
  camera: CameraState;
  /** Odaktaki tıklanabilir kürenin indeksi, yoksa -1. */
  focus: number;
  /** 0 → 1: odak bulanıklığı. Bileşen yumuşatarak verir. */
  focusBlur: number;
  /** İmlecin üstünde olduğu küre (halesi parlar), yoksa -1. */
  hover: number;
  positions: Vec3[];
  /**
   * Kaydırma paralaksı, -1..1: sahnenin ekran ortasına göre konumu. Yıldızlar
   * yörüngelerden biraz geç kayar (derinlik hissi). Hareket azaltmada 0.
   */
  parallax: number;
}

/** Teşhis modu (`?ecodebug`) ve uzaktan hata ayıklama için sahne durumu. */
export interface EcosystemDiagnostics {
  tier: EcosystemTier;
  gpu: string;
  webgl2: boolean;
  msaa: number;
  bloom: boolean;
  blur: boolean;
  pixelRatio: number;
  scale: number;
  buffer: string;
  frameMs: number;
  frameSkip: boolean;
  contextLost: boolean;
  fallbackReasons: string[];
}

export interface EcosystemScene {
  resize(): void;
  render(frame: EcosystemFrame): void;
  project(position: Vec3): ScreenPoint;
  diagnostics(): EcosystemDiagnostics;
  dispose(loseContext?: boolean): void;
}

/** Kurulum sırasında doğrulama ve ısınma için iç arayüz. */
interface BuiltScene extends EcosystemScene {
  warmup(): Promise<void>;
  validate(): boolean;
  setFallbackReasons(reasons: string[]): void;
}

/** Odak katmanı: seçili küre keskin çizilsin diye ayrı katmanda. */
const MAIN_LAYER = 0;
const FOCUS_LAYER = 1;

/* ------------------------------------------------------------------ yardımcılar */

function radialTexture(size: number, stops: Array<[number, string]>): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    for (const [at, color] of stops) gradient.addColorStop(at, color);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** RenderPass'in belirli katmanları çizen hali (odak modunda keskin/bulanık ayrımı). */
class LayerRenderPass extends RenderPass {
  layerMask = 1 << MAIN_LAYER;

  render(
    renderer: THREE.WebGLRenderer,
    writeBuffer: THREE.WebGLRenderTarget,
    readBuffer: THREE.WebGLRenderTarget,
    deltaTime: number,
    maskActive: boolean,
  ): void {
    const camera = this.camera as THREE.Camera;
    const previous = camera.layers.mask;
    camera.layers.mask = this.layerMask;
    super.render(renderer, writeBuffer, readBuffer, deltaTime, maskActive);
    camera.layers.mask = previous;
  }
}

const STAR_VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aTint;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vTwinkle;
  varying vec3 vTint;
  void main() {
    vTint = aTint;
    vTwinkle = 0.72 + 0.28 * sin(uTime * (0.6 + aPhase * 0.5) + aPhase * 40.0);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio;
  }
`;

const STAR_FRAGMENT = /* glsl */ `
  varying float vTwinkle;
  varying vec3 vTint;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = smoothstep(1.0, 0.0, d);
    a *= a;
    gl_FragColor = vec4(vTint * vTwinkle, a);
    #include <colorspace_fragment>
  }
`;

/**
 * Odak modu bulanıklığı: 10 örnekli disk (iki ardışık geçiş) (altın açı sarmalı),
 * piksel başına dönen örnekleme. Ayrık Gauss geçişleri ince halka çizgilerinde
 * şerit bırakıyordu ve 4-6 tam ekran geçiş gerektiriyordu; bu hem daha ucuz
 * hem de odak dışı (bokeh) görünüme daha yakın.
 */
const DISC_BLUR = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uRadius: { value: new THREE.Vector2() },
    uSeed: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 uRadius;
    uniform float uSeed;
    varying vec2 vUv;
    float noise(vec2 p) {
      return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
    }
    void main() {
      float rot = noise(gl_FragCoord.xy + uSeed) * 6.2831853;
      vec4 sum = vec4(0.0);
      for (int i = 0; i < 10; i++) {
        float f = (float(i) + 0.5) / 10.0;
        float a = float(i) * 2.39996323 + rot;
        sum += texture2D(tDiffuse, vUv + vec2(cos(a), sin(a)) * sqrt(f) * uRadius);
      }
      gl_FragColor = sum / 10.0;
    }
  `,
};

const CRYSTAL_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Kristal videosu gerçek alfa taşımıyor (siyah zemin). En parlak kanalı alfa
 * sayıp önceden çarpılmış bileşimle çiziyoruz: siyah kısımlar şeffaf, parlak
 * kısımlar arkasındaki halkaları örter — ekle-karıştırma gibi halkaları
 * "içinden" göstermez ama kenar parlaması yumuşak kalır.
 */
const CRYSTAL_FRAGMENT = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uGain;
  varying vec2 vUv;
  void main() {
    vec3 c = texture2D(uMap, vUv).rgb;
    // Sıkıştırmadan kalan siyah taban gürültüsünü at: aksi halde düzlemin
    // kenarları sönük bir dikdörtgen olarak görünüyor.
    c = max(c - vec3(0.035), vec3(0.0)) * 1.036;
    // Kare kenarındaki satır/sütun: video kodlamasından ince renkli çizgi
    // (alt kenarda yeşil şerit) kalıyordu; kenara yakın pikseller şeffaflaşır.
    float edge = smoothstep(0.0, 0.02, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
    c *= edge;
    float peak = max(max(c.r, c.g), c.b);
    float a = smoothstep(0.0, 0.18, peak);
    gl_FragColor = vec4(c * uGain, a);
    // Doğrudan çizimde (ardıl işlemsiz) doğrusal → sRGB dönüşümü burada olmalı;
    // ardıl işlem modunda hedef doğrusal olduğu için bu satır etkisiz kalır.
    #include <colorspace_fragment>
  }
`;

/* ------------------------------------------------------------------------ sahne */

export interface EcosystemSceneOptions {
  canvas: HTMLCanvasElement;
  bodies: readonly EcosystemBodyDef[];
  /** Kristal videosu; `null` ise (hareket azaltma) yalnız poster çizilir. */
  crystalVideo: HTMLVideoElement | null;
  crystalPoster: string;
  /**
   * Sahne alanı (kompozisyonun oturduğu kutu). Canvas bundan BÜYÜK olabilir:
   * yörüngeler ve yıldızlar sahne kutusunun altına/üstüne taşıyor. Kamera bu
   * kutuya göre kuruluyor, canvas onun üzerinde geniş bir pencere — merkezdeki
   * kompozisyon canvas büyüse de birebir aynı kalıyor.
   */
  stage: HTMLElement;
  quality: EcosystemQuality;
  /** Poster dokusu inince çağrılır: hareket azaltmadaki tek kare yeniden çizilsin. */
  onTextureLoad?: () => void;
  /** GPU bağlamı kaybolunca (Mac'te GPU geçişi, bellek baskısı) / geri gelince. */
  onContextLost?: () => void;
  onContextRestored?: () => void;
}

interface BuildOptions extends EcosystemSceneOptions {
  tier: EcosystemTier;
}

/**
 * Kurulum ortasında bir istisna fırlarsa (`buildScene` yarıda kalır, `dispose`
 * elimizde yok) yarım kalan kaynakların temizliği: renderer, doku/hedefler ve
 * canvas dinleyicileri. Sıradaki basamak AYNI canvas'ı kullanıyor; temizlenmezse
 * başarısız denemenin GPU belleği ve dinleyicileri yaşamaya devam ederdi.
 */
interface PartialBuild {
  cleanups: Array<() => void>;
}

function buildScene(options: BuildOptions, partial: PartialBuild): BuiltScene | null {
  const { canvas, bodies, crystalVideo, crystalPoster } = options;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      // Kenar yumuşatma ardıl işlem hedefindeki MSAA'dan geliyor.
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
  } catch {
    return null;
  }
  partial.cleanups.push(() => renderer.dispose());
  // Yazılım render'ı (SwiftShader/llvmpipe) bloom + MSAA'yı taşıyamaz: otomatik
  // "medium". Tasarım karşılaştırması için localStorage anahtarı yükseği zorlar.
  const debugInfo = renderer.getContext().getExtension("WEBGL_debug_renderer_info");
  const gpuName = debugInfo
    ? String(renderer.getContext().getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
    : "";
  let forceHigh = false;
  try {
    forceHigh = window.localStorage.getItem("hibrid360-eco-quality") === "high";
  } catch {
    forceHigh = false;
  }
  const software = /swiftshader|llvmpipe|software/i.test(gpuName);
  const isWebGL2 = renderer.capabilities.isWebGL2;
  /** Yazılım render'ında (ya da merdivenin son basamağında) ardıl işlem kurulmaz. */
  const lite = options.tier === "lite" || (software && !forceHigh);
  const high = options.tier === "high" && !lite;
  const direct = lite;
  /**
   * Yazılım render'ı (CI koşucuları, GPU'suz makineler): her piksel CPU'da
   * çiziliyor. Görsel tavanı değil KARARLILIĞI hedefleyen hafif kip: düşük
   * çözünürlük bütçesi, basit malzeme, ortam haritası ve süs halesi yok, az
   * yıldız. Paylaşımlı 2 vCPU'lu CI'da tam sahne her Playwright çağrısını
   * saniyelere uzatıp testleri zaman aşımına düşürüyordu.
   */
  renderer.setClearColor(0x000000, 1);
  renderer.toneMapping = THREE.NoToneMapping;
  const pixelRatioCap = high ? 1.75 : 1.5;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera((ECO_FOV * 180) / Math.PI, 16 / 9, 0.1, 400);
  camera.layers.enable(FOCUS_LAYER);

  const disposables: Array<{ dispose(): void }> = [];
  const track = <T extends { dispose(): void }>(item: T): T => {
    disposables.push(item);
    return item;
  };
  partial.cleanups.push(() => {
    for (const item of disposables) item.dispose();
  });

  /*
   * Işık ve ortam haritası YOK (25 Eylül 2026): yalnız eski parlak (lit) küreler
   * içindi. Küreler artık ışığı kendi içinde taşıyan kristal görseller; PMREM
   * üretimi ve ışık hesabı kalktı (zayıf GPU'larda kurulum ve kare maliyeti düşer).
   */

  /* ---- yıldızlar */
  const starCount = high ? 2600 : lite ? 600 : 1400;
  const starGeometry = track(new THREE.BufferGeometry());
  {
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const phases = new Float32Array(starCount);
    const tints = new Float32Array(starCount * 3);
    // Tohumlu sahte rastgele: her yüklemede aynı gökyüzü.
    let seed = 0x5eed;
    const rnd = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = 0; i < starCount; i++) {
      const u = rnd() * 2 - 1;
      const theta = rnd() * Math.PI * 2;
      const radius = 70 + rnd() * 40;
      const s = Math.sqrt(1 - u * u);
      positions[i * 3] = Math.cos(theta) * s * radius;
      positions[i * 3 + 1] = u * radius;
      positions[i * 3 + 2] = Math.sin(theta) * s * radius;
      const bright = rnd();
      sizes[i] = bright > 0.985 ? 3.2 : bright > 0.9 ? 2.1 : 1.3;
      phases[i] = rnd();
      const warm = rnd();
      const level = 0.35 + bright * 0.65;
      // Çoğu beyaz-mavimsi, birkaçı sıcak sarı, birkaçı soğuk mavi.
      if (warm < 0.08) tints.set([level, level * 0.9, level * 0.55], i * 3);
      else if (warm < 0.2) tints.set([level * 0.65, level * 0.8, level], i * 3);
      else tints.set([level, level, level * 0.97], i * 3);
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    starGeometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    starGeometry.setAttribute("aTint", new THREE.BufferAttribute(tints, 3));
  }
  const starMaterial = track(
    new THREE.ShaderMaterial({
      vertexShader: STAR_VERTEX,
      fragmentShader: STAR_FRAGMENT,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  const stars = new THREE.Points(starGeometry, starMaterial);
  stars.frustumCulled = false;
  scene.add(stars);

  /* ---- yörünge halkaları: ince, kameraya yaklaştıkça parlayan çizgiler */
  const lineMaterials: LineMaterial[] = [];
  const rings = ECO_RING_RADII.map((_, ringIndex) => {
    const base = ecosystemRingPoints(ringIndex, 256);
    const closed = new Float32Array((256 + 1) * 3);
    closed.set(base);
    closed.set(base.subarray(0, 3), 256 * 3);
    const geometry = track(new LineGeometry());
    geometry.setPositions(closed);
    geometry.setColors(new Float32Array(closed.length).fill(0.5));
    const material = track(
      new LineMaterial({
        color: 0xffffff,
        linewidth: 1.4,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    lineMaterials.push(material);
    const line = new Line2(geometry, material);
    line.computeLineDistances();
    line.frustumCulled = false;
    scene.add(line);
    return { geometry, points: closed };
  });
  const ringEye = new THREE.Vector3(1e9, 1e9, 1e9);

  const updateRingFade = (eye: THREE.Vector3) => {
    if (ringEye.distanceToSquared(eye) < 0.0025) return;
    ringEye.copy(eye);
    rings.forEach(({ geometry, points }, ringIndex) => {
      const attribute = geometry.getAttribute("instanceColorStart") as THREE.InterleavedBufferAttribute;
      const data = attribute.data.array as Float32Array;
      const vertices = points.length / 3;
      const near = ECO_CAMERA.distance - 7;
      const span = ECO_RING_RADII[ringIndex] + 15;
      const intensityAt = (i: number) => {
        const dx = points[i * 3] - eye.x;
        const dy = points[i * 3 + 1] - eye.y;
        const dz = points[i * 3 + 2] - eye.z;
        const t = Math.min(1, Math.max(0, (Math.hypot(dx, dy, dz) - near) / span));
        return 0.9 - 0.76 * Math.pow(t, 0.75);
      };
      for (let i = 0; i < vertices - 1; i++) {
        const a = intensityAt(i);
        const b = intensityAt(i + 1);
        const o = i * 6;
        data[o] = a * 0.92;
        data[o + 1] = a * 0.95;
        data[o + 2] = a;
        data[o + 3] = b * 0.92;
        data[o + 4] = b * 0.95;
        data[o + 5] = b;
      }
      attribute.data.needsUpdate = true;
    });
  };

  /*
   * ---- küreler: kristal görseller (25 Eylül 2026)
   *
   * Her küre iki parçadan oluşur:
   *   1) GÖRÜNMEZ küre (yalnız derinlik yazar): eski opak kürenin birebir
   *      yerinde ve boyunda. Arkasındaki yörünge çizgilerini, yıldızları ve
   *      kristali eskisi gibi gizler; kendi yörünge çizgisi kürenin "içinden"
   *      geçmez.
   *   2) Kristal görsel düzlemi: kameraya dönük, kürenin ÖN teğet noktasında.
   *      Boyu, kürenin ekrandaki silüetini birebir kaplayacak şekilde perspektifle
   *      hesaplanır (`placeSurface`) — disk eski küreyle aynı ekran boyunda.
   * Yörünge, hız, boyut, odak katmanı, hale nabzı ve üzerine gelince parlama
   * değişmedi; yalnız kürenin görünüşü.
   */
  const sphereHigh = track(new THREE.SphereGeometry(1, 56, 40));
  const sphereLow = track(new THREE.SphereGeometry(1, 20, 14));
  const glowTexture = track(
    radialTexture(128, [
      [0, "rgba(255,255,255,1)"],
      [0.25, "rgba(255,255,255,0.5)"],
      [0.6, "rgba(255,255,255,0.12)"],
      [1, "rgba(255,255,255,0)"],
    ]),
  );

  const glowFor = (color: number, opacity: number) => {
    const sprite = new THREE.Sprite(
      track(
        new THREE.SpriteMaterial({
          map: glowTexture,
          color,
          transparent: true,
          opacity,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      ),
    );
    return sprite;
  };

  /** Yalnız derinlik yazan malzeme (renk yok). */
  const occluderMaterial = track(new THREE.MeshBasicMaterial({ colorWrite: false }));

  /** Kristal dokuları; yüklenince çizime katılır (öncesinde kare görünmesin). */
  const crystalLoads: Array<Promise<void>> = [];
  const crystalMaterials: THREE.MeshBasicMaterial[] = [];
  const loadCrystal = (src: string) => {
    let settle = () => {};
    crystalLoads.push(
      new Promise<void>((resolve) => {
        settle = resolve;
      }),
    );
    const texture = track(
      new THREE.TextureLoader().load(
        src,
        () => {
          for (const material of crystalMaterials) {
            if (material.map === texture) material.visible = true;
          }
          settle();
          options.onTextureLoad?.();
        },
        undefined,
        () => settle(),
      ),
    );
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    return texture;
  };
  const fuchsiaTexture = loadCrystal(ECO_CRYSTAL_SPHERES.fuchsia.src);
  const yellowTexture = loadCrystal(ECO_CRYSTAL_SPHERES.yellow.src);
  const whiteTexture = loadCrystal(ECO_CRYSTAL_SPHERES.white.src);

  /**
   * Dokular önceden çarpılmış alfa taşır (siyah zemin şeffaf, disk opak):
   * bileşim One / OneMinusSrcAlpha. `min(rgb, a)`: kayıplı webp sıkıştırması
   * parlamanın uçlarında rengi alfanın biraz üstüne taşıyabiliyor (ışıltı noktası).
   */
  const crystalSurface = (map: THREE.Texture, tint = 0xffffff) => {
    const material = new THREE.MeshBasicMaterial({
      map,
      color: tint,
      transparent: true,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      blendSrcAlpha: THREE.OneFactor,
      blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
    });
    // Doku gelmeden çizilmesin: yüklenmemiş doku siyah kare olarak görünürdü.
    material.visible = Boolean(map.image);
    material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        "#include <map_fragment>\n  diffuseColor.rgb = min(diffuseColor.rgb, vec3(diffuseColor.a));",
      );
    };
    crystalMaterials.push(material);
    return track(material);
  };
  const plane = track(new THREE.PlaneGeometry(1, 1));
  /** Yüzeyler yörünge çizgilerinden ÖNCE çizilir: öndeki çizgiler üstüne eklenir. */
  const SURFACE_ORDER = -1;

  /**
   * Kristal düzlemini kürenin ön teğet noktasına yerleştirir. Göz uzaklığı d,
   * yarıçap r: kürenin görünen silüeti, teğet düzlemde yarıçapı
   * (d − r)·r / √(d² − r²) olan bir diske karşılık gelir; doku bu diski
   * `frame` payıyla (parlama) taşır.
   */
  const toEye = new THREE.Vector3();
  const placeSurface = (object: THREE.Object3D, x: number, y: number, z: number, radius: number) => {
    toEye.set(eye.x - x, eye.y - y, eye.z - z);
    const d = toEye.length();
    const lift = radius * 1.002;
    toEye.divideScalar(Math.max(d, 1e-4));
    object.position.set(x + toEye.x * lift, y + toEye.y * lift, z + toEye.z * lift);
    object.lookAt(eye);
    const disk = d > radius * 1.05 ? ((d - lift) * radius) / Math.sqrt(d * d - radius * radius) : radius;
    object.scale.setScalar(disk * 2 * ECO_CRYSTAL_SPHERES.frame);
  };

  const fuchsiaSurface = crystalSurface(fuchsiaTexture);
  const yellowSurface = crystalSurface(yellowTexture);
  const clickable = bodies.map((body) => {
    const mesh = new THREE.Mesh(sphereHigh, occluderMaterial);
    mesh.scale.setScalar(body.radius);
    const surface = new THREE.Mesh(plane, body.color === "yellow" ? yellowSurface : fuchsiaSurface);
    surface.renderOrder = SURFACE_ORDER;
    const halo = glowFor(
      body.color === "yellow" ? ECO_CRYSTAL_SPHERES.yellow.halo : ECO_CRYSTAL_SPHERES.fuchsia.halo,
      0.3,
    );
    halo.scale.setScalar(body.radius * 4.2);
    scene.add(mesh, surface, halo);
    return { mesh, surface, halo, radius: body.radius };
  });

  // Süs küreler: beyaz kristal; sıcak olanlar eski krem tonuyla boyanır. Her
  // grup iki InstancedMesh: derinlik küresi + kameraya dönük kristal düzlemi.
  const decor: EcoDecor[] = buildDecor(high);
  const cool = decor.filter((d) => d.warmth === 0);
  const warm = decor.filter((d) => d.warmth === 1);
  const makeInstanced = (geometry: THREE.BufferGeometry, material: THREE.Material, count: number) => {
    const mesh = new THREE.InstancedMesh(geometry, material, Math.max(1, count));
    mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(mesh);
    // `InstancedMesh.dispose()` örnek matrisi tamponunu GPU'dan bırakır.
    return track(mesh);
  };
  const decorGroup = (list: EcoDecor[], tint: number) => {
    const occluder = makeInstanced(sphereLow, occluderMaterial, list.length);
    const surface = makeInstanced(plane, crystalSurface(whiteTexture, tint), list.length);
    surface.renderOrder = SURFACE_ORDER;
    return { list, occluder, surface };
  };
  const decorGroups = [decorGroup(cool, 0xffffff), decorGroup(warm, 0xfff1c8)];
  const scratch = new THREE.Object3D();
  const placeDecor = (group: (typeof decorGroups)[number], t: number) => {
    group.list.forEach((item, i) => {
      const p = bodyPosition(item, t);
      scratch.position.set(p[0], p[1], p[2]);
      scratch.quaternion.identity();
      scratch.scale.setScalar(item.radius);
      scratch.updateMatrix();
      group.occluder.setMatrixAt(i, scratch.matrix);
      placeSurface(scratch, p[0], p[1], p[2], item.radius);
      scratch.updateMatrix();
      group.surface.setMatrixAt(i, scratch.matrix);
    });
    for (const mesh of [group.occluder, group.surface]) {
      mesh.count = group.list.length;
      mesh.instanceMatrix.needsUpdate = true;
    }
  };

  // Büyük süs kürelerin yumuşak halesi (referanstaki ışık sızıntısı).
  const decorHalos = (lite ? [] : decor)
    .filter((d) => d.radius > 0.16)
    .map((d) => {
      const halo = glowFor(d.warmth ? 0xffe9b0 : 0xdfe6ff, 0.1);
      halo.scale.setScalar(d.radius * 3.6);
      scene.add(halo);
      return { halo, item: d };
    });

  /* ---- kristal: video (ya da poster) dokulu düzlem + geniş sıcak parlama */
  const posterTexture = track(
    new THREE.TextureLoader().load(crystalPoster, () => options.onTextureLoad?.()),
  );
  posterTexture.colorSpace = THREE.SRGBColorSpace;
  let videoTexture: THREE.VideoTexture | null = null;
  if (crystalVideo) {
    videoTexture = track(new THREE.VideoTexture(crystalVideo));
    videoTexture.colorSpace = THREE.SRGBColorSpace;
  }
  const crystalMaterial = track(
    new THREE.ShaderMaterial({
      vertexShader: CRYSTAL_VERTEX,
      fragmentShader: CRYSTAL_FRAGMENT,
      uniforms: { uMap: { value: posterTexture }, uGain: { value: 1 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
    }),
  );
  const crystal = new THREE.Mesh(track(new THREE.PlaneGeometry(1, 1)), crystalMaterial);
  crystal.scale.setScalar(ECO_CRYSTAL_SIZE);
  crystal.renderOrder = 2;
  const crystalGlow = glowFor(0xffb020, 0.16);
  crystalGlow.scale.setScalar(ECO_CRYSTAL_SIZE * 1.45);
  scene.add(crystalGlow, crystal);

  /* ---- ardıl işlem: (odakta) bulanık ana sahne → keskin odak küresi → bloom */
  const size = new THREE.Vector2(1, 1);
  /**
   * MSAA: yüksek çözünürlükte (DPR ≥ 1.5) piksel zaten sık, yarım-float 4x MSAA
   * hedefi ise yüzlerce MB bellek ve dolgu maliyeti — Mac'lerdeki kasma/donma
   * şüphelilerinden biri. Yalnız düşük DPR'de açık.
   */
  const msaa = high && (window.devicePixelRatio || 1) < 1.5 ? 4 : 0;
  const buildPost = () => {
    const composer = new EffectComposer(
      renderer,
      new THREE.WebGLRenderTarget(1, 1, {
        type: THREE.HalfFloatType,
        ...(msaa ? { samples: msaa } : {}),
      }),
    );
    const mainPass = new LayerRenderPass(scene, camera);
    // İki ardışık geçiş, farklı dönüş tohumlarıyla: tek geçişin tanesini siler.
    const blurPasses = [0, 1].map((seed) => {
      const pass = new ShaderPass(DISC_BLUR);
      pass.uniforms.uSeed.value = seed * 37.7;
      return pass;
    });
    const focusPass = new LayerRenderPass(scene, camera);
    focusPass.clear = false;
    focusPass.clearDepth = true;
    focusPass.layerMask = 1 << FOCUS_LAYER;
    const bloomPass = new UnrealBloomPass(size, high ? 0.32 : 0.22, 0.5, 0.95);
    composer.addPass(mainPass);
    for (const pass of blurPasses) composer.addPass(pass);
    composer.addPass(focusPass);
    composer.addPass(bloomPass);
    track({ dispose: () => composer.dispose() });
    // `EffectComposer.dispose()` yalnız kendi iki hedefini temizler: geçişlerin
    // (bloom mip zinciri, bulanıklık, çıktı) hedef ve malzemeleri ayrıca.
    const output = new OutputPass();
    composer.addPass(output);
    for (const pass of [mainPass, ...blurPasses, focusPass, bloomPass, output]) track(pass);
    return { composer, mainPass, blurPasses, focusPass, bloomPass };
  };
  const post = direct ? null : buildPost();

  /* ---- boyutlandırma */
  /**
   * Toplam çizim piksel bütçesi. Canvas artık sahne kutusundan ~2 kat büyük;
   * retina'da 2x çarpanı ile bloom + MSAA zayıf ekran kartlarını boğardı.
   * Çarpan, piksel bütçesine sığacak şekilde otomatik düşer.
   */
  const pixelBudget = lite ? 600_000 : high ? 3_200_000 : 1_800_000;
  let pixelRatio = 1;
  /** Uyarlanabilir çözünürlük: kare süresi kötüleşirse piksel çarpanı bununla küçülür. */
  let qualityScale = 1;
  let scaleCeiling = 1;
  let bloomEnabled = high;
  let blurEnabled = true;
  /** Sahne kutusunun canvas içindeki konumu (CSS px) — `project` bunu çıkarır. */
  let stageOffsetX = 0;
  let stageOffsetY = 0;
  const resize = () => {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    const { stage } = options;
    const stageWidth = Math.max(1, stage.clientWidth);
    const stageHeight = Math.max(1, stage.clientHeight);
    const canvasBox = canvas.getBoundingClientRect();
    const stageBox = stage.getBoundingClientRect();
    stageOffsetX = stageBox.left - canvasBox.left;
    stageOffsetY = stageBox.top - canvasBox.top;

    const fitRatio = Math.sqrt(pixelBudget / (width * height));
    // Hafif kipte çarpan 1'in ALTINA inebilir (canvas CSS boyutuna büyütülür).
    pixelRatio = Math.max(
      lite ? 0.4 : 0.5,
      Math.min(window.devicePixelRatio || 1, pixelRatioCap, fitRatio) * qualityScale,
    );
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    post?.composer.setPixelRatio(pixelRatio);
    post?.composer.setSize(width, height);
    size.set(width, height);
    // Sanal kadraj = sahne kutusu (FOV ve en-boy oranı bunun); canvas onun
    // üzerinde, kutunun üstüne/altına taşan bir alt pencere.
    camera.aspect = stageWidth / stageHeight;
    camera.setViewOffset(stageWidth, stageHeight, -stageOffsetX, -stageOffsetY, width, height);
    camera.updateProjectionMatrix();
    starMaterial.uniforms.uPixelRatio.value = pixelRatio;
    for (const material of lineMaterials) {
      material.resolution.set(width * pixelRatio, height * pixelRatio);
      material.linewidth = Math.max(1, 1.35 * pixelRatio);
    }
  };

  /* ---- GPU bağlamı kaybı (Mac'te GPU geçişi, bellek baskısı, sekme arka planı) */
  let contextLost = false;
  let disposing = false;
  const onLost = (event: Event) => {
    // preventDefault: tarayıcı bağlamı geri getirebilsin (three.js kendi durumunu
    // geri yüklüyor; biz yalnız arayüze haber veriyoruz).
    event.preventDefault();
    if (disposing) return;
    contextLost = true;
    options.onContextLost?.();
  };
  const onRestored = () => {
    if (disposing) return;
    contextLost = false;
    options.onContextRestored?.();
  };
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);
  partial.cleanups.push(() => {
    canvas.removeEventListener("webglcontextlost", onLost);
    canvas.removeEventListener("webglcontextrestored", onRestored);
  });

  /* ---- kare çizimi */
  let focused = -1;
  const setFocus = (index: number) => {
    if (index === focused) return;
    if (focused >= 0) {
      for (const part of [clickable[focused].mesh, clickable[focused].surface, clickable[focused].halo]) {
        part.layers.set(MAIN_LAYER);
      }
    }
    focused = index;
    if (focused >= 0) {
      for (const part of [clickable[focused].mesh, clickable[focused].surface, clickable[focused].halo]) {
        part.layers.set(FOCUS_LAYER);
      }
    }
  };

  /* ---- uyarlanabilir kalite: kare süresi izleyici */
  let lastFrameAt = 0;
  let frameEma = 0;
  let badSince = 0;
  let goodSince = 0;
  let lastAdaptAt = 0;
  let frameSkip = false;
  let skipPhase = 0;
  const degrade = () => {
    if (qualityScale > 0.5) {
      scaleCeiling = Math.max(0.5, qualityScale - 0.05);
      qualityScale = Math.max(0.5, qualityScale - 0.15);
      resize();
    }
    // Ucuz kazançlar önce: bloom, sonra odak bulanıklığı.
    if (qualityScale <= 0.75) bloomEnabled = false;
    if (qualityScale <= 0.6) blurEnabled = false;
    // Hâlâ yavaşsa: kare atlama (yaklaşık 30 fps).
    if (qualityScale <= 0.5 && !bloomEnabled && !blurEnabled) frameSkip = true;
  };
  const probeUp = () => {
    frameSkip = false;
    if (qualityScale >= scaleCeiling) return;
    qualityScale = Math.min(scaleCeiling, qualityScale + 0.1);
    if (high && qualityScale >= 0.8) bloomEnabled = true;
    if (qualityScale >= 0.65) blurEnabled = true;
    resize();
  };
  const adapt = (now: number) => {
    if (lastFrameAt) {
      const dt = now - lastFrameAt;
      // Uzun boşluk (sekme gizliydi): ölçümü kirletmesin.
      if (dt > 500) {
        frameEma = 0;
        badSince = 0;
        goodSince = 0;
      } else {
        frameEma = frameEma ? frameEma * 0.92 + dt * 0.08 : dt;
      }
    }
    lastFrameAt = now;
    if (!frameEma || now - lastAdaptAt < 1200) return;
    const slow = frameEma > 25; // ~40 fps altı
    const fast = frameEma < 18.5; // 60 Hz ekranda tavan
    if (slow) {
      goodSince = 0;
      badSince ||= now;
      if (now - badSince > 900) {
        degrade();
        lastAdaptAt = now;
        badSince = 0;
      }
    } else if (fast && (qualityScale < scaleCeiling || frameSkip)) {
      badSince = 0;
      goodSince ||= now;
      if (now - goodSince > 6000) {
        probeUp();
        lastAdaptAt = now;
        goodSince = 0;
      }
    } else {
      badSince = 0;
      goodSince = 0;
    }
  };

  const eye = new THREE.Vector3();
  const right = new THREE.Vector3();
  const target = new THREE.Vector3();
  const tmp = new THREE.Vector3();

  const render = (frame: EcosystemFrame) => {
    if (contextLost) return;
    adapt(performance.now());
    if (frameSkip) {
      skipPhase ^= 1;
      if (skipPhase) return;
    }
    const t = frame.timeSeconds;
    const [ex, ey, ez] = cameraEye(frame.camera);
    eye.set(ex, ey, ez);
    target.set(...frame.camera.target);
    camera.position.copy(eye);
    camera.lookAt(target);
    camera.updateMatrixWorld();

    starMaterial.uniforms.uTime.value = t;
    stars.position.copy(eye);
    // Paralaks: yıldız küresi kameranın sağ ekseni etrafında hafifçe döner →
    // ekranda yavaşça yukarı/aşağı kayar; yörüngeler sayfayla birlikte akar.
    right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    stars.quaternion.setFromAxisAngle(right, parallaxAngle(frame.parallax));
    updateRingFade(eye);

    setFocus(frame.focus);

    clickable.forEach((item, index) => {
      const p = frame.positions[index];
      if (!p) return;
      item.mesh.position.set(p[0], p[1], p[2]);
      placeSurface(item.surface, p[0], p[1], p[2], item.radius);
      item.halo.position.set(p[0], p[1], p[2]);
      const pulse = 0.28 + 0.06 * Math.sin(t * 1.7 + index * 1.3);
      const boost = frame.hover === index ? 0.25 : 0;
      (item.halo.material as THREE.SpriteMaterial).opacity = pulse + boost;
    });

    for (const group of decorGroups) placeDecor(group, t);
    for (const { halo, item } of decorHalos) {
      const p = bodyPosition(item, t);
      halo.position.set(p[0], p[1], p[2]);
    }

    // Kristal: her zaman kameraya dönük düzlem; video hazırsa videoyu göster.
    crystal.quaternion.copy(camera.quaternion);
    if (videoTexture && crystalVideo && crystalVideo.readyState >= 2) {
      crystalMaterial.uniforms.uMap.value = videoTexture;
    }
    crystalGlow.material.opacity = 0.16 + 0.03 * Math.sin(t * 0.9);

    if (!post) {
      camera.layers.enableAll();
      renderer.render(scene, camera);
      return;
    }
    // Bulanıklık yalnız odakta çalışır (aksi halde yalnız ana geçiş çizilir).
    const blurring = blurEnabled && frame.focus >= 0 && frame.focusBlur > 0.02;
    post.mainPass.layerMask = blurring ? 1 << MAIN_LAYER : (1 << MAIN_LAYER) | (1 << FOCUS_LAYER);
    post.focusPass.enabled = blurring;
    for (const pass of post.blurPasses) {
      pass.enabled = blurring;
      pass.uniforms.uRadius.value.set(
        (4.2 * frame.focusBlur) / Math.max(1, size.x),
        (4.2 * frame.focusBlur) / Math.max(1, size.y),
      );
    }
    post.bloomPass.enabled = bloomEnabled;
    post.composer.render();
  };

  const project = (position: Vec3): ScreenPoint => {
    tmp.set(position[0], position[1], position[2]);
    const view = tmp.clone().applyMatrix4(camera.matrixWorldInverse);
    const depth = -view.z;
    if (depth <= 0.0001) {
      return { x: 0, y: 0, distance: Number.POSITIVE_INFINITY, visible: false };
    }
    const ndc = tmp.project(camera);
    // NDC canvas penceresine göre; DOM etiketleri sahne kutusunun çocuğu →
    // kutunun canvas içindeki konumunu çıkar.
    return {
      x: (ndc.x * 0.5 + 0.5) * canvas.clientWidth - stageOffsetX,
      y: (0.5 - ndc.y * 0.5) * canvas.clientHeight - stageOffsetY,
      distance: depth,
      visible: ndc.z > -1 && ndc.z < 1,
    };
  };

  let fallbackReasons: string[] = [];
  const diagnostics = (): EcosystemDiagnostics => ({
    tier: lite ? "lite" : high ? "high" : "medium",
    gpu: gpuName || "bilinmiyor",
    webgl2: isWebGL2,
    msaa,
    bloom: bloomEnabled,
    blur: blurEnabled,
    pixelRatio: +pixelRatio.toFixed(2),
    scale: +qualityScale.toFixed(2),
    buffer: `${Math.round(size.x * pixelRatio)}x${Math.round(size.y * pixelRatio)}`,
    frameMs: +frameEma.toFixed(1),
    frameSkip,
    contextLost,
    fallbackReasons,
  });

  /**
   * Kurulum doğrulaması: bir kare (ve odak/bulanıklık yolunu) çizip GL hatası
   * kalmadığına bakar. Eksik framebuffer (ör. bazı Safari/Mac GPU'larında yarım-float
   * çoklu-örnek hedef) çizimde `INVALID_FRAMEBUFFER_OPERATION` üretir; bu, sahneyi
   * kalıcı siyah bırakmak yerine bir alt kalite basamağına düşmeyi tetikler.
   */
  const validate = (): boolean => {
    try {
      const gl = renderer.getContext();
      gl.getError(); // önceki artık hataları temizle
      const frame: EcosystemFrame = {
        timeSeconds: 0,
        camera: {
          target: ECO_CAMERA.target,
          distance: ECO_CAMERA.distance,
          yaw: ECO_CAMERA.yaw,
          pitch: ECO_CAMERA.pitch,
        },
        focus: -1,
        focusBlur: 0,
        hover: -1,
        positions: ECO_BODIES.map((body) => bodyPosition(body, 0)),
        parallax: 0,
      };
      render(frame);
      if (gl.getError() !== gl.NO_ERROR) return false;
      if (post && blurEnabled) {
        // Odak yolu (katman ayrımı + bulanıklık geçişleri) ayrıca sınanır; bozuksa
        // yalnız bulanıklık kapatılır, sahne çalışmaya devam eder.
        render({ ...frame, focus: 0, focusBlur: 1 });
        if (gl.getError() !== gl.NO_ERROR) blurEnabled = false;
        render(frame);
        gl.getError();
      }
      lastFrameAt = 0;
      frameEma = 0;
      return !contextLost;
    } catch {
      return false;
    }
  };

  /** Shader'ları paralel (bloklamayan) derle: ilk karedeki takılmayı azaltır. */
  const warmup = async () => {
    try {
      await renderer.compileAsync(scene, camera);
    } catch {
      // Desteklenmiyorsa ilk karede eşzamanlı derlenir.
    }
    // Kristal dokuları gelmeden sahne açılırsa küreler bir an görünmez olur:
    // kısa süre bekle (poster yer tutucu bu arada görünür). Yavaş bağlantıda
    // beklemez; dokular gelince kendiliğinden görünürler.
    await Promise.race([
      Promise.all(crystalLoads),
      new Promise<void>((resolve) => window.setTimeout(resolve, 2500)),
    ]);
  };

  const dispose = (loseContext = true) => {
    disposing = true;
    canvas.removeEventListener("webglcontextlost", onLost);
    canvas.removeEventListener("webglcontextrestored", onRestored);
    for (const item of disposables) item.dispose();
    renderer.dispose();
    // Başarısız bir basamağı atarken bağlamı KAYBETTİRME: sıradaki basamak aynı
    // canvas'ta yeni bir renderer kuracak ve kayıp bağlamı geri alırdı.
    if (loseContext) renderer.forceContextLoss();
  };

  resize();
  return {
    resize,
    render,
    project,
    diagnostics,
    dispose,
    warmup,
    validate,
    setFallbackReasons: (reasons: string[]) => {
      fallbackReasons = reasons;
    },
  };
}

/**
 * Sahneyi kurar; başarısız olan basamak bir alt kaliteye düşer (high → medium →
 * lite). Amaç, bazı Mac/Safari GPU'larında gelen "sahne hiç açılmıyor"
 * şikâyetini kalıcı siyah alan yerine çalışan (daha sade) bir sahneye çevirmek.
 * Hepsi başarısız olursa `null` döner ve bileşen posteri gösterir.
 */
/** Son başarısız kurulumun nedenleri (teşhis paneli ve konsol uyarısı için). */
let lastFailureReasons: string[] = [];
export function getSceneFailureReasons(): string[] {
  return lastFailureReasons;
}

export async function createEcosystemScene(
  options: EcosystemSceneOptions,
): Promise<EcosystemScene | null> {
  const ladder: EcosystemTier[] =
    options.quality === "high" ? ["high", "medium", "lite"] : ["medium", "lite"];
  const reasons: string[] = [];
  for (const tier of ladder) {
    let built: BuiltScene | null = null;
    const partial: PartialBuild = { cleanups: [] };
    try {
      built = buildScene({ ...options, tier }, partial);
      if (!built) {
        reasons.push(`${tier}: renderer kurulamadı`);
        continue;
      }
      await built.warmup();
      if (built.validate()) {
        built.setFallbackReasons(reasons);
        return built;
      }
      reasons.push(`${tier}: doğrulama çizimi GL hatası verdi`);
    } catch (error) {
      reasons.push(`${tier}: ${String(error).slice(0, 120)}`);
      // `buildScene` yarıda patladıysa elimizde `dispose` yok: kaynakları bırak.
      if (!built) {
        for (const cleanup of partial.cleanups.reverse()) {
          try {
            cleanup();
          } catch {
            // Temizlik en iyi çabayla: başarısız basamak zaten atılıyor.
          }
        }
      }
    }
    built?.dispose(false);
  }
  lastFailureReasons = reasons;
  return null;
}
