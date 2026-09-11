/**
 * MONA "sıradaki soru" önerileri — saf fonksiyon.
 *
 * Soru kütüphanesi iki gruptan oluşur: ilk `generalCount` soru Hibrid 360,
 * kalanlar AI & hibrit prodüksiyon. Öneri sırası: aynı grupta sıradaki
 * sorulmamış soru, diğer gruptan ilk sorulmamış soru, sonra aynı gruptan bir
 * sonraki. Hepsi sorulmuşsa sorulmuşlardan tamamlanır — pill alanı boş kalmaz.
 */

export const MONA_GENERAL_COUNT = 18;

export function suggestNext(
  ids: readonly string[],
  activeId: string | null,
  visited: ReadonlySet<string>,
  size = 3,
  generalCount = MONA_GENERAL_COUNT,
): string[] {
  const general = ids.slice(0, generalCount);
  const ai = ids.slice(generalCount);
  const picks: string[] = [];
  const add = (id: string | undefined) => {
    if (id && id !== activeId && !picks.includes(id) && picks.length < size) picks.push(id);
  };
  const fresh = (id: string) => !visited.has(id) && id !== activeId && !picks.includes(id);
  const nextIn = (group: string[], from: number) => {
    for (let step = 1; step <= group.length; step++) {
      const id = group[(from + step) % group.length];
      if (fresh(id)) return id;
    }
    return undefined;
  };

  const activeIndex = activeId ? ids.indexOf(activeId) : -1;
  if (activeIndex < 0) {
    add(nextIn(general, -1));
    add(nextIn(general, general.indexOf(picks[0] ?? general[0])));
    add(nextIn(ai, -1));
  } else {
    const inGeneral = activeIndex < generalCount;
    const same = inGeneral ? general : ai;
    const other = inGeneral ? ai : general;
    const position = inGeneral ? activeIndex : activeIndex - generalCount;
    add(nextIn(same, position));
    add(nextIn(other, -1));
    add(nextIn(same, same.indexOf(picks[0] ?? same[position])));
  }

  for (const id of ids) {
    if (picks.length >= size) break;
    if (fresh(id)) add(id);
  }
  for (const id of ids) {
    if (picks.length >= size) break;
    add(id);
  }
  return picks;
}
