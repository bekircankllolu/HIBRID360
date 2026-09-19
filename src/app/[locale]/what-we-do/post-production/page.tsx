import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { SERVICE_OFFERINGS } from "@/data/service-offerings";
import { ServiceChapter } from "@/components/service-chapter/ServiceChapter";
import detailStyles from "@/components/service-chapter/ServiceChapter.module.css";
import { ServiceSignatureVideo } from "@/components/service-chapter/ServiceSignatureVideo";
import { serviceSignatureVideos } from "@/data/service-signature-videos";
import { siteImages } from "@/data/site-images";
import type { Locale } from "@/i18n/routing";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { nextChapter } from "@/lib/service-chapter";
import { localizedAlternates } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Post Production",
    description: locale === "en"
      ? "Editing, colour, sound, motion graphics, 3D and retouch — full-service post production in-house."
      : "Kurgu, renk, ses, hareketli grafik, 3D ve rötuş; kurum içinde uçtan uca post prodüksiyon.",
    alternates: localizedAlternates(locale, "/what-we-do/post-production"),
  };
}

export default async function PostProductionPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations("services.postProduction");
  const tChapter = await getTranslations("services.chapter");
  const tWhatWeDo = await getTranslations("whatWeDo");
  const body = t.raw("body") as string[];
  const next = nextChapter("postProduction");
  const list = tWhatWeDo.raw("list") as Array<{ title: string; body: string }>;
  const nextBlurb = list.find((item) => item.title === next.name)?.body ?? "";
  const blurb = list.find((item) => item.title === "Post Production")?.body ?? "";

  return (
    <>
      <JsonLd data={breadcrumbListJsonLd(locale, [
        { name: "Home", path: "" }, { name: "What We Do", path: "/what-we-do" },
        { name: "Post Production", path: "/what-we-do/post-production" },
      ])} />
      <ServiceChapter
        locale={locale}
        chapterId="postProduction"
        titleLines={["POST", "PRODUCTION"]}
        lede="OFF WE GO!"
        body={body}
        services={SERVICE_OFFERINGS.postProduction}
        visual={{ src: siteImages.services.postProduction.src, alt: siteImages.services.postProduction.alt[locale] }}
        shape="timeline"
        blurb={blurb}
        signature={
          <ServiceSignatureVideo
            src={serviceSignatureVideos.postProduction}
            title={locale === "tr" ? "TIMELINE · MASKE · RENK" : "TIMELINE · MASK · COLOUR"}
          />
        }
        labels={{
          hub: tWhatWeDo("heroTitle"), services: tChapter("servicesTitle"), next: tChapter("next"),
          field: locale === "tr" ? "KURGU MASASI" : "THE EDIT SUITE",
        }}
        nextBlurb={nextBlurb}
      >
        <section>
          <h2>ABBY SINGER SHOT!</h2>
          <p className={detailStyles.statement}>{t("microHeadingNote")}</p>
        </section>
      </ServiceChapter>
    </>
  );
}
