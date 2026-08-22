import { getTranslations } from "next-intl/server";
import { PageStub } from "@/components/PageStub";

// TODO: brief-rev12.md Bölüm 18.10 — Accessibility Statement (bilinen sınırlamalar dürüstçe listelenecek)
export default async function AccessibilityPage() {
  const t = await getTranslations("footer.legal");
  return <PageStub title={t("accessibility")} />;
}
