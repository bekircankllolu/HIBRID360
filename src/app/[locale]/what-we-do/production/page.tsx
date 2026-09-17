import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/EmptyState";
import { JsonLd } from "@/components/seo/JsonLd";
import { ServiceChapter } from "@/components/service-chapter/ServiceChapter";
import detailStyles from "@/components/service-chapter/ServiceChapter.module.css";
import { ServiceSignatureVideo } from "@/components/service-chapter/ServiceSignatureVideo";
import { hibridSolutions } from "@/data/hibrid-solutions";
import { serviceSignatureVideos } from "@/data/service-signature-videos";
import { siteImages } from "@/data/site-images";
import type { Locale } from "@/i18n/routing";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { nextChapter } from "@/lib/service-chapter";
import { localizedAlternates } from "@/lib/site";

const SERVICES = [
  "LIVE BROADCAST / STAGE DIRECTION", "FILM / VIDEO", "SOCIAL MEDIA VIDEOS",
  "VIRAL VIDEOS", "TV COMMERCIALS", "SHOWREELS", "ON-SITE VIDEOS",
  "INDUSTRIAL FILMS", "INTRODUCTORY / LAUNCH VIDEOS", "DRONE CAMERA SERVICES",
  "PHOTOGRAPHY",
] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Video Production Istanbul",
    description: locale === "en"
      ? "Commercials, product films and how-to content, shot end to end with an in-house crew. 20+ years of production experience."
      : "Reklam filmleri, ürün filmleri ve kullanım içerikleri; kurum içi ekiple uçtan uca çekim ve 20+ yıllık prodüksiyon deneyimi.",
    alternates: localizedAlternates(locale, "/what-we-do/production"),
  };
}

export default async function ProductionPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations("services.production");
  const tEvidence = await getTranslations("services");
  const tChapter = await getTranslations("services.chapter");
  const tWhatWeDo = await getTranslations("whatWeDo");
  const body = t.raw("body") as string[];
  const next = nextChapter("production");
  const list = tWhatWeDo.raw("list") as Array<{ title: string; body: string }>;
  const nextBlurb = list.find((item) => item.title === next.name)?.body ?? "";
  const blurb = list.find((item) => item.title === "Production")?.body ?? "";

  return (
    <>
      <JsonLd data={breadcrumbListJsonLd(locale, [
        { name: "Home", path: "" }, { name: "What We Do", path: "/what-we-do" },
        { name: "Production", path: "/what-we-do/production" },
      ])} />
      <ServiceChapter
        locale={locale}
        chapterId="production"
        titleLines={["PRODUCTION"]}
        lede="PURE. SIMPLE. POWERFUL."
        body={body}
        services={SERVICES}
        visual={{ src: siteImages.services.production.src, alt: siteImages.services.production.alt[locale] }}
        shape="aperture"
        blurb={blurb}
        signature={
          <ServiceSignatureVideo
            src={serviceSignatureVideos.production}
            title={locale === "tr" ? "KAMERA · LENS · ODAK" : "CAMERA · LENS · FOCUS"}
          />
        }
        labels={{
          hub: tWhatWeDo("heroTitle"), services: tChapter("servicesTitle"), next: tChapter("next"),
          field: locale === "tr" ? "KADRAJIN İÇİNDE" : "INSIDE THE FRAME",
        }}
        nextBlurb={nextBlurb}
      >
        <section>
          <h2>{locale === "tr" ? "TEK EKİP. TAM AKIŞ." : "ONE CREW. FULL FLOW."}</h2>
          <ol className={detailStyles.detailList}>
            {hibridSolutions.map((line) => <li key={line.en}>{locale === "tr" ? line.tr : line.en}</li>)}
          </ol>
        </section>
        <section>
          <h2>{tEvidence("evidenceTitle")}</h2>
          <EmptyState message={t("evidenceEmpty")} compact />
        </section>
      </ServiceChapter>
    </>
  );
}
