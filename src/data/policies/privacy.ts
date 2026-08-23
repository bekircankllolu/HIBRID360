import type { LegalDoc } from "@/types/legal";

/**
 * Gizlilik Politikası / Privacy Policy.
 *
 * Kaynak: HIBRID360_Corporate_Policies_Pack (müşteriden teslim alındı,
 * Ağustos 2026) — HIBRID360_Gizlilik_Politikasi_TR.docx ve
 * HIBRID360_Privacy_Policy_EN.docx. Metin birebir aktarılmıştır, üzerinde
 * içerik değişikliği yapılmamıştır (yalnızca Word bölüm/tablo yapısı bu
 * sitenin blok modeline aktarıldı).
 *
 * AÇIK TUTARSIZLIK — müşteriye sorulacak: "6. Veri Güvenliği ve Saklama
 * Süreleri" bölümünde TR metin saklama süresini "yasal zamanaşımı
 * süreleri (10 yıl)" olarak, EN metin "duration of the engagement plus
 * 3 years" olarak veriyor. İki doküman da olduğu gibi yayınlandı,
 * rakamlar arasında seçim/uyum yapılmadı — bu bir editoryal karar değil,
 * müşterinin iki dokümanı birbirine göre teyit etmesi gereken bir nokta.
 */

export const privacyPolicyTr: LegalDoc = {
  title: "GİZLİLİK POLİTİKASI",
  subtitle:
    "HIBRID360 Kreatif Prodüksiyon, Yapay Zekâ, Marka & Web Deneyimi, Film Prodüksiyon Uyum Standardı",
  lastUpdated: "Son Güncelleme: Temmuz 2026",
  // LEG-01 — nihai copy deck, Ağustos 2026.
  intro:
    "Bu sayfa, hibrid360.com üzerinde hangi verileri topladığımızı, neden topladığımızı, ne kadar sakladığımızı, kimlerle paylaştığımızı ve haklarınızı nasıl kullanabileceğinizi açıklar.",
  blocks: [
    { kind: "heading", text: "1. Giriş ve Kurumsal Kapsam" },
    {
      kind: "paragraph",
      text: "HIBRID360 (\"Şirket\" veya \"Biz\") olarak; Üst Düzey Kreatif Prodüksiyon, Yapay Zekâ (AI) Çözümleri, Marka Deneyimi Tasarımı, Web Deneyimi Mühendisliği ve Film Prodüksiyonu alanlarında entegre stüdyo hizmetleri sunmaktayız.",
    },
    {
      kind: "paragraph",
      text: "Bu Gizlilik Politikası, web sitemizi (www.hibrid360.com), dijital platformlarımızı ve etkileşimli üretim araçlarımızı ziyaret ettiğinizde veya hizmetlerimizden yararlandığınızda kişisel verilerinizin nasıl toplandığını, işlendiğini, korunduğunu ve yönetildiğini açıklamaktadır. Politikamız, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve Avrupa Birliği Genel Veri Koruma Tüzüğü (GDPR) başta olmak üzere ulusal ve uluslararası veri koruma mevzuatına tam uyum prensibiyle hazırlanmıştır.",
    },
    { kind: "heading", text: "2. Toplanan Kişisel Veri Kategorileri" },
    {
      kind: "paragraph",
      text: "HIBRID360 ile olan etkileşim türünüze bağlı olarak işlenen kişisel veri kategorileri aşağıdadır:",
    },
    {
      kind: "list",
      items: [
        "Kimlik ve İletişim Verileri: Ad, soyad, kurumsal e-posta adresi, telefon numarası, şirket unvanı, görev ve coğrafi konum bilgisi.",
        "Proje ve Kreatif İçerik Verileri: Proje brief'leri, senaryolar, marka görselleri, ham medya dosyaları, yapay zekâ metin komutları (prompt) ve teknik parametreler.",
        "Teknik ve Bağlantı Verileri: IP adresi, tarayıcı türü, işletim sistemi, cihaz kimlikleri, ekran çözünürlüğü ve web sitesi gezinti kayıtları.",
        "Yapay Zekâ Etkileşim Kayıtları: Platformumuz üzerindeki yapay zekâ destekli araçlar kullanılırken girilen komutlar, önizleme render kayıtları ve sistem logları.",
        "Çerez ve Deneyim Verileri: Oturum güvenlik çerezleri, tercih çerezleri ve gizlilik odaklı web analitik verileri.",
      ],
    },
    {
      kind: "callout",
      text: "Veri Güvenliği Taahhüdü: HIBRID360, müşterilerine ait verileri, kreatif materyalleri ve yapay zekâ model verilerini hiçbir koşulda üçüncü taraflara satmaz, kiralamaz veya ticari amaçla devretmez.",
    },
    { kind: "heading", text: "3. Veri İşleme Amaçları ve Hukuki Sebepler" },
    {
      kind: "paragraph",
      text: "Kişisel verileriniz, KVKK'nın 5. ve 6. maddeleri ile GDPR'ın 6. maddesinde belirtilen hukuki sebeplere uygun olarak işlenmektedir:",
    },
    {
      kind: "table",
      headers: ["İşleme Amacı", "İşlenen Veri Kategorisi", "Hukuki Sebebi (KVKK / GDPR)"],
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
    { kind: "heading", text: "4. Yapay Zekâ Üretim Süreçleri ve Veri İzolasyonu" },
    {
      kind: "paragraph",
      text: "HIBRID360; Film Prodüksiyonu, 3D Render ve Marka Deneyimi süreçlerinde gelişmiş Yapay Zekâ teknolojilerinden yararlanmaktadır.",
    },
    {
      kind: "paragraph",
      text: "Kesin Model İzolasyon Garantisi: Müşterilerimiz tarafından sunulan proje verileri, görsel materyaller, ses kayıtları ve yapay zekâ komutları, izolasyonlu bulut ortamlarında işlenir. Müşteri verileri kesinlikle kamusal yapay zekâ genel modellerinin (public foundation models) eğitilmesi amacıyla kullanılmaz.",
    },
    {
      kind: "paragraph",
      text: "Tüm yapay zekâ işleme altyapıları, sıfır veri saklama (zero-data-retention) protokollerine sahip güvenli sunucularda yürütülmektedir.",
    },
    { kind: "heading", text: "5. Veri Aktarımı ve Üçüncü Taraf Altyapı Sağlayıcıları" },
    {
      kind: "paragraph",
      text: "Hizmet kalitesini ve siber güvenliği sağlamak amacıyla kurumsal düzeyde güvenlik standartlarına sahip altyapı tedarikçileriyle (AWS, Google Cloud Platform, GA4) çalışmaktayız.",
    },
    {
      kind: "paragraph",
      text: "Veri aktarımları, KVKK'nın 8. ve 9. maddelerine uygun olarak akdedilen Veri İşleme Sözleşmeleri (DPA) kapsamında gerçekleştirilir.",
    },
    { kind: "heading", text: "6. Veri Güvenliği ve Saklama Süreleri" },
    {
      kind: "paragraph",
      text: "Verileriniz TLS 1.3 aktarım şifrelemesi, AES-256 depolama güvenliği ve rol tabanlı erişim kısıtlamaları ile korunmaktadır.",
    },
    {
      kind: "paragraph",
      text: "Aktif proje verileri, hukuki ilişki süresince ve takiben yasal zamanaşımı süreleri (10 yıl) boyunca saklanır. Teknik loglar 12 ay sonunda otomatik olarak imha edilir.",
    },
    { kind: "heading", text: "7. İlgili Kişinin Hakları (KVKK Madde 11)" },
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
      text: "Haklarınızı kullanmak için taleplerinizi contact@hibrid360.com adresine iletebilirsiniz.",
    },
    { kind: "heading", text: "8. İletişim" },
    { kind: "paragraph", text: "HIBRID360 Veri Gizliliği Departmanı" },
    { kind: "paragraph", text: "E-posta: contact@hibrid360.com | zuhre@hibrid360.com" },
    { kind: "paragraph", text: "Web: www.hibrid360.com" },
  ],
};

