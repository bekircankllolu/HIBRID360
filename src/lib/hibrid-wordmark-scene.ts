/**
 * HIBRID sıvı tipografi sahnesi — native WebGL 1.0, kütüphane yok.
 *
 * Kaynak: müşteriden teslim alınan `hibrit-liquid-effect` referans
 * implementasyonu (index.html). Shader ve etkileşim matematiği birebir
 * korunmuştur — mouse velocity, smear, swirl/curl, flow noise, 300'lük
 * hash grain, 24 fps kesikli grain zamanlaması, idle dalga ve imleç
 * kaynaklı radyal dalga. Değişen tek şey: tek seferlik bir HTML sayfası
 * yerine, bu kod tabanının sahne fabrikası desenine (bkz.
 * src/lib/webgl-scene.ts) uyarlanmış olması.
 *
 * Harf maskesi gerçek bir varlık: public/images/hibrid-wordmark.png
 * (1920x528, alfa kanalı). Yazı HIBRID'dir ve maskeden gelir — kodda
 * üretilmez, değiştirilmez.
 *
 * CLAUDE.md performans kuralı: "aynı anda en fazla BİR WebGL sahnesi
 * çalışır; ekrandan çıkınca durur." Bu sahne de güneş sistemiyle aynı
 * kilidi (acquireSceneLock) kullanır — bkz. HibridWebGL bileşeni.
 */

/** Maske görselinin gerçek boyutları — CLS'i önlemek için sabit. */
export const MASK_WIDTH = 1920;
export const MASK_HEIGHT = 528;
/**
 * Harflerin üstünde/altında bırakılan pay: smear ve swirl harf sınırının
 * dışına taşabildiği için kırpılmasın diye. Referanstaki `verticalPadding`.
 */
export const MASK_PADDING = 30;
/** Canvas kutusunun en-boy oranı (padding dahil). */
export const STAGE_ASPECT = MASK_WIDTH / (MASK_HEIGHT + MASK_PADDING * 2);

const VERTEX_SHADER = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;

uniform sampler2D u_textMask;
uniform vec3 u_colorPalette[4];
uniform float u_time;
uniform float u_choppyTime;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec2 u_velocity;
uniform float u_intensity;
uniform float u_imageScale;
uniform float u_imageOffset;

varying vec2 v_texCoord;

