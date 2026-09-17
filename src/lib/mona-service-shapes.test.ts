import { describe, expect, it } from "vitest";
import { createParticleCloud, LAYER } from "./mona-dots-geometry";
import { serviceShapeTargets, type MonaServiceShape } from "./mona-service-shapes";

const shapes: MonaServiceShape[] = ["lotus", "aperture", "timeline", "cursor", "broadcast", "cloud", "stage"];

describe("serviceShapeTargets", () => {
  const cloud = createParticleCloud({ seed: 23, shell: 240, core: 120, halo: 40, dust: 20, haze: 10 });

  it.each(shapes)("creates a finite target for %s", (shape) => {
    const target = serviceShapeTargets(cloud, shape);
    expect(target).toHaveLength(cloud.count * 3);
    expect(Array.from(target).every(Number.isFinite)).toBe(true);
  });

  it("is deterministic and produces distinct service silhouettes", () => {
    const first = serviceShapeTargets(cloud, "aperture", 7);
    expect(Array.from(serviceShapeTargets(cloud, "aperture", 7))).toEqual(Array.from(first));
    expect(Array.from(serviceShapeTargets(cloud, "timeline", 7))).not.toEqual(Array.from(first));
  });

  it("leaves halo, dust and haze points in their original positions", () => {
    const target = serviceShapeTargets(cloud, "broadcast");
    for (let index = 0; index < cloud.count; index += 1) {
      const layer = cloud.meta[index * 4 + 2];
      if (layer === LAYER.shell || layer === LAYER.core) continue;
      expect(Array.from(target.slice(index * 3, index * 3 + 3))).toEqual(
        Array.from(cloud.positions.slice(index * 3, index * 3 + 3)),
      );
    }
  });
});