export const privacyPolicyEn: LegalDoc = {
  title: "PRIVACY POLICY",
  subtitle:
    "HIBRID360 Creative Production, AI, Brand & Web Experience, Film Production — Governance Standard",
  lastUpdated: "Effective Date: July 2026",
  // LEG-01 — final copy deck, August 2026.
  intro:
    "This page explains what data we collect on hibrid360.com, why we collect it, how long we keep it, who we share it with, and how you can exercise your rights.",
  blocks: [
    { kind: "heading", text: "1. Introduction & Organizational Context" },
    {
      kind: "paragraph",
      text: 'At HIBRID360 ("we", "our", or "us"), we operate at the cutting edge of Creative Production, Artificial Intelligence (AI) Solutions, Brand Experience Design, Web Experience Engineering, and Film Production.',
    },
    {
      kind: "paragraph",
      text: "This Privacy Policy sets forth how HIBRID360 collects, processes, protects, and governs personal information across our website (www.hibrid360.com), interactive client portals, and creative production pipelines. Designed in accordance with global regulatory frameworks including the General Data Protection Regulation (GDPR - EU 2016/679) and Turkish Law No. 6698 on the Protection of Personal Data (KVKK), this document reflects our commitment to enterprise-grade governance, data minimization, and user autonomy.",
    },
    { kind: "heading", text: "2. Categories of Personal Data Collected" },
    {
      kind: "paragraph",
      text: "Depending on your interaction with our platforms and creative workflows, HIBRID360 may process the following data categories:",
    },
    {
      kind: "list",
      items: [
        "Identity & Professional Contact Data: Name, corporate email address, contact phone number, company name, title/role, and regional jurisdiction.",
        "Project Briefs & Creative Assets: Project scope documents, visual/brand assets, script drafts, raw media files, prompt text, and parameter inputs voluntarily submitted for production.",
        "Technical Telemetry & Session Data: IP address, browser hardware profile, operating system details, session tokens, screen dimensions, and interaction clickstream logs.",
        "AI Interaction Logs: Query prompts, parameter configurations, rendering logs, and synthetic preview iterations captured during interaction with our proprietary AI tools.",
        "Cookie & Web Preference Identifiers: First-party security tokens, functional preference cookies, and privacy-first web experience analytics identifiers.",
      ],
    },
    {
      kind: "callout",
      text: "Data Integrity Guarantee: HIBRID360 will never sell, lease, or monetize client data, creative assets, or proprietary AI prompt structures to third parties under any circumstances.",
    },
    { kind: "heading", text: "3. Legal Grounds & Operational Processing Purposes" },
    {
      kind: "paragraph",
      text: "HIBRID360 processes personal data strictly pursuant to recognized lawful processing grounds:",
    },
    {
      kind: "table",
      headers: ["Processing Purpose", "Data Categories Involved", "Legal Basis (GDPR / KVKK)"],
      rows: [
        [
          "Proposal Preparation & Contract Performance",
          "Identity, Contact, Project Briefs",
          "Execution of Contract (Art. 6(1)(b) / KVKK 5(2)(c))",
        ],
        [
          "Creative Production & AI Rendering",
          "Project Media, Prompts, Brand Assets",
          "Contractual Obligation & Explicit Consent",
        ],
        [
          "Website Security & System Optimization",
          "Technical Telemetry, IP Logs",
          "Legitimate Interest (Art. 6(1)(f) / KVKK 5(2)(f))",
        ],
        [
          "Invoicing, Tax & Regulatory Compliance",
          "Identity, Transactional Records",
          "Legal Obligation (Art. 6(1)(c) / KVKK 5(2)(ç))",
        ],
      ],
    },
    { kind: "heading", text: "4. AI Pipeline Data Security & Model Isolation" },
    {
      kind: "paragraph",
      text: "As a technology-integrated creative production studio, HIBRID360 utilizes state-of-the-art Generative AI, Computer Vision, and Synthetic Media workflows across Film, Brand, and Web Experience projects.",
    },
    {
      kind: "paragraph",
      text: "Strict Model Isolation Architecture: Raw media, brand assets, proprietary scripts, voice embeddings, and custom prompt inputs submitted by clients are isolated in dedicated cloud memory enclaves. Client assets are NEVER used to train, retrain, or fine-tune public foundation AI models or third-party AI frameworks.",
    },
    {
      kind: "paragraph",
      text: "All AI processing environments are deployed on enterprise-grade sandboxed servers operating under strict zero-data-retention non-disclosure agreements.",
    },
    { kind: "heading", text: "5. Sub-processors & Infrastructure Partners" },
    {
      kind: "paragraph",
      text: "To maintain world-class web rendering performance, secure cloud rendering, and global service availability, HIBRID360 collaborates with vetted sub-processors:",
    },
    {
      kind: "paragraph",
      text: "Partners include enterprise cloud infrastructure providers (AWS, Google Cloud Platform), high-performance analytics suites (Google Analytics 4 with IP anonymization), and encrypted communication gateways. All sub-processors operate under legally binding Data Processing Agreements (DPAs).",
    },
    { kind: "heading", text: "6. Security Safeguards & Retention Policies" },
    {
      kind: "paragraph",
      text: "HIBRID360 employs technical and organizational security measures, including end-to-end TLS 1.3 encryption in transit, AES-256 encryption at rest, role-based access controls (RBAC), and continuous vulnerability scanning.",
    },
    {
      kind: "paragraph",
      text: "Data Retention: Active project data is maintained for the duration of the engagement plus 3 years for archival and licensing support. Server logs and telemetry are automatically purged after 12 months.",
    },
    { kind: "heading", text: "7. Your Rights (GDPR & KVKK)" },
    {
      kind: "paragraph",
      text: "Data subjects possess enforceable rights regarding their personal information:",
    },
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
      text: "To exercise any of these rights, contact our Data Protection Officer at privacy@hibrid360.com.",
    },
    { kind: "heading", text: "8. Contact Information" },
    { kind: "paragraph", text: "HIBRID360 Data Governance Office" },
    { kind: "paragraph", text: "Email: contact@hibrid360.com | zuhre@hibrid360.com" },
    { kind: "paragraph", text: "Website: www.hibrid360.com" },
  ],
};
