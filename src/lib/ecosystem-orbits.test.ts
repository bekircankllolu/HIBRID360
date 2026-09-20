import { describe, expect, it } from "vitest";
import { orbitStones } from "@/data/solar-system";
import { cameraEye, lookAt, multiply, perspective, projectToScreen } from "@/lib/solar-orbits";
import {
  ECO_BODIES,
  ECO_CAMERA,
  ECO_FOV,
  ECO_RING_RADII,
  bodyPosition,
  buildDecor,
  ecosystemFocusDistance,
  ecosystemPosition,
  ecosystemRingPoints,
  parallaxAngle,
  ringSpeed,
  swayYaw,
} from "@/lib/ecosystem-orbits";

const length = (p: readonly [number, number, number]) => Math.hypot(p[0], p[1], p[2]);

describe("ecosystem rings", () => {
  it("halka yarıçapları artan sırada (eşmerkezli)", () => {
    for (let i = 1; i < ECO_RING_RADII.length; i++) {
      expect(ECO_RING_RADII[i]).toBeGreaterThan(ECO_RING_RADII[i - 1]);
    }
  });

  it("her nokta merkezden tam halka yarıçapı kadar uzakta (eğim düzlemi bozmaz)", () => {
    for (const [ring, radius] of ECO_RING_RADII.entries()) {
      for (const angle of [0, 1, 2.5, 4, 6]) {
        expect(length(ecosystemPosition(ring, angle))).toBeCloseTo(radius, 6);
      }
    }
  });

  it("halka noktaları kapalı döngü oluşturacak kadar örneklenmiş", () => {
    const points = ecosystemRingPoints(3, 128);
    expect(points.length).toBe(128 * 3);
    // İlk ve son nokta komşu (aynı değil): döngü kapatmayı çağıran yapar.
    const first = [points[0], points[1], points[2]] as const;
    const last = [points[127 * 3], points[127 * 3 + 1], points[127 * 3 + 2]] as const;
    expect(Math.hypot(first[0] - last[0], first[1] - last[1], first[2] - last[2])).toBeLessThan(0.5);
  });

  it("iç halkalar dış halkalardan hızlı döner", () => {
    for (let i = 1; i < ECO_RING_RADII.length; i++) {
      expect(ringSpeed(i)).toBeLessThan(ringSpeed(i - 1));
    }
    // Sakin: iç halkanın turu en az 30 sn.
    expect((Math.PI * 2) / ringSpeed(0)).toBeGreaterThan(30);
  });
});

describe("ECO_BODIES", () => {
  it("sekiz tıklanabilir küre, orbitStones ile aynı sıra ve sayıda", () => {
    expect(ECO_BODIES).toHaveLength(8);
    expect(ECO_BODIES).toHaveLength(orbitStones.length);
    ECO_BODIES.forEach((body, index) => {
      // orbitStones.href son parçası hizmet kimliği: /what-we-do/<id>
      expect(orbitStones[index].href.endsWith(`/${body.id}`)).toBe(true);
    });
  });

  it("tüm küreler geçerli halkada, HUD kodları benzersiz üç haneli", () => {
    const codes = new Set<number>();
    for (const body of ECO_BODIES) {
      expect(body.ring).toBeGreaterThanOrEqual(0);
      expect(body.ring).toBeLessThan(ECO_RING_RADII.length);
      expect(body.hud).toBeGreaterThanOrEqual(100);
      expect(body.hud).toBeLessThanOrEqual(999);
      codes.add(body.hud);
    }
    expect(codes.size).toBe(ECO_BODIES.length);
  });

  it("konum zamanla halka üzerinde ilerler", () => {
    const a = bodyPosition(ECO_BODIES[0], 0);
    const b = bodyPosition(ECO_BODIES[0], 10);
    expect(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])).toBeGreaterThan(0.1);
    expect(length(b)).toBeCloseTo(ECO_RING_RADII[ECO_BODIES[0].ring], 6);
  });
});

describe("buildDecor", () => {
  it("tohumlu: iki çağrı aynı dizilimi verir (kararlı ekran görüntüleri)", () => {
    expect(buildDecor(true)).toEqual(buildDecor(true));
  });

  it("orta kalitede toz küreler çıkarılır", () => {
    expect(buildDecor(false).length).toBeLessThan(buildDecor(true).length);
  });

  it("her süs küre geçerli halkada ve makul boyutta", () => {
    for (const item of buildDecor(true)) {
      expect(item.ring).toBeLessThan(ECO_RING_RADII.length);
      expect(item.radius).toBeGreaterThan(0.03);
      expect(item.radius).toBeLessThan(0.6);
    }
  });
});

