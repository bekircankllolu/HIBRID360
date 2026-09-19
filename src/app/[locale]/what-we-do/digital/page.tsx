import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { SERVICE_OFFERINGS } from "@/data/service-offerings";
import { ServiceChapter } from "@/components/service-chapter/ServiceChapter";
import detailStyles from "@/components/service-chapter/ServiceChapter.module.css";
import { ServiceSignatureVideo } from "@/components/service-chapter/ServiceSignatureVideo";
import { digitalServices } from "@/data/digital-services";
import { serviceSignatureVideos } from "@/data/service-signature-videos";
import { siteImages } from "@/data/site-images";
import type { Locale } from "@/i18n/routing";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { nextChapter } from "@/lib/service-chapter";
import { localizedAlternates } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Digital Content Production",
    description: locale === "en" ? "Social-first content, short-form video, CGI and AI-powered production built to perform across platforms." : "Platformlar genelinde performans için tasarlanan sosyal medya öncelikli içerik, kısa video, CGI ve yapay zekâ destekli prodüksiyon.",
    alternates: localizedAlternates(locale, "/what-we-do/digital"),
  };
}

export default async function DigitalPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations("services.digital");
  const tChapter = await getTranslations("services.chapter");
  const tWhatWeDo = await getTranslations("whatWeDo");
  const body = t.raw("body") as string[];
  const bandBody = t.raw("bandBody") as string[];
  const quad = t.raw("quad") as Array<{ title: string; body: string }>;
  const next = nextChapter("digital");
  const list = tWhatWeDo.raw("list") as Array<{ title: string; body: string }>;
  const nextBlurb = list.find((item) => item.title === next.name)?.body ?? "";
  const blurb = list.find((item) => item.title === "Digital")?.body ?? "";

  return (
    <>
      <JsonLd data={breadcrumbListJsonLd(locale, [{ name: "Home", path: "" }, { name: "What We Do", path: "/what-we-do" }, { name: "Digital", path: "/what-we-do/digital" }])} />
      <ServiceChapter
        locale={locale}
        chapterId="digital"
        titleLines={["BUILT FOR THE FEED.", "MADE TO MOVE."]}
        lede={body[0]}
        body={bandBody}
        services={SERVICE_OFFERINGS.digital}
        visual={{ src: siteImages.services.digital.src, alt: siteImages.services.digital.alt[locale] }}
        shape="cursor"
        blurb={blurb}
        signature={
          <ServiceSignatureVideo
            src={serviceSignatureVideos.digital}
            title={locale === "tr" ? "İMLEÇ · IZGARA · AĞ" : "CURSOR · GRID · NETWORK"}
          />
        }
        labels={{
          hub: tWhatWeDo("heroTitle"), services: tChapter("servicesTitle"), next: tChapter("next"),
          field: locale === "tr" ? "AKIŞIN İÇİNDE" : "INSIDE THE FEED",
        }}
        nextBlurb={nextBlurb}
      >
        <section>
          <h2>{locale === "tr" ? "İÇERİK SİSTEMİ" : "CONTENT SYSTEM"}</h2>
          <ol className={detailStyles.detailList}>
            {digitalServices.map((service) => <li key={service.title}><span><strong>{service.title}</strong><br />{locale === "tr" ? service.tr : service.en}</span></li>)}
          </ol>
        </section>
        <section>
          <h2>{locale === "tr" ? "DÖRT HAREKET" : "FOUR MOVES"}</h2>
          <ol className={detailStyles.detailList}>
            {quad.map((item) => <li key={item.title}><span><strong>{item.title}</strong><br />{item.body}</span></li>)}
          </ol>
        </section>
        <section>
          <h2 className={detailStyles.statement}>LET&rsquo;S BUILD YOUR OWN DIGITAL EXPERIENCE.</h2>
          <p>{t("closingBody")}</p>
        </section>
      </ServiceChapter>
    </>
  );
}
