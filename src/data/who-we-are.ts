/**
 * Who We Are — kurucu kaydı (CUL-03/04).
 *
 * Fotoğraf henüz teslim edilmedi. Daha önce sayfada 160x200'lük boş bir
 * kutu ve içinde "Photo pending" yazısı vardı; bu bir geliştirme notunun
 * production arayüzüne sızmasıydı. Artık kurucu bölümü fotoğraf olmadan
 * **tipografik** çalışıyor: boş çerçeve de, bekleme metni de yok.
 *
 * Fotoğraf geldiğinde tek değişiklik aşağıdaki `portrait` alanını
 * doldurmaktır — sayfa kodu değişmez, düzen kendiliğinden portreli
 * varyanta geçer:
 *
 *   portrait: {
 *     src: "/images/site/culture/founder.webp",
 *     alt: "Zühre Didem Gödek portresi",
 *     width: 640,
 *     height: 800,
 *   }
 *
 * Ölçüler CLS'i sıfırda tutmak için zorunlu (CLAUDE.md performans
 * bütçesi); dosya WebP/AVIF olmalı.
 */
export interface FounderPortrait {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Founder {
  name: string;
  /** Marka dili — iki dilde de aynı, çevrilmez. */
  title: string;
  /** Varlık teslim edilene kadar tanımsız. */
  portrait?: FounderPortrait;
}

export const FOUNDER: Founder = {
  name: "ZÜHRE DİDEM GÖDEK",
  title: "PRESIDENT & CCO",
};
