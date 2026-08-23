import type { LegalDoc } from "@/types/legal";

/**
 * KVKK Aydınlatma Metni / KVKK Disclosure Notice.
 *
 * Müşteriden ayrı bir "KVKK Aydınlatma Metni" dokümanı teslim edilmedi —
 * paketteki Gizlilik Politikası dokümanı zaten "6698 sayılı KVKK ve GDPR"
 * kapsamını birlikte ele alıyor ve KVKK'nın 6698 sayılı kanunun 10.
 * maddesinin istediği üç unsuru (veri sorumlusunun kimliği, işleme
 * amaçları, başvuru yolu) kendi içinde taşıyor.
 *
 * Bu sayfa, o dokümanın (privacy.ts) TAM METNİNİ TEKRARLAMAK yerine,
 * KVKK madde 10'un istediği üç unsura karşılık gelen bölümlerini
 * (kurumsal kimlik, işleme amaçları tablosu, madde 11 hakları) aynı
 * kaynak metinden BİREBİR alıntılayarak ayrı, öz bir aydınlatma metni
 * olarak sunuyor — cümleler değiştirilmedi, yalnızca seçildi. Genel
 * gizlilik anlatımının tamamı için /privacy sayfasına yönlendiriyor.
 */

export const kvkkNoticeTr: LegalDoc = {
  title: "KVKK AYDINLATMA METNİ",
  subtitle: "6698 Sayılı Kişisel Verilerin Korunması Kanunu Madde 10 Uyarınca",
  lastUpdated: "Son Güncelleme: Temmuz 2026",
  blocks: [
    { kind: "heading", text: "1. Veri Sorumlusunun Kimliği" },
    {
      kind: "paragraph",
      text: 'HIBRID360 ("Şirket" veya "Biz") olarak; Üst Düzey Kreatif Prodüksiyon, Yapay Zekâ (AI) Çözümleri, Marka Deneyimi Tasarımı, Web Deneyimi Mühendisliği ve Film Prodüksiyonu alanlarında entegre stüdyo hizmetleri sunmaktayız. Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu\'nun ("KVKK") 10. maddesi uyarınca veri sorumlusu sıfatıyla hazırlanmıştır.',
    },
    {
      kind: "paragraph",
      text: "TODO: DECISIONS.md #1 — veri sorumlusunun tam ticari unvanı (A.Ş./Ltd. Şti.) netleşince bu bölüme eklenecek.",
    },
    { kind: "heading", text: "2. Kişisel Verilerin İşlenme Amaçları" },
    {
      kind: "paragraph",
      text: "Kişisel verileriniz, KVKK'nın 5. ve 6. maddelerinde belirtilen hukuki sebeplere uygun olarak aşağıdaki amaçlarla işlenmektedir:",
    },
    {
      kind: "table",
      headers: ["İşleme Amacı", "İşlenen Veri Kategorisi", "Hukuki Sebebi (KVKK)"],
      rows: [
        [
          "Teklif Hazırlama ve Sözleşme İfası",
          "Kimlik, İletişim, Proje Brief'leri",
          "Sözleşmenin Kurulması/İfası (KVKK 5/2-c)",
        ],
        [
          "Kreatif Prodüksiyon ve AI Üretimi",
          "Proje Medyası, Promptlar, Tasarımlar",
          "Sözleşmenin İfası ve Açık Rıza",
        ],
        [
          "Site Optimizasyonu ve Siber Güvenlik",
          "Teknik Veriler, IP Kayıtları",
          "Meşru Menfaat (KVKK 5/2-f)",
        ],
        [
          "Yasal Yükümlülükler ve Muhasebe",
          "Kimlik, Müşteri İşlem Verileri",
          "Kanuni Yükümlülük (KVKK 5/2-ç)",
        ],
      ],
    },
    { kind: "heading", text: "3. İşlenen Kişisel Verilerin Aktarıldığı Taraflar" },
    {
      kind: "paragraph",
      text: "Veri aktarımları, KVKK'nın 8. ve 9. maddelerine uygun olarak akdedilen Veri İşleme Sözleşmeleri (DPA) kapsamında, kurumsal düzeyde güvenlik standartlarına sahip altyapı tedarikçileriyle (AWS, Google Cloud Platform, GA4) sınırlı olarak gerçekleştirilir.",
    },
    { kind: "heading", text: "4. İlgili Kişinin Hakları (KVKK Madde 11)" },
    { kind: "paragraph", text: "KVKK madde 11 uyarınca veri sahipleri;" },
    {
      kind: "list",
      items: [
        "Kişisel veri işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme,",
        "İşleme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,",
        "Yurt içinde veya yurt dışında aktarıldığı 3. kişileri bilme,",
        "Eksik/yanlış işlenmişse düzeltilmesini, silinmesini veya yok edilmesini isteme haklarına sahiptir.",
      ],
    },
    {
      kind: "paragraph",
      text: "Haklarınızı kullanmak için taleplerinizi contact@hibrid360.com adresine iletebilirsiniz. Verilerin toplanma yöntemi, saklama süreleri ve güvenlik önlemleri hakkındaki tam anlatım için Gizlilik Politikası sayfamıza bakınız.",
    },
  ],
};

