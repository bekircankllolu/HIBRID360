/**
 * HOME-05 "Az Laf, Çok İş" — metin hiyerarşisi kuralları.
 *
 * 19 Eylül 2026 kullanıcı geri bildirimi: *"metinlerin şeklini sevmiyorum,
 * çok sıkışık ve amatörce gözüküyor... tipografi ve tasarım anlamında çok
 * profesyonel gözükecek bir şey çalışalım, global ölçekte öne çıkan."*
 *
 * Eski kompozisyon müşterinin referans PDF'ine piksel piksel ölçülmüştü:
 * üç dar sütun (%47.7 / %46.6 / %51.3) kademeli iniyor, her maddenin
 * satırları veriye elle gömülü `\n`'lerle kırılıyordu. Sıkışıklığın kaynağı
 * buydu — 1440px'te metin sütunu 633px, punto 21px, satırlar zorlanmış.
 * Bu modül o kırılımların yerine TEK bir tipografik kural koyuyor: her
 * maddenin açılış cümlesi büyük, gerisi gövde puntosunda akar.
 *
 * Kural neden burada: iki dilde de çalışması gerekiyor ve metinlerin
 * noktalaması farklı (TR maddeleri `;` ve `:` kullanıyor, EN maddeleri tek
 * uzun cümle). Bileşenin içinde bir regex olarak kalsaydı sessizce yanlış
 * yerden bölebilirdi; burada testi var.
 */

/** Açılış cümlesinin üst sınırı. Bunu aşarsa daha erken bir virgülden bölünür. */
const LEAD_MAX = 100;

/** Virgülden bölmeye ancak bu kadar karakterden sonra izin verilir. */
const LEAD_MIN = 28;

export interface LessTalkParts {
  /** Büyük puntoda çıkan açılış. Her zaman dolu. */
  lead: string;
  /** Gövde puntosunda akan kalan. Açılış tüm metniyse boş. */
  rest: string;
}

/**
 * Maddeyi "açılış + gerisi" olarak ikiye ayırır.
 *
 * Sıra:
 *   1. İlk cümle/ibare sonu (`.`, `;`, `:`) — doğal ve en okunaklı bölme.
 *   2. O sınır yoksa ya da {@link LEAD_MAX} karakteri aşıyorsa: sınırın
 *      içinde kalan SON virgül.
 *   3. O da yoksa: sınırın içinde kalan son kelime boşluğu.
 *   4. Hiçbiri yoksa metnin tamamı açılış olur, `rest` boş kalır.
 *
 * Veriye gömülü satır sonları (`\n`) burada düşer: yeni yerleşimde satırlar
 * sütun genişliğine göre doğal sarıyor.
 */
export function splitLead(paragraph: string): LessTalkParts {
  const flat = paragraph.replace(/\s+/g, " ").trim();
  if (flat.length === 0) return { lead: "", rest: "" };

  const sentenceEnd = findSentenceEnd(flat);
  if (sentenceEnd > 0 && sentenceEnd <= LEAD_MAX) {
    return cut(flat, sentenceEnd);
  }

  const comma = lastIndexWithin(flat, ",", LEAD_MAX);
  if (comma >= LEAD_MIN) return cut(flat, comma + 1);

  const space = lastIndexWithin(flat, " ", LEAD_MAX);
  if (space >= LEAD_MIN) return cut(flat, space);

  return { lead: flat, rest: "" };
}

/**
 * İlk cümle/ibare sonunun (noktalama DAHİL) bittiği indeks; yoksa -1.
 *
 * Kapanış tırnağı ve parantez noktalamadan sonra gelebiliyor (EN 3.
 * maddesi: `rebranding "your brand".`) — onlar da açılışa katılır, yoksa
 * gerisi tırnakla başlar.
 */
function findSentenceEnd(text: string): number {
  const match = /[.;:]["'”’)\]]*/.exec(text);
  return match ? match.index + match[0].length : -1;
}

/** `needle`in `limit` indeksini aşmayan son geçtiği yer; yoksa -1. */
function lastIndexWithin(text: string, needle: string, limit: number): number {
  return text.lastIndexOf(needle, limit);
}

function cut(text: string, at: number): LessTalkParts {
  return { lead: text.slice(0, at).trim(), rest: text.slice(at).trim() };
}
