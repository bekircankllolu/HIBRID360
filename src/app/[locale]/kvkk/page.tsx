import { getTranslations } from "next-intl/server";
import { PageStub } from "@/components/PageStub";

// TODO: brief-rev12.md Bölüm 14 — KVKK/GDPR aydınlatma metni
export default async function KvkkPage() {
  const t = await getTranslations("footer.legal");
  return <PageStub title={t("kvkk")} />;
}
