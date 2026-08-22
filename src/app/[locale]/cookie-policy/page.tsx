import { getTranslations } from "next-intl/server";
import { PageStub } from "@/components/PageStub";

// TODO: brief-rev12.md Bölüm 14 — Cookie Policy (+ onay bandı)
export default async function CookiePolicyPage() {
  const t = await getTranslations("footer.legal");
  return <PageStub title={t("cookie")} />;
}
