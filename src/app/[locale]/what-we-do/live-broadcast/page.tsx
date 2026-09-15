import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/EmptyState";
import { JsonLd } from "@/components/seo/JsonLd";
import { ServiceChapter } from "@/components/service-chapter/ServiceChapter";
import { ServiceSignatureVideo } from "@/components/service-chapter/ServiceSignatureVideo";
import { serviceSignatureVideos } from "@/data/service-signature-videos";
import { siteImages } from "@/data/site-images";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { nextChapter } from "@/lib/service-chapter";
import { localizedAlternates } from "@/lib/site";

const SERVICES = ["ONLINE LIVE BROADCASTING", "LIVE BROADCAST WITH A SATELLITE UPLINK", "LIVE MEDICAL BROADCASTING", "LIVE REMOTE BROADCASTING"] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: "Corporate Live Broadcast", description: locale === "en" ? "Multi-camera live streaming for events, conventions and medical broadcasts — with satellite uplink and remote production." : "Etkinlik, kongre ve medikal yayınlar için çok kameralı canlı yayın; uydu bağlantısı ve uzaktan prodüksiyon desteğiyle.", alternates: localizedAlternates(locale, "/what-we-do/live-broadcast") };
}

export default async function LiveBroadcastPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations("services.liveBroadcast");
  const tEvidence = await getTranslations("services");
  const tChapter = await getTranslations("services.chapter");
  const tWhatWeDo = await getTranslations("whatWeDo");
  const body = t.raw("body") as string[];
  const next = nextChapter("liveBroadcast");
  const list = tWhatWeDo.raw("list") as Array<{ title: string; body: string }>;
  const nextBlurb = list.find((item) => item.title === next.name)?.body ?? "";
  const blurb = list.find((item) => item.title === "Live Broadcast")?.body ?? "";

  return (
    <>
      <JsonLd data={breadcrumbListJsonLd(locale, [{ name: "Home", path: "" }, { name: "What We Do", path: "/what-we-do" }, { name: "Live Broadcast", path: "/what-we-do/live-broadcast" }])} />
      <ServiceChapter
        locale={locale}
        chapterId="liveBroadcast"
        titleLines={["LIVE", "BROADCAST"]}
        lede="LIVE IS THE HARDEST FORMAT. IT’S OUR FAVOURITE."
        body={body}
        services={SERVICES}
        visual={{ src: siteImages.services.liveBroadcast.src, alt: siteImages.services.liveBroadcast.alt[locale] }}
        shape="broadcast"
        blurb={blurb}
        signature={
          <ServiceSignatureVideo
            src={serviceSignatureVideos.liveBroadcast}
            title={locale === "tr" ? "ANTEN · SİNYAL · DAĞITIM" : "ANTENNA · SIGNAL · FEED"}
          />
        }
        labels={{ hub: tWhatWeDo("heroTitle"), services: tChapter("servicesTitle"), next: tChapter("next"), field: locale === "tr" ? "ŞİMDİ YAYINDA" : "ON AIR NOW" }}
        nextBlurb={nextBlurb}
      >
        <section>
          <h2>{locale === "tr" ? "YAYIN DEVAM EDİYOR" : "THE SIGNAL CONTINUES"}</h2>
          <p>{t("cloudBody")} <Link href="/what-we-do/cloud-tv">→ {t("cloudLink")}</Link></p>
        </section>
        <section><h2>{tEvidence("evidenceTitle")}</h2><EmptyState message={t("evidenceEmpty")} compact /></section>
      </ServiceChapter>
    </>
  );
}
