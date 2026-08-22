import { getTranslations } from "next-intl/server";
import { PageStub } from "@/components/PageStub";

// TODO: brief-rev12.md Bölüm 20.9 — AI Usage & Rights (hukuk danışmanı girdisi gerekiyor)
export default async function AiUsageRightsPage() {
  const t = await getTranslations("footer.legal");
  return <PageStub title={t("aiUsage")} />;
}