describe("kamera", () => {
  it("odak mesafesi küre yarıçapıyla orantılı ve pozitif", () => {
    expect(ecosystemFocusDistance(0.2)).toBeGreaterThan(0);
    expect(ecosystemFocusDistance(0.4)).toBeCloseTo(2 * ecosystemFocusDistance(0.2), 6);
    // Küre ekran yüksekliğinin ~%19'u: çap / görüş yüksekliği.
    const d = ecosystemFocusDistance(0.3);
    const ratio = 0.6 / (2 * d * Math.tan(ECO_FOV / 2));
    expect(ratio).toBeCloseTo(0.19, 6);
  });

  it("yaw salınımı sınırlı: kompozisyon dönüp gitmez", () => {
    for (let t = 0; t < 400; t += 7) {
      expect(Math.abs(swayYaw(t) - ECO_CAMERA.yaw)).toBeLessThanOrEqual(ECO_CAMERA.swayAmplitude + 1e-9);
    }
  });
});

describe("kadraj güvencesi", () => {
  const W = 1280;
  const project = (aspect: number, yaw: number, point: readonly [number, number, number]) => {
    const H = W / aspect;
    // Bileşendeki gibi dar ekranda kamera geri çekilir.
    const fit = Math.max(1, 1.45 / aspect);
    const camera = {
      target: ECO_CAMERA.target,
      distance: ECO_CAMERA.distance * fit,
      yaw,
      pitch: ECO_CAMERA.pitch,
    };
    const view = lookAt(cameraEye(camera), camera.target);
    const viewProjection = multiply(perspective(ECO_FOV, aspect, 0.1, 400), view);
    return { screen: projectToScreen(viewProjection, point, W, H), W, H };
  };

  it("izdüşüm sağlaması: bakılan nokta ekranın tam ortasına düşer", () => {
    const { screen, W: w, H: h } = project(16 / 9, ECO_CAMERA.yaw, ECO_CAMERA.target);
    expect(screen.x).toBeCloseTo(w / 2, 0);
    expect(screen.y).toBeCloseTo(h / 2, 0);
  });

  it("negatif kontrol: dış halkadaki (5) bir küre bir noktada kadraj dışına taşar — bu yüzden tıklanabilir küre taşımaz", () => {
    const outer = { ring: 5, phase: 0 };
    const period = (Math.PI * 2) / ringSpeed(5);
    let leftFrame = false;
    for (let k = 0; k < 90; k++) {
      const { screen, W: w, H: h } = project(16 / 9, ECO_CAMERA.yaw, bodyPosition(outer, (k / 90) * period));
      if (!screen.visible || screen.x < 8 || screen.x > w - 8 || screen.y < 8 || screen.y > h - 8) leftFrame = true;
    }
    expect(leftFrame).toBe(true);
  });

  it("sekiz tıklanabilir küre tüm yörüngeleri boyunca (her yaw, her en-boy oranı) kadrajda kalır", () => {
    for (const aspect of [16 / 9, 16 / 10, 4 / 3, 1]) {
      for (const yaw of [ECO_CAMERA.yaw - ECO_CAMERA.swayAmplitude, ECO_CAMERA.yaw, ECO_CAMERA.yaw + ECO_CAMERA.swayAmplitude]) {
        for (const body of ECO_BODIES) {
          // Bir tam tur: en yavaş halkanın periyodu boyunca örnekle.
          const period = (Math.PI * 2) / ringSpeed(body.ring);
          for (let k = 0; k < 90; k++) {
            const p = bodyPosition(body, (k / 90) * period);
            const { screen, W: w, H: h } = project(aspect, yaw, p);
            expect(screen.visible).toBe(true);
            expect(screen.x, `${body.id} x @${aspect.toFixed(2)}`).toBeGreaterThan(8);
            expect(screen.x, `${body.id} x @${aspect.toFixed(2)}`).toBeLessThan(w - 8);
            expect(screen.y, `${body.id} y @${aspect.toFixed(2)}`).toBeGreaterThan(8);
            expect(screen.y, `${body.id} y @${aspect.toFixed(2)}`).toBeLessThan(h - 8);
          }
        }
      }
    }
  });
});

describe("kaydırma paralaksı", () => {
  it("aşağı kaydırınca (parallax>0) açı NEGATİF: yıldızlar sayfadan geri kalır", () => {
    expect(parallaxAngle(0.5)).toBeLessThan(0);
    expect(parallaxAngle(-0.5)).toBeGreaterThan(0);
    expect(Math.abs(parallaxAngle(0))).toBe(0);
  });

  it("açı sınırlı ve orantılı; taşan girdi kırpılır", () => {
    expect(parallaxAngle(5)).toBeCloseTo(parallaxAngle(1), 12);
    expect(parallaxAngle(-5)).toBeCloseTo(parallaxAngle(-1), 12);
    expect(parallaxAngle(0.5)).toBeCloseTo(parallaxAngle(1) / 2, 12);
    // Bir ekran boyu kaydırmada ~%12'lik geri kalma: 0.05..0.2 rad aralığı.
    expect(Math.abs(parallaxAngle(1))).toBeGreaterThan(0.05);
    expect(Math.abs(parallaxAngle(1))).toBeLessThan(0.2);
  });
});
