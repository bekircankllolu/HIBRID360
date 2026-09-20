"use client";

import { Fragment } from "react";
import { useScrambleReveal } from "@/hooks/useScrambleReveal";
import styles from "./ScrambleLine.module.css";

/**
 * Karıştırma/çözülme efektini YER AÇARAK oynatan satır (DECISIONS #49'un
 * hareketini aynen korur, yalnız yerleşimini sabitler).
 *
 * SORUN (20 Eylül 2026, müşteri hatası): efekt her karede rastgele harfler
 * yazdığı için kelime genişliği kare kare değişiyor, başlık her karede
 * yeniden satır kırıyordu. Ölçülen sonuç: Creative sayfasında CLS 0.110
 * (TR) / 0.147 (EN) — sitenin en yüksek kayması; mobilde hero'nun
 * `min-height: 0` olması nedeniyle altındaki bütün blok da zıplıyordu.
 *
 * ÇÖZÜM: her KELİME için bir yuva. Yuvanın boyutunu gerçek kelimenin
 * görünmez bir kopyası ("hayalet") belirliyor, karışan harfler onun
 * üzerine mutlak konumla biniyor. Böylece:
 *   · satır kırılma noktaları ilk kareden itibaren nihai metninki,
 *   · yuva boyu hiç değişmiyor → kayma yok,
 *   · karışan harf nihai kelimeden genişse yalnız kendi yuvasından taşar,
 *     satırı yeniden akıtmaz.
 *
 * Karışan dize satırın TAMAMI için üretilip (soldan sağa çözülme sırası
 * korunsun diye) kelime sınırlarından dilimleniyor — `scrambleReveal`
 * uzunluğu ve boşlukları koruduğu için indeksler birebir tutuyor.
 *
 * YUVALAR YALNIZ ANİMASYON SÜRERKEN var; metin yerine oturduğu anda
 * (`display === text`: ilk render, hareket azaltma ve efekt bittikten
 * sonraki HER an) düz metne dönülüyor. Sebebi ölçüldü: yuva `inline-block`
 * yani "atomik" bir kutu, Chromium ise normalde eleman sınırlarını aşarak
 * biçimlendirme yapıyor — kelimeler ayrı kutulara girince kelimeler arası
 * kerning kayboluyor ve her boşluk 0.03em (1440px'de 4.3px) açılıyordu.
 * Böylece yüklenmiş/duruk hal, düzeltme öncesiyle piksel piksel aynı
 * kalıyor; yuvalar yalnız kayma riskinin olduğu ~0.5sn'de devreye giriyor.
 *
 * Erişilebilirlik: görünen her şey `aria-hidden` (hayalet kopya dahil);
 * gerçek metni ekran okuyucuya üst başlığın `aria-label`'ı veriyor
 * (bkz. ServiceTitle, CreativeTitle). Hayalet kopya ayrıca seçilemez —
 * metni kopyalayan kullanıcı kelimeyi iki kez almasın.
 */
export function ScrambleLine({
  text,
  active,
  delayMs = 0,
  durationMs = 800,
  className,
}: {
  text: string;
  active: boolean;
  delayMs?: number;
  durationMs?: number;
  className?: string;
}) {
  const display = useScrambleReveal(text, { active, delayMs, durationMs });

  if (display === text) {
    return (
      <span className={className} aria-hidden="true">
        {text}
      </span>
    );
  }

  const slots = splitWordSlots(text);

  return (
    <span className={className} aria-hidden="true">
      {slots.map(({ word, start }, index) => {
        const previous = slots[index - 1];
        const gapFrom = previous ? previous.start + previous.word.length : 0;
        return (
          <Fragment key={start}>
            {text.slice(gapFrom, start)}
            <span className={styles.slot}>
              <span className={styles.ghost}>{word}</span>
              <span className={styles.live}>{display.slice(start, start + word.length)}</span>
            </span>
          </Fragment>
        );
      })}
    </span>
  );
}

/** Metni kelimelere böler; her kelimenin özgün dizedeki başlangıcını korur. */
export function splitWordSlots(text: string): { word: string; start: number }[] {
  const slots: { word: string; start: number }[] = [];
  const pattern = /\S+/g;
  let match = pattern.exec(text);
  while (match !== null) {
    slots.push({ word: match[0], start: match.index });
    match = pattern.exec(text);
  }
  return slots;
}
