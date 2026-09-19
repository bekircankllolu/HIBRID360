import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/site";
import { BELIEF_IMAGES } from "@/data/what-we-believe";
import { CULTURE_INTRO, CULTURE_VALUES } from "@/data/culture-values";
import styles from "@/styles/culture-page.module.css";
import belief from "./page.module.css";

/**
 * WWB-01..06 (nihai copy deck, Ağustos 2026) — What We Believe.
 *
 * 29 Ağustos 2026 revizyonu: sayfa /culture/what-we-believe'den üst
 * menüdeki canonical /what-we-believe rotasına taşındı; eski yol kalıcı
 * olarak buraya yönlendiriliyor (next.config.mjs). İçerik değişmedi.
 *
 * 29 Ağustos 2026 revizyonu — görseller: müşteri Atatürk ve Küçük Prens
 * bölümlerinin korunmasını istedi. Eski sitenin anlatım yapısı geri
 * geldi: liste bloklarından sonra iki tam genişlik görsel bandı.
 *
 * ## 19 Eylül 2026 — sayfa yeniden tasarlandı
 *
 * Kullanıcı: *"What We Believe, tasarım anlamında çok güçlü olmamız
 * gereken sayfalardan biri. Buradaki fotoğrafların üzerinde sarı efekt
 * istemiyorum. Fotoğrafların üzerine gelen metinleri de farklı ele
 * alabiliriz. Altta bir video var, 'AI ile üretilmiş temsili görseldir'
 * diye — bu videoyu kaldırabiliriz."*
 *
 * Üç değişiklik:
 *
 * 1. SARI EFEKT KALKTI. Görseller nötr siyah-beyaz; gerekçe ve ölçüm
 *    src/data/what-we-believe.ts içinde.
 *
 * 2. METİN GÖRSELİN ÜSTÜNDEN İNDİ. Eskiden alttan yukarı koyulaşan bir
 *    perdenin içinde duruyordu — perde fotoğrafın alt üçte birini
 *    yutuyordu ve okunaklılık her kadrajda yeniden hesaplanması gereken
 *    bir riskti. Metin artık görselin ALTINDA, siyah bir şeritte: kadraj
 *    tam görünüyor, kontrast tanımı gereği garanti.
 *
 * 3. LİSTELER TİPOGRAFİK OLARAK YÜKSELDİ. Vizyon/Misyon maddeleri 14px
 *    Inter etiketleri olarak diziliyordu; sayfanın en iddialı cümleleri
 *    en küçük puntodaydı. Artık numaralı display satırları. Misyon
 *    maddelerindeki em-dash doğal bir eksen veriyor ("DOĞRU EKİP —
 *    DENEYİMLİ EKİP"): solu beyaz, sağı marka sarısı.
 *
 * Kaldırılan `BeliefFounderVideo` bileşeni dosyada DURUYOR ama artık
 * hiçbir yerden çağrılmıyor; finalizasyonda silinecekler listesinde.
 *
 * TELİF AÇIK BLOCKER: iki görselin de kullanım hakkı teyit edilmedi
 * (Küçük Prens en yüksek riskli madde). Bkz. docs/visual-audit/
 * BLOCKERS.md ve docs/content/LEGACY_CONTENT_ROUTE_MAP.md.
 *
 * `kadin.jpg` (eski hero kapağı) bilerek alınmadı: tanınabilir bir
 * kişinin portresi, model rıza kaydı yok ve bu revizyonda istenmedi.
 *
 * WWB-06 [KARAR]: "Everything in the world created by women" alıntısı
 * eski sitede Atatürk fotoğrafının üzerinde, **imzasız** duruyordu —
 * atıf ima ediliyor ama yazılmıyor. Birincil kaynağı gösterilemediği için
 * yeni siteye alınmadı ve yerine alıntı **uydurulmadı**. O bandın
 * üzerindeki metin şirketin kendi onaylı manifesto cümlesidir; tırnak
 * içinde değil, imzasız — alıntı gibi okunmasın diye.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
  // Sayfa başlığı locale'e bağlı: TR sekmesinde/arama sonucunda İngilizce
  // başlık çıkıyordu. Görünür sayfa terminolojisiyle aynı sözlükten
  // (meta.title) okunuyor; alternates/canonical yapısı değişmedi.
    title: t("title.whatWeBelieve"),
    alternates: localizedAlternates(locale, "/what-we-believe"),
  };
}

/**
 * Misyon maddelerindeki em-dash ekseni: "DOĞRU EKİP — DENEYİMLİ EKİP".
 * Sol taraf iddia, sağ taraf onun niteliği. Tipografide iki kademe olarak
 * çiziliyor (beyaz / marka sarısı).
 *
 * Em-dash YOKSA (vizyon maddelerinin hepsi böyle) `echo` boş döner ve
 * satır tek parça çizilir — yani aynı bileşen iki listeyi de taşıyor.
 * Ayraç olarak YALNIZCA em-dash (—) aranıyor: metinlerde tire (-) normal
 * kelime içinde de geçebiliyor.
 */
function splitPivot(item: string): { claim: string; echo: string } {
  const at = item.indexOf("—");
  if (at < 0) return { claim: item.trim(), echo: "" };
  return { claim: item.slice(0, at).trim(), echo: item.slice(at + 1).trim() };
}

/**
 * Vizyon / Misyon — büyük harfli kısa satırlar, display ölçeğinde
 * numaralı liste. Etiket solda kendi sütununda durur (geniş ekranda),
 * satırlar sağda akar.
 */
