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
  return { title: "Event Management", description: locale === "en" ? "Conventions, launches, roadshows and brand events — concept, production and on-site execution." : "Kongre, lansman, roadshow ve marka etkinliklerinde konsept, prodüksiyon ve saha uygulaması.", alternates: localizedAlternates(locale, "/what-we-do/event-management") };
}

export default async function EventManagementPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations("services.eventManagement");
  const tChapter = await getTranslations("services.chapter");
  const tWhatWeDo = await getTranslations("whatWeDo");
  const body = t.raw("body") as string[];
  const next = nextChapter("eventManagement");
  const list = tWhatWeDo.raw("list") as Array<{ title: string; body: string }>;
  const nextBlurb = list.find((item) => item.title === next.name)?.body ?? "";
  const blurb = list.find((item) => item.title === "Event Management")?.body ?? "";

  return (
    <>
      <JsonLd data={breadcrumbListJsonLd(locale, [{ name: "Home", path: "" }, { name: "What We Do", path: "/what-we-do" }, { name: "Event Management", path: "/what-we-do/event-management" }])} />
      <ServiceChapter
        locale={locale}
        chapterId="eventManagement"
        titleLines={["EVENT", "MANAGEMENT"]}
        lede="WE DESIGN EXPERIENCE."
        body={body}
        services={SERVICE_OFFERINGS.eventManagement}
        visual={{ src: siteImages.services.eventManagement.src, alt: siteImages.services.eventManagement.alt[locale] }}
        shape="stage"
        blurb={blurb}
        signature={
          <ServiceSignatureVideo
            src={serviceSignatureVideos.eventManagement}
            title={locale === "tr" ? "TRUSS · IŞIK · PLAN" : "TRUSS · LIGHT · PLAN"}
          />
        }
        labels={{ hub: tWhatWeDo("heroTitle"), services: tChapter("servicesTitle"), next: tChapter("next"), field: locale === "tr" ? "SAHNE AÇILIYOR" : "THE STAGE OPENS" }}
        nextBlurb={nextBlurb}
      >
        <section>
          <h2 className={detailStyles.statement}>REASON TO MEET US</h2>
          <p>CALL US · TRUST US · LOVE US</p>
        </section>
      </ServiceChapter>
    </>
  );
}
