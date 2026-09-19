"use client";

import type { CSSProperties, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useScrollScene } from "@/hooks/useScrollScene";
import { splitLead } from "./less-talk";
import styles from "./LessTalk.module.css";

/**
 * HOME-05 — 3. ekran açılış metni. Kaynak metin: mevcut site, deck'te
 * "özne–yüklem, noktalama, marka yazımı" düzeltilmiş hâliyle verilmiş.
 * Metne DOKUNULMUYOR (CLAUDE.md: "SİTEYE GİRECEK METİN" kutuları birebir);
 * değişen yalnız o metnin tipografisi ve yerleşimi.
 *
 * ## 19 Eylül 2026 — yeniden tasarım
 *
 * Kullanıcı: *"metinlerin şeklini sevmiyorum, çok sıkışık ve amatörce
 * gözüküyor... tipografi ve tasarım anlamında çok profesyonel gözükecek bir
 * şey çalışalım, global ölçekte öne çıkan bir tasarım olması lazım. 01 02 03
 * üzerine geldiğimiz zaman biraz daha hareketli olur. Ekranın dışından
 * çizgiler gelir, ortada birleşir, sonra dağılır, üzerinde yazılar çıkar —
 * eğlenceli olması lazım."*
 *
 * Bu, bölümün önceki hâlini bilinçli olarak GEÇERSİZ KILIYOR: o kompozisyon
 * müşterinin referans PDF'ine piksel piksel ölçülmüştü (üç kademeli dar
 * sütun, veriye gömülü `\n` satır kırılımları, her metnin altında sarı
 * çizgi). Sıkışıklığın kaynağı da oydu — 1440px'te metin sütunu 633px'e
 * düşüyor, 21px punto zorlanmış satırlara bölünüyordu. Referans yerleşimi
 * değiştiren karar kullanıcıya ait; ölçüm notları artık geçerli değil.
 *
 * Yeni kompozisyon:
 * - Tam genişlik editoryal satırlar, sütun kademesi yok. Her madde bir
 *   şerit: solda iri kontur numara, sağda iki kademeli metin.
 * - İki punto kademesi: açılış cümlesi iri, gerisi gövde puntosunda
 *   ({@link splitLead} — kuralı ve testi `less-talk.ts` içinde).
 * - Satır kırılımı veriden değil, ölçüden (`--measure-*`): metin her
 *   genişlikte kendi doğal akışında sarıyor.
 *
 * ## Hareket
 * Hepsi kaydırmaya bağlı (`useScrollScene`, IntersectionObserver kapılı,
 * rAF ile birleştirilmiş pasif dinleyici). Yeni kütüphane ve yeni WebGL
 * sahnesi yok. `prefers-reduced-motion` açıkken hiçbir dönüşüm uygulanmaz.
 *
 * Başlık sahnesi kullanıcının tarif ettiği koreografi: hairline'lar ekranın
 * iki yanından girer (0 → .42), ortada tek bir demet hâlinde toplanır, yazı
 * onun üstünde belirir (.34 → .52), sonra demet dikeyde açılıp söner
 * (.5 → 1). Ölçüler CSS'te `--progress`'ten türetiliyor.
 */

/** Başlık sahnesindeki hairline sayısı. Tek sayı: ortada bir çizgi kalır. */
const RAY_COUNT = 9;

/**
 * Başlığı satırlara böler. Deck metnine dokunulmaz — yalnızca çizim için
 * virgülden ayrılır ve virgül görselde düşürülür:
 *   "Less Talk, More Work" → ["Less Talk", "More Work"]
 *   "Az Laf, Çok İş"       → ["Az Laf", "Çok İş"]
 *
 * Büyük harf CSS'te (`text-transform`), metinde değil. Erişilebilir ad
 * h2'nin `aria-label`'ında özgün hâliyle duruyor — ekran okuyucu ve arama
 * motoru virgüllü, doğru büyük/küçük harfli cümleyi okumaya devam eder.
 */
function splitTitleIntoLines(title: string): string[] {
  return title
    .split(",")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
}

/**
 * Madde yuvası — kendi scroll sahnesi. Maddeler sayfada farklı
 * yüksekliklerde durduğu için tek bir bölüm ilerlemesi alttaki maddeyi
 * ekrana girmeden "bitirmiş" ya da ekrandayken hâlâ gizli tutuyordu; her
 * madde kendi `--progress`'iyle, ekrana girdiği anda belirir.
 */
function RevealSlot({ children }: { children: ReactNode }) {
  const { ref, motion } = useScrollScene<HTMLLIElement>({ mode: "pass" });
  return (
    <li ref={ref} className={styles.itemSlot} data-motion={motion}>
      {children}
    </li>
  );
}

export function LessTalk() {
  const t = useTranslations("home.lessTalk");
  const paragraphs = t.raw("paragraphs") as string[];
  const title = t("title");
  const titleLines = splitTitleIntoLines(title);
  const { ref: sceneRef, motion: sceneMotion } = useScrollScene<HTMLDivElement>({
    mode: "pass",
  });

  return (
    <section className={styles.section} aria-labelledby="less-talk-title">
      <div ref={sceneRef} className={styles.titleScene} data-motion={sceneMotion}>
        {/* Koreografinin çizgi katmanı. Tamamen dekoratif: ekran okuyucuya
            hiçbir şey söylemiyor, imleci de yakalamıyor. */}
        <div className={styles.rays} aria-hidden="true">
          {Array.from({ length: RAY_COUNT }, (_, index) => (
            <i key={index} style={{ "--n": index } as CSSProperties} />
          ))}
        </div>

        {/* Görünen satırlar virgülsüz ve büyük harf; erişilebilir ad
            deck'teki özgün cümle. */}
        <h2 id="less-talk-title" className={styles.title} aria-label={title}>
          {titleLines.map((line) => (
            <span className={styles.titleLine} key={line} aria-hidden="true">
              <span className={styles.titleMark}>{line}</span>
            </span>
          ))}
        </h2>
      </div>

      <ol className={styles.body}>
        {paragraphs.map((paragraph, index) => {
          const { lead, rest } = splitLead(paragraph);
          return (
            <RevealSlot key={index}>
              <article className={styles.item}>
                <span className={styles.index} aria-hidden="true">
                  0{index + 1}
                </span>
                <p className={styles.itemText}>
                  <span className={styles.lead}>{lead}</span>
                  {rest ? <span className={styles.rest}>{rest}</span> : null}
                </p>
                {/* Satır üzerinde imleç gezerken soldan sağa akan sarı
                    hairline. Dekoratif; içeriğin taşıyıcısı değil. */}
                <span className={styles.sweep} aria-hidden="true" />
              </article>
            </RevealSlot>
          );
        })}
      </ol>
    </section>
  );
}