export const kvkkNoticeEn: LegalDoc = {
  title: "KVKK DISCLOSURE NOTICE",
  subtitle: "Pursuant to Article 10 of Turkish Law No. 6698 on the Protection of Personal Data",
  lastUpdated: "Effective Date: July 2026",
  blocks: [
    { kind: "heading", text: "1. Identity of the Data Controller" },
    {
      kind: "paragraph",
      text: 'At HIBRID360 ("we", "our", or "us"), we operate at the cutting edge of Creative Production, Artificial Intelligence (AI) Solutions, Brand Experience Design, Web Experience Engineering, and Film Production. This notice is prepared in our capacity as data controller under Article 10 of Turkish Law No. 6698 on the Protection of Personal Data ("KVKK").',
    },
    {
      kind: "paragraph",
      text: "TODO: docs/DECISIONS.md #1 — the controller's full registered company name (A.Ş./Ltd. Şti.) will be added once confirmed.",
    },
    { kind: "heading", text: "2. Purposes of Processing" },
    {
      kind: "paragraph",
      text: "Your personal data is processed for the following purposes, pursuant to the legal grounds recognized under KVKK:",
    },
    {
      kind: "table",
      headers: ["Processing Purpose", "Data Categories Involved", "Legal Basis (KVKK)"],
      rows: [
        [
          "Proposal Preparation & Contract Performance",
          "Identity, Contact, Project Briefs",
          "Execution of Contract (KVKK 5(2)(c))",
        ],
        [
          "Creative Production & AI Rendering",
          "Project Media, Prompts, Brand Assets",
          "Contractual Obligation & Explicit Consent",
        ],
        [
          "Website Security & System Optimization",
          "Technical Telemetry, IP Logs",
          "Legitimate Interest (KVKK 5(2)(f))",
        ],
        [
          "Invoicing, Tax & Regulatory Compliance",
          "Identity, Transactional Records",
          "Legal Obligation (KVKK 5(2)(ç))",
        ],
      ],
    },
    { kind: "heading", text: "3. Parties to Whom Data May Be Transferred" },
    {
      kind: "paragraph",
      text: "Data transfers take place, to a limited extent, with vetted infrastructure providers (AWS, Google Cloud Platform, GA4) under legally binding Data Processing Agreements (DPAs), in accordance with Articles 8 and 9 of KVKK.",
    },
    { kind: "heading", text: "4. Your Rights as a Data Subject (KVKK Article 11)" },
    { kind: "paragraph", text: "Under Article 11 of KVKK, data subjects have the right to:" },
    {
      kind: "list",
      items: [
        "Right to Access & Confirmation: Confirm whether personal data is being processed.",
        "Right to Rectification & Erasure: Request correction of inaccurate data or secure deletion.",
        "Right to Restriction & Objection: Object to data processing or restrict specific workflows.",
        "Right to Data Portability: Receive data in a structured, machine-readable format.",
      ],
    },
    {
      kind: "paragraph",
      text: "To exercise these rights, contact us at contact@hibrid360.com. For the full account of how data is collected, retained and secured, see our Privacy Policy page.",
    },
  ],
};
