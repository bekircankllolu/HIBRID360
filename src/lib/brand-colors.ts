/**
 * Marka renklerini CSS custom property'lerden okur.
 *
 * CLAUDE.md çalışma kuralı: "Marka renklerinin dışında hardcoded hex
 * kullanılmaz — CSS custom properties üzerinden çalışılır." WebGL shader'ı
 * CSS değişkeni okuyamadığı için renkler burada tek noktadan okunup
 * uniform olarak aktarılır; kaynak yine src/styles/tokens.css.
 */

export type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  const clean = hex.trim().replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const value = Number.parseInt(full, 16);
  return [
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  ];
}

export function readBrandColor(name: string, fallback: Rgb): Rgb {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
  if (!raw) return fallback;
  try {
    return hexToRgb(raw);
  } catch {
    return fallback;
  }
}
