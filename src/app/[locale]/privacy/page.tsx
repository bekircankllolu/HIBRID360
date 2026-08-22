import { getTranslations } from "next-intl/server";
import { PageStub } from "@/components/PageStub";

// TODO: brief-rev12.md Bölüm 14 — Privacy Policy (iki dilli, KVKK/GDPR uyumlu)
export default async function PrivacyPage() {
  const t = await getTranslations("footer.legal");
  return <PageStub title={t("privacy")} />;
}