function CreedSection({
  id,
  title,
  items,
}: {
  id: string;
  title: string;
  items: string[];
}) {
  return (
    <section className={belief.creed} aria-labelledby={id}>
      <h2 id={id} className={belief.creedLabel}>
        {title}
      </h2>
      <ol className={belief.creedList}>
        {items.map((item, index) => {
          const { claim, echo } = splitPivot(item);
          return (
            <li key={item} className={belief.creedItem}>
              <span className={belief.creedIndex} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={belief.creedClaim}>{claim}</span>
              {echo ? <span className={belief.creedEcho}>{echo}</span> : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/**
 * İlham / İlkeler — cümle uzunluğunda maddeler. Display ölçeği burada
 * okunmayı bozardı; ölçü ve punto proz metni için ayarlı, maddeler
 * arasındaki ayrım ince çizgiyle.
 */
function ProseSection({
  id,
  title,
  items,
}: {
  id: string;
  title: string;
  items: string[];
}) {
  return (
    <section className={belief.creed} aria-labelledby={id}>
      <h2 id={id} className={belief.creedLabel}>
        {title}
      </h2>
      <ul className={belief.proseList}>
        {items.map((item) => (
          <li key={item} className={belief.proseItem}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function WhatWeBelievePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("culture.whatWeBelieve");

  const vision = {
    title: t("vision.title"),
    items: t.raw("vision.items") as string[],
  };
  const mission = {
    title: t("mission.title"),
    items: t.raw("mission.items") as string[],
  };
  const inspires = {
    title: t("inspires.title"),
    items: t.raw("inspires.items") as string[],
  };
  const edict = {
    title: t("edict.title"),
    items: t.raw("edict.items") as string[],
  };

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "What We Believe", path: "/what-we-believe" },
        ])}
      />

      <h1 className={styles.heroTitle}>WHAT WE BELIEVE</h1>
      <p className={styles.heroLead}>
        Beyond Production: An AI-Native Creative Organization
      </p>

      {/* Vizyon ve Misyon: kısa, büyük harfli satırlar — display ölçeğinde
          numaralı creed listesi. Misyon maddelerindeki em-dash iki kademe
          veriyor; `splitPivot` onu ayırıyor. */}
      <CreedSection id="wwb-vision" title={vision.title} items={vision.items} />
      <CreedSection id="wwb-mission" title={mission.title} items={mission.items} />

      {/* İlham ve ilkeler: cümle uzunluğunda — okunur ölçüde, numarasız,
          kendi ayraçlarıyla. */}
      <ProseSection id="wwb-inspires" title={inspires.title} items={inspires.items} />
      <ProseSection id="wwb-edict" title={edict.title} items={edict.items} />

      <section className={belief.values} aria-labelledby="culture-values-title">
        <div className={belief.valuesIntro}>
          <h2 id="culture-values-title">CULTURE IS WHAT WE PRACTISE</h2>
          {CULTURE_INTRO[locale].map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <ul className={belief.valuesGrid}>
          {CULTURE_VALUES.map((value) => (
            <li key={value.title}>
              <h3>{value.title}</h3>
              <p>{value.body[locale]}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Tam genişlik bant 1 — Atatürk. Üzerindeki metin şirketin kendi
          manifesto cümlesi; tırnak ve imza YOK (bkz. dosya başı notu). */}
      <figure className={belief.figure}>
        <div className={belief.imageWrap}>
          <picture>
            <source
              type="image/avif"
              srcSet={BELIEF_IMAGES.ataturk.avif}
              sizes="100vw"
            />
            <source
              type="image/webp"
              srcSet={BELIEF_IMAGES.ataturk.webp}
              sizes="100vw"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={belief.image}
              src={BELIEF_IMAGES.ataturk.fallback}
              width={BELIEF_IMAGES.ataturk.width}
              height={BELIEF_IMAGES.ataturk.height}
              alt={BELIEF_IMAGES.ataturk.alt[locale]}
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>
        <figcaption className={belief.caption}>
          <p className={belief.captionLead}>{t("bandLead")}</p>
          <p className={belief.captionStatement}>{t("manifesto")}</p>
        </figcaption>
      </figure>

      {/* Tam genişlik bant 2 — Küçük Prens. Alıntı ve atıf gerçek ve
          doğrulanmış (yazım eski sitedeki hatalı hâliyle değil, doğru
          hâliyle: Antoine de Saint-Exupéry). */}
      <figure className={belief.figure}>
        <div className={belief.imageWrap}>
          <picture>
            <source
              type="image/avif"
              srcSet={BELIEF_IMAGES.littlePrince.avif}
              sizes="100vw"
            />
            <source
              type="image/webp"
              srcSet={BELIEF_IMAGES.littlePrince.webp}
              sizes="100vw"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={`${belief.image} ${belief.imageTall}`}
              src={BELIEF_IMAGES.littlePrince.fallback}
              width={BELIEF_IMAGES.littlePrince.width}
              height={BELIEF_IMAGES.littlePrince.height}
              alt={BELIEF_IMAGES.littlePrince.alt[locale]}
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>
        <figcaption className={belief.caption}>
          <blockquote className={belief.captionQuote}>{t("quote")}</blockquote>
          <p className={belief.captionAuthor}>{t("quoteAuthor")}</p>
        </figcaption>
      </figure>

    </div>
  );
}