const float shimmerIntensity = 3.0;
const float angleVariance = 0.8;
const float waveGrainMix = 0.25;
const float staticGrainMix = 0.2;
const float liquidIntensity = 10.0;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float flowNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
    vec2 aspectUV = v_texCoord * (u_resolution / u_resolution.y);
    vec2 aspectMouse = u_mouse * (u_resolution / u_resolution.y);

    float mouseDist = distance(aspectUV, aspectMouse);
    float mouseFalloff = smoothstep(0.8, 0.0, mouseDist);

    vec2 smear = u_velocity * mouseFalloff * u_intensity * 0.5;

    float curl = (v_texCoord.x - u_mouse.x) * u_velocity.y
               - (v_texCoord.y - u_mouse.y) * u_velocity.x;
    vec2 swirl = vec2(-u_velocity.y, u_velocity.x)
               * curl * mouseFalloff * 5.0;

    vec2 distortedUV = v_texCoord - smear + swirl;

    vec2 imageUV = distortedUV;
    imageUV.y = distortedUV.y * u_imageScale - u_imageOffset;

    float maskAlpha = 0.0;
    if (imageUV.x >= 0.0 && imageUV.x <= 1.0 &&
        imageUV.y >= 0.0 && imageUV.y <= 1.0) {
        maskAlpha = texture2D(u_textMask, imageUV).a;
    }

    if (maskAlpha < 0.01) discard;

    float grainScale = 300.0;
    vec2 grainUV = floor(aspectUV * grainScale) / grainScale;
    float baseGrain = hash(grainUV);
    float jitterGrain = hash(grainUV + u_choppyTime);

    float angle = flowNoise(vec2(u_time * 0.2)) * (angleVariance * 2.0) - angleVariance;
    float steeredY = distortedUV.y + (distortedUV.x * angle);

    float flow = flowNoise(distortedUV * liquidIntensity + u_time * 0.15);
    float wavePos = steeredY + (flow * 0.25);

    float periodicWave = smoothstep(0.3, 0.0, abs(mod(wavePos - u_time * 0.5, 4.0) - 0.5));

    float radialWavePos = (mouseDist * 6.0) - (u_time * 4.0) + (flow * 0.5);
    float radialWave = smoothstep(0.4, 0.0, abs(mod(radialWavePos, 2.0) - 0.2));
    radialWave *= mouseFalloff * u_intensity;

    float wave = clamp(periodicWave + radialWave, 0.0, 1.0);

    vec3 magenta = u_colorPalette[0];
    vec3 darkPink = u_colorPalette[3];
    vec3 highlight = vec3(1.0, 0.85, 0.98);

    vec3 color = mix(magenta, darkPink, v_texCoord.y + wave * 0.5);

    float combinedGrain = mix(baseGrain, jitterGrain, waveGrainMix);
    float shimmer = pow(combinedGrain, 4.0) * wave * shimmerIntensity;

    vec3 finalColor = color;
    finalColor *= (0.9 + baseGrain * 0.2);
    finalColor += highlight * shimmer;
    finalColor += (jitterGrain - 0.5) * staticGrainMix;

    gl_FragColor = vec4(finalColor, maskAlpha);
}
`;

function compile(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("HIBRID shader compile failed:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export interface HibridFrameState {
  time: number;
  mouseX: number;
  mouseY: number;
  velocityX: number;
  velocityY: number;
  intensity: number;
}

export interface HibridSceneHandle {
  /** Maske dokusu yüklendi mi — yüklenene kadar çizim yapılmaz. */
  isReady: () => boolean;
  renderFrame: (state: HibridFrameState) => void;
  resize: () => void;
  dispose: () => void;
}

/**
 * Sahneyi kurar. WebGL desteklenmiyorsa veya shader derlenmezse null
 * döner — çağıran taraf statik PNG yedeğini gösterir.
 *
 * @param onReady Maske dokusu yüklendiğinde çağrılır (canvas'ı görünür
 *   yapmak için; o ana kadar statik PNG görünür kalır).
 */
export function createHibridWordmarkScene(
  canvas: HTMLCanvasElement,
  maskUrl: string,
  onReady?: () => void,
): HibridSceneHandle | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: false,
    antialias: true,
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
    console.error("HIBRID program link failed:", gl.getProgramInfoLog(program));
    return null;
  }
  gl.useProgram(program);

  // Tam ekran quad: konum (x,y) + doku koordinatı (u,v), 16 bayt stride.
  const quad = new Float32Array([
    -1, -1, 0, 0,
    1, -1, 1, 0,
    -1, 1, 0, 1,
    1, 1, 1, 1,
  ]);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

  const aPosition = gl.getAttribLocation(program, "a_position");
  const aTexCoord = gl.getAttribLocation(program, "a_texCoord");
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 16, 0);
  gl.enableVertexAttribArray(aTexCoord);
  gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 16, 8);

  const uniforms = {
    time: gl.getUniformLocation(program, "u_time"),
    colorPalette: gl.getUniformLocation(program, "u_colorPalette"),
    textMask: gl.getUniformLocation(program, "u_textMask"),
    resolution: gl.getUniformLocation(program, "u_resolution"),
    choppyTime: gl.getUniformLocation(program, "u_choppyTime"),
    mouse: gl.getUniformLocation(program, "u_mouse"),
    velocity: gl.getUniformLocation(program, "u_velocity"),
    intensity: gl.getUniformLocation(program, "u_intensity"),
    imageScale: gl.getUniformLocation(program, "u_imageScale"),
    imageOffset: gl.getUniformLocation(program, "u_imageOffset"),
  };

  // Referanstaki dikey palet: açık pembe → koyu magenta.
  gl.uniform3fv(
    uniforms.colorPalette,
    new Float32Array([
      0.95, 0.7, 0.9, 1.0, 0.3, 0.9, 0.93, 0.5, 0.95, 0.5, 0.0, 0.5,
    ]),
  );

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  let maskWidth = MASK_WIDTH;
  let maskHeight = MASK_HEIGHT;
  let ready = false;
  let disposed = false;

  const maskImage = new Image();
  maskImage.decoding = "async";
  maskImage.onload = () => {
    if (disposed) return;
    maskWidth = maskImage.naturalWidth || maskWidth;
    maskHeight = maskImage.naturalHeight || maskHeight;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, maskImage);
    ready = true;
    onReady?.();
  };
  maskImage.onerror = () => {
    console.error("HIBRID mask image could not be loaded:", maskUrl);
  };
  maskImage.src = maskUrl;

  /**
   * Canvas'ın çizim tamponunu CSS kutusuna göre ayarlar. Referans
   * uygulama tamponu maskenin piksel boyutuna (1920x588) sabitliyordu;
   * burada gerçek görüntüleme boyutu × DPR kullanılıyor — mobilde
   * gereksiz piksel doldurulmuyor (CLAUDE.md performans bütçesi).
   * DPR retina için 2'ye kadar destekleniyor, üstü sınırlanıyor.
   */
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  resize();

  return {
    isReady: () => ready,
    renderFrame(state: HibridFrameState) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (!ready) return;

      const designHeight = maskHeight + MASK_PADDING * 2;
      gl.uniform1f(uniforms.time, state.time);
      // 24 fps kesikli grain — referanstaki "choppy" zamanlama.
      gl.uniform1f(uniforms.choppyTime, Math.floor(24 * state.time) / 24);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform2f(uniforms.mouse, state.mouseX, state.mouseY);
      gl.uniform2f(uniforms.velocity, state.velocityX, state.velocityY);
      gl.uniform1f(uniforms.intensity, state.intensity);
      gl.uniform1f(uniforms.imageScale, designHeight / maskHeight);
      gl.uniform1f(uniforms.imageOffset, MASK_PADDING / maskHeight);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uniforms.textMask, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    resize,
    dispose() {
      disposed = true;
      maskImage.onload = null;
      maskImage.onerror = null;
      // Yükleme sürüyorsa iptal et — kopan istek bellekte tutulmasın.
      maskImage.src = "";
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
