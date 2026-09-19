import type { Metadata } from "next";
import { preload } from "react-dom";
import { getTranslations } from "next-intl/server";
import { MonaDrift } from "@/components/mona/MonaDrift";
import { SERVICE_OFFERINGS } from "@/data/service-offerings";
import { MonaShard } from "@/components/mona/MonaShard";
import { JsonLd } from "@/components/seo/JsonLd";
import { ChapterHero } from "@/components/service-chapter/ChapterHero";
import { ChapterIndex } from "@/components/service-chapter/ChapterIndex";
import { ChapterNext } from "@/components/service-chapter/ChapterNext";
import { ScrollLitText, type LitSentence } from "@/components/service-chapter/ScrollLitText";
import type { Locale } from "@/i18n/routing";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { chapterOf, nextChapter } from "@/lib/service-chapter";
import { localizedAlternates } from "@/lib/site";
import { CreativeArchive } from "./CreativeArchive";
import { CreativeTitle } from "./CreativeTitle";
import { DnaHelix } from "./DnaHelix";
import styles from "./page.module.css";

/**
 * Creative — Service Chapter sisteminin ilk sayfası
 * (docs/design/SERVICE_CHAPTER_SYSTEM.md, DECISIONS #31–#35).
 *
 * Metin brief/deck'ten (CRE-01..04): 13 Eylül 2026 kararıyla `97f42fa`'nın
 * kayıtsız Creative metinleri geri alındı. Sayfa içinde /contact butonu yok;
 * tek birincil eylem layout'taki global CtaBand (GEN-08).
 *
 * Bölüm skoru: S1 başlık sayfası → S3 manifesto → S4 hizmet dizini
 * → S5 DNA sarmalı (imza hareketi) → S6 galeri durumu (metin)
 * → S7 sıradaki derece.
 *
 * Video (13 Eylül 2026, ikinci geri bildirim turu — DECISIONS #39):
 * S2 film penceresi kaldırıldı ("videoyu şimdilik kaldıralım, belki her
 * sayfaya video eklemeyiz"). `ChapterFilm` bileşeni ve Sequin Tide verisi
 * yerinde duruyor, yalnız bu sayfada render edilmiyor — dönerse tek satır.
 *
 * MonaShard (13 Eylül 2026, üçüncü geri bildirim turu — DECISIONS #43,
 * #40'ın YERİNE geçti): hero'nun sağ üst köşesine MONA'nın gerçek
 * WebGL küresinin bir parçası ("yarısı") yerleşiyor — yeni icat edilmiş
 * bir şekil değil, AI Creative Production sayfasındaki AYNI motor
 * (`createMonaDotsScene`, `mona-creature.ts`), yalnızca köşeye kırpılmış
 * bir yerleşimle (bkz. src/components/mona/MonaShard.tsx). `ChapterHero`'nun
 * yeni `mona` prop'u.
 *
 * MonaDrift (13 Eylül 2026, dördüncü geri bildirim turu — DECISIONS #45):
 * `<article>`'ın ilk çocuğu — MonaShard'dan bağımsız, tüm sayfada
 * serbestçe gezinen ambient noktalar (bkz. MonaDrift.tsx). Tamamen
 * `pointer-events:none`, etkileşim yok — yalnız doku.
 *
 * MonaShard %10 küçüldü, canvas'ı hero'nun altına uzadı,
 * MONA arada bir nilüfere dönüşüyor. MonaDrift noktaları makale bitince
 * duruyor (`.chapter { overflow: clip }`).
 *
 * TODO: CRE-04 — kampanya görselleri, KV'ler, outdoor/billboard işleri,
 * logolar ve brand ID çalışmaları (DEC #16 Works envanteri bekleniyor).
 * Gelene kadar S6 dürüst durum satırını gösterir.
 */

const CHAPTER = chapterOf("creative");

/* CRE-03 — hizmet kapsamı; marka dili, EN ve TR aynı. Liste artık
   src/data/service-offerings.ts'te: ekosistem sahnesinin gezegen paneli de
   aynı kaynağı okuyor. */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Creative",
    description:
      locale === "en"
        ? "Brand thinking, concept and campaign ideas — from strategy to key visual and packaging."
        : "Marka düşüncesi, konsept ve kampanya fikirleri; stratejiden ana görsele ve ambalaja uzanan kreatif çözümler.",
    alternates: localizedAlternates(locale, "/what-we-do/creative"),
  };
}

export default async function CreativePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  // LCP öğesi Space Grotesk ile yazılı başlık (DECISIONS #37); layout
  // yalnızca Inter'i önden yüklüyor. Font keşfi CSS'i beklemesin (yalnız
  // bu sayfada — site geneli layout'a dokunulmadı).
  preload("/fonts/space-grotesk-700-latin-tr.woff2", {
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  });
  const t = await getTranslations("services.creative");
  const tChapter = await getTranslations("services.chapter");
  const tWhatWeDo = await getTranslations("whatWeDo");
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");

  // İlk cümle beyaz (anlatım), ikincisi sarı (ekranın tek odağı). Dizi
  // kısalırsa sayfa çökmez, eksik cümle çıkar.
  const manifesto: LitSentence[] = (t.raw("body") as string[])
    .slice(0, 2)
    .map((text, index) => ({ text, tone: index === 0 ? "white" : "yellow" }));
  const next = nextChapter(CHAPTER.id);
  // Tek satırlık hizmet tanımları hizmet adıyla eşleşir (services.test.ts kilitli).
  const nextBlurb =
    (tWhatWeDo.raw("list") as Array<{ title: string; body: string }>).find(
      (item) => item.title === next.name,
    )?.body ?? "";

  return (
    <article className={styles.chapter} data-chapter={CHAPTER.id}>
      <MonaDrift />
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "What We Do", path: "/what-we-do" },
          { name: "Creative", path: "/what-we-do/creative" },
        ])}
      />

      <ChapterHero
        degree={CHAPTER.degree}
        serviceName={CHAPTER.name}
        hub={{ label: tWhatWeDo("heroTitle"), href: "/what-we-do" }}
        title={<CreativeTitle />}
        lede={t("heroSubtitle")}
        mona={<MonaShard />}
      />

      <ScrollLitText sentences={manifesto} />

      <ChapterIndex
        title={tChapter("servicesTitle")}
        items={SERVICE_OFFERINGS.creative}
      />

      <DnaHelix slogan={t("band")} />

      <CreativeArchive
        locale={locale}
        pending={{
          label: tCommon("pendingLabel"),
          message: t("galleryEmpty"),
          representative: tCommon("aiRepresentative"),
        }}
        link={{ href: "/work?service=Creative", label: tNav("work") }}
      />

      <ChapterNext
        currentId={CHAPTER.id}
        currentDegree={CHAPTER.degree}
        label={tChapter("next")}
        blurb={nextBlurb}
      />
    </article>
  );
}
