import { SERVICE_CATALOG } from "@/data/services";

/**
 * Service Chapter 360° derece sistemi (DECISIONS #33,
 * docs/design/SERVICE_CHAPTER_SYSTEM.md §2).
 *
 * "Her servis aynı çemberin bir derecesi": katalogdaki servisler çemberi
 * eşit dilimlere böler (8 servis → 45°). Derece ayrı bir alan olarak
 * SAKLANMAZ, katalog sırasından türetilir — sıra zaten `services.test.ts`
 * ile kilitli, ikinci bir kaynak onunla sessizce ayrışabilirdi.
 *
 * Sitenin imleci fuşya bir "°" (DEC #3); derece dili oradan geliyor.
 */

export interface Chapter {
  id: string;
  /** Marka dili — iki dilde de aynı (Creative, Production …). */
  name: string;
  /** Locale öneki olmadan canonical rota. */
  href: string;
  /** 0 ≤ degree < 360. */
  degree: number;
}

const FULL_TURN = 360;

function indexOf(id: string): number {
  const index = SERVICE_CATALOG.findIndex((service) => service.id === id);
  // Yanlış yazılmış bir kimlik build sırasında patlamalı; sessizce 000°
  // basan bir sayfa, derece sisteminin kendisini yalanlar.
  if (index === -1) {
    throw new Error(`service-chapter: katalogda olmayan servis kimliği "${id}"`);
  }
  return index;
}

function toChapter(index: number): Chapter {
  const { id, name, href } = SERVICE_CATALOG[index];
  return { id, name, href, degree: (index * FULL_TURN) / SERVICE_CATALOG.length };
}

export function chapterOf(id: string): Chapter {
  return toChapter(indexOf(id));
}

export function chapterDegree(id: string): number {
  return chapterOf(id).degree;
}

/** Sıradaki servis; son servisten sonra çember başa döner. */
export function nextChapter(id: string): Chapter {
  return toChapter((indexOf(id) + 1) % SERVICE_CATALOG.length);
}

/**
 * "000°" biçimi. Font alt kümesinde `tnum` olmadığı için rakamlar
 * orantılı; üç hane sabit tutulunca yine de tek bir göz ritmi oluşuyor.
 */
export function formatDegree(degree: number): string {
  const normalized = ((Math.round(degree) % FULL_TURN) + FULL_TURN) % FULL_TURN;
  return `${String(normalized).padStart(3, "0")}°`;
}
