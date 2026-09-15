import { LAYER, type ParticleCloud } from "./mona-dots-geometry";
import { LOTUS_DENSITY } from "./mona-lotus-density";
import { lotusTargets } from "./mona-lotus";

export type MonaServiceShape =
  | "lotus"
  | "aperture"
  | "timeline"
  | "cursor"
  | "broadcast"
  | "cloud"
  | "stage";

function seeded(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function pointFor(shape: Exclude<MonaServiceShape, "lotus">, random: () => number) {
  const angle = random() * Math.PI * 2;
  const depth = (random() - 0.5) * 0.12;

  if (shape === "aperture") {
    const blade = Math.floor(random() * 7);
    const radius = 0.35 + random() * 0.6;
    const twist = angle + blade * (Math.PI / 3) + radius * 0.55;
    return [Math.cos(twist) * radius, Math.sin(twist) * radius, depth] as const;
  }

  if (shape === "timeline") {
    if (random() < 0.16) return [0.08 + (random() - 0.5) * 0.035, (random() - 0.5) * 1.65, depth] as const;
    const track = Math.floor(random() * 4);
    const width = 0.3 + random() * 0.58;
    const side = random() < 0.5 ? -1 : 1;
    return [side * width, 0.66 - track * 0.42 + (random() - 0.5) * 0.17, depth] as const;
  }

  if (shape === "cursor") {
    const y = -0.88 + random() * 1.76;
    const span = Math.max(0.08, (y + 0.9) * 0.45);
    const x = -0.65 + random() * span;
    if (random() < 0.28) return [x + 0.55, y * 0.18 - 0.55, depth] as const;
    return [x, y, depth] as const;
  }

  if (shape === "broadcast") {
    if (random() < 0.28) return [(random() - 0.5) * 0.08, -0.75 + random() * 1.25, depth] as const;
    const radius = 0.28 + Math.floor(random() * 3) * 0.25 + (random() - 0.5) * 0.035;
    const arc = (random() - 0.5) * Math.PI * 1.25;
    const side = random() < 0.5 ? -1 : 1;
    return [side * Math.abs(Math.cos(arc)) * radius, Math.sin(arc) * radius + 0.05, depth] as const;
  }

  if (shape === "cloud") {
    if (random() < 0.24) {
      const y = (random() - 0.5) * 0.62;
      const span = 0.44 - y * 0.2;
      return [0.05 + random() * span, y, depth] as const;
    }
    const lobes = [[-0.43, -0.08, 0.42], [0, 0.18, 0.55], [0.48, -0.02, 0.38]] as const;
    const [cx, cy, radius] = lobes[Math.floor(random() * lobes.length)];
    const r = Math.sqrt(random()) * radius;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, depth] as const;
  }

  if (random() < 0.28) {
    const x = -0.9 + random() * 1.8;
    return [x, 0.68 + (random() - 0.5) * 0.1, depth] as const;
  }
  if (random() < 0.34) {
    const side = random() < 0.5 ? -1 : 1;
    return [side * (0.72 + (random() - 0.5) * 0.07), -0.05 + (random() - 0.5) * 1.45, depth] as const;
  }
  const side = random() < 0.5 ? -1 : 1;
  const y = 0.55 - random() * 1.2;
  return [side * (0.2 + (0.65 - y) * 0.36), y, depth] as const;
}

export function serviceShapeTargets(
  cloud: Pick<ParticleCloud, "count" | "positions" | "meta">,
  shape: MonaServiceShape,
  seed = 1360,
): Float32Array {
  if (shape === "lotus") return lotusTargets(cloud, LOTUS_DENSITY, seed);

  const random = seeded(seed);
  const targets = new Float32Array(cloud.count * 3);
  for (let index = 0; index < cloud.count; index += 1) {
    const layer = cloud.meta[index * 4 + 2];
    if (layer !== LAYER.shell && layer !== LAYER.core) {
      targets.set(cloud.positions.subarray(index * 3, index * 3 + 3), index * 3);
      continue;
    }
    const [x, y, z] = pointFor(shape, random);
    const scale = layer === LAYER.shell ? 1 : 0.92;
    targets[index * 3] = x * scale;
    targets[index * 3 + 1] = y * scale;
    targets[index * 3 + 2] = z;
  }
  return targets;
}
