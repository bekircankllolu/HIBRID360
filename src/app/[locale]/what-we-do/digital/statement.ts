import type { Locale } from "@/i18n/routing";

/**
 * Digital pilotu — iki tonlu statement bölücü (bkz. plan §Pilot 1).
 *
 * Mesaj dosyalarına (src/messages/*.json) DOKUNULMUYOR. Sönük olacak baştaki
 * öbek burada locale başına TAM SABİT olarak tutulur; cümlenin kendisi mesaj
 * dosyasından gelir. Bölme yalnızca metin bu sabitle başlıyorsa yapılır —
 * metin ileride değişirse eşleşme kaybolur, tam metin normal render edilir,
 * kırık markup veya yarım cümle asla ekrana çıkmaz.
 *
 * Sabitler locale'e özgü çünkü söz dizimi farklı: İngilizcede özne+yüklem
 * baştadır ("We build"), Türkçede yüklem sonda olduğu için sönük kısım daha
 * uzun bir öbek olarak baştan alınır. İngilizcedeki bölünmeyi Türkçeye
 * birebir kopyalamak anlamı bozar.
 */
const STATEMENT_LEAD: Record<Locale, string> = {
  en: "We build ",
  tr: "İnsanların içinde dolaşabileceği ",
};

export interface StatementSplit {
  lead: string;
  rest: string;
}

/**
 * Metni locale'in sabit baş öbeğinden böler. `lead + rest === text` yapıca
 * garantidir (rest, lead uzunluğu kadar kaydırılmış bir slice'tır).
 * Metin sabitle başlamıyorsa veya kalan kısım boşsa null döner; çağıran
 * taraf o durumda tam metni normal gösterir.
 */
export function splitStatementLead(
  text: string,
  locale: Locale,
): StatementSplit | null {
  const lead = STATEMENT_LEAD[locale];
  if (!text.startsWith(lead)) return null;

  const rest = text.slice(lead.length);
  if (rest.length === 0) return null;

  return { lead, rest };
}
