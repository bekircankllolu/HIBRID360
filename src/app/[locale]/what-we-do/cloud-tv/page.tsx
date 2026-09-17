import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
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

const SERVICES = ["CONTENT", "INFRASTRUCTURE", "TRAINING & OPERATION"] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: "Cloud TV & Corporate Channel", description: locale === "en" ? "Your own corporate TV channel on a cloud portal: content, infrastructure, training and turnkey operation." : "Bulut portal üzerinde kendi kurumsal TV kanalınız: içerik, altyapı, eğitim ve anahtar teslim operasyon.", alternates: localizedAlternates(locale, "/what-we-do/cloud-tv") };
}

export default async function CloudTvPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations("services.cloudTv");
  const tChapter = await getTranslations("services.chapter");
  const tWhatWeDo = await getTranslations("whatWeDo");
  const steps = t.raw("steps") as string[];
  const bandBody = t.raw("bandBody") as string[];
  const next = nextChapter("cloudTv");
  const list = tWhatWeDo.raw("list") as Array<{ title: string; body: string }>;
  const nextBlurb = list.find((item) => item.title === next.name)?.body ?? "";
  const blurb = list.find((item) => item.title === "Cloud TV")?.body ?? "";

  return (
    <>
      <JsonLd data={breadcrumbListJsonLd(locale, [{ name: "Home", path: "" }, { name: "What We Do", path: "/what-we-do" }, { name: "Cloud TV", path: "/what-we-do/cloud-tv" }])} />
      <ServiceChapter
        locale={locale}
        chapterId="cloudTv"
        titleLines={["CLOUD", "TV"]}
        lede="THERE IS NO TIME LIKE RIGHT NOW."
        body={[t("body"), ...bandBody]}
        services={SERVICES}
        visual={{ src: siteImages.services.cloudTv.src, alt: siteImages.services.cloudTv.alt[locale] }}
        shape="cloud"
        blurb={blurb}
        signature={
          <ServiceSignatureVideo
            src={serviceSignatureVideos.cloudTv}
            title={locale === "tr" ? "BULUT · YAYIN · CİHAZ" : "CLOUD · STREAM · DEVICE"}
          />
        }
        labels={{ hub: tWhatWeDo("heroTitle"), services: tChapter("servicesTitle"), next: tChapter("next"), field: locale === "tr" ? "HER EKRANDA" : "ON EVERY SCREEN" }}
        nextBlurb={nextBlurb}
      >
        <section>
          <h2>{locale === "tr" ? "ÜÇ ADIMDA YAYIN" : "BROADCAST IN THREE MOVES"}</h2>
          <ol className={detailStyles.detailList}>{steps.map((step) => <li key={step}>{step}</li>)}</ol>
        </section>
        <section>
          <h2>{t.rich("solutionsTitle", { brand: (chunks) => <span lang="en">{chunks}</span> })}</h2>
          <ol className={detailStyles.detailList}>{hibridSolutions.slice(0, 3).map((line) => <li key={line.en}>{locale === "tr" ? line.tr : line.en}</li>)}</ol>
        </section>
      </ServiceChapter>
    </>
  );
}
