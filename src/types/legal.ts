/**
 * Yasal/kurumsal sayfa içerik modeli.
 *
 * TR ve EN metinleri BİRBİRİNİN ÇEVİRİSİ DEĞİL — müşteriden teslim alınan
 * kurumsal politika paketindeki (HIBRID360_Corporate_Policies_Pack) iki
 * ayrı, kendi başına onaylı dokümandır (ör. Gizlilik Politikası TR ve
 * Privacy Policy EN, konu başlıkları aynı sırada ama cümleler bağımsız
 * yazılmış). Bu yüzden her locale kendi blok dizisini taşır — zorla
 * eşleştirme yapılmaz.
 */

export type LegalBlock =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] }
  /** Vurgulu kutu — kaynak dokümanda ayrı bir kutu/tablo olarak duran taahhüt cümleleri. */
  | { kind: "callout"; text: string }
  | { kind: "table"; headers: string[]; rows: string[][] };

export interface LegalDoc {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  /** LEG-01/02/03 — sadeleştirilmiş açılış paragrafı, hukuk metninden önce. */
  intro?: string;
  blocks: LegalBlock[];
}
