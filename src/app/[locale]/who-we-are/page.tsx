import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { EmptyState } from "@/components/EmptyState";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/site";
import { FOUNDER } from "@/data/who-we-are";
import styles from "@/styles/culture-page.module.css";
import founderStyles from "./page.module.css";

/**
 * CUL-01..06 (nihai copy deck, Ağustos 2026) — Who We Are.
 *
 * 29 Ağustos 2026 revizyonu: sayfa /culture/who-we-are'dan üst menüdeki
 * canonical /who-we-are rotasına taşındı; eski yol kalıcı olarak buraya
 * yönlendiriliyor (next.config.mjs). İçerik değişmedi.
 *
 * CUL-03/04: kurucu (Zühre Didem Gödek, President & CCO) fotoğrafı ve
 * video repliği. Fotoğraf varlığı henüz teslim edilmedi; bölüm o yüzden
 * **tipografik** çalışıyor — boş çerçeve ve "Photo pending" yazısı
 * kaldırıldı, bir geliştirme notu production arayüzünde durmamalı.
 * Fotoğraf geldiğinde tek değişiklik src/data/who-we-are.ts içindeki
 * FOUNDER.portrait alanını doldurmak; bu dosya değişmez.
 * Video repliğinin altında
 * "AI-generated animation / AI ile canlandırılmıştır" ibaresi zorunlu
 * (bkz. messages "video.aiGenerated" — aynı ibare GEN-12'de de kullanılan
 * tekil kaynak).
 *
 * CUL-06: kültür filmi (60–90 sn, "Meet the crew") henüz teslim
 * edilmedi; poster + preload="none" kuralıyla varlık gelince eklenecek.
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
    title: t("title.whoWeAre"),
    description:
      locale === "en"
        ? "An Istanbul-based creative production studio building the visual experiences of the future — meet the crew."
        : "Geleceğin görsel deneyimlerini üreten İstanbul merkezli kreatif prodüksiyon stüdyosu; ekibimizle tanışın.",
    alternates: localizedAlternates(locale, "/who-we-are"),
  };
}

export default async function WhoWeArePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("culture.whoWeAre");
  const tVideo = await getTranslations("video");
  const body = t.raw("body") as string[];
  const secondBody = t.raw("secondBody") as string[];
  const portrait = FOUNDER.portrait;

  const identity = (
    <div className={portrait ? undefined : founderStyles.identity}>
      <p className={founderStyles.name}>{FOUNDER.name}</p>
      <p className={founderStyles.title}>{FOUNDER.title}</p>
    </div>
  );


  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "Who We Are", path: "/who-we-are" },
        ])}
      />

      <h1 className={styles.heroTitle}>{t("heroTitle")}</h1>
      <div className={styles.heroQuotes}>
        <p className={styles.heroQuote}>{t("quote1")}</p>
        <p className={styles.heroQuote}>{t("quote2")}</p>
      </div>
      <p className={styles.heroLead}>{t("heroLead")}</p>

      <div className={styles.body}>
        {body.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {/* CUL-03/04 — kurucu bloğu. Izgara her iki durumda da iki
          hücreli: portre varsa [görsel | kimlik+replik], yoksa
          [kimlik | replik]. */}
      <div
        className={`${founderStyles.founder} ${
          portrait ? founderStyles.founderWithPortrait : ""
        }`}
      >
        {portrait ? (
          // next/image kullanılmıyor: Cloudflare Images srcset'i kendi
          // üretiyor (bkz. CLAUDE.md medya notu), diğer sayfalarda da
          // düz <img> tercih edildi.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={founderStyles.portrait}
            src={portrait.src}
            alt={portrait.alt}
            width={portrait.width}
            height={portrait.height}
            loading="lazy"
            decoding="async"
          />
        ) : (
          identity
        )}

        <div>
          {portrait ? identity : null}
          <p className={founderStyles.quote}>{t("founderQuote")}</p>
          <p className={founderStyles.disclaimer}>{tVideo("aiGenerated")}</p>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.blockTitle}>{t("secondTitle")}</h2>
        <div className={`${styles.body} ${styles.bodyTight}`}>
          {secondBody.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* CUL-06 — kültür filmi */}
      <section className={styles.section}>
        <EmptyState message={t("filmNote")} />
      </section>
    </div>
  );
}
