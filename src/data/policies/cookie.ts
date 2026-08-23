import type { LegalDoc } from "@/types/legal";

/**
 * Çerez Politikası / Cookie Policy.
 * Kaynak: HIBRID360_Cerez_Politikasi_TR.docx / HIBRID360_Cookie_Policy_EN.docx
 * (HIBRID360_Corporate_Policies_Pack, müşteriden teslim alındı).
 *
 * DÜZELTİLEN YAZIM HATASI: TR dokümanındaki iletişim e-postası
 * "contct@hibrid360.com" olarak yazılmış (bir harf eksik) — çalışan bir
 * e-posta adresi olmadığı için "contact@hibrid360.com" olarak düzeltildi.
 * Bu, CLAUDE.md'nin "İngilizce metinlerdeki yazım hataları düzeltilecek"
 * kuralının fonksiyonel karşılığıdır (bozuk bir e-posta adresi görsel bir
 * yazım hatası değil, çalışmayan bir iletişim kanalıdır).
 */

export const cookiePolicyTr: LegalDoc = {
  title: "ÇEREZ POLİTİKASI",
  subtitle: "HIBRID360 Web Deneyimi ve Dijital Takip Şeffaflık Metni",
  lastUpdated: "Tarih: Temmuz 2026",
  // LEG-02 — nihai copy deck, Ağustos 2026.
  intro:
    "Az sayıda çerez kullanıyoruz: sitenin çalışması için zorunlu olanlar ve hangi sayfaların işe yaradığını gösterenler. İkinci grubu istediğiniz zaman kabul edebilir veya reddedebilirsiniz.",
  blocks: [
    { kind: "heading", text: "1. Genel Bilgilendirme" },
    {
      kind: "paragraph",
      text: "Bu Çerez Politikası, HIBRID360 web platformunda (www.hibrid360.com) kullanılan çerezler (cookies) ve benzeri teknolojiler hakkında kullanıcıları bilgilendirmek amacıyla hazırlanmıştır.",
    },
    {
      kind: "paragraph",
      text: "Gizlilik odaklı çerezler; 3D/WebGL grafik performansını optimize etmek, oturum güvenliğini sağlamak ve site performansını analiz etmek amacıyla kullanılmaktadır.",
    },
    { kind: "heading", text: "2. Kullanılan Çerez Kategorileri" },
    {
      kind: "paragraph",
      text: "Sitemizde kullanılan çerezler aşağıdaki işlevsel kategorilere ayrılır:",
    },
    {
      kind: "table",
      headers: ["Çerez Kategorisi", "Kullanım Amacı", "Saklama Süresi", "Açık Rıza Gerekli mi?"],
      rows: [
        [
          "Zorunlu Çerezler",
          "Güvenlik, WebGL başlatma ve temel oturum yönetimi",
          "Oturum Süresince",
          "Hayır (Zorunlu)",
        ],
        [
          "Performans & Analiz",
          "Anonim ziyaretçi istatistikleri ve render hızı ölçümü",
          "12 Ay",
          "Evet",
        ],
        [
          "İşlevsel Çerezler",
          "Dil tercihi, 3D sahne ayarları ve ses tercihlerinin hatırlanması",
          "6 - 12 Ay",
          "Evet",
        ],
        [
          "Pazarlama Çerezleri",
          "Kampanya ve marka deneyimi performans ölçümü",
          "6 Ay",
          "Evet",
        ],
      ],
    },
    { kind: "heading", text: "3. Çerez Yönetimi ve Tercihler" },
    {
      kind: "paragraph",
      text: "Tarayıcı ayarlarınız üzerinden çerezleri dilediğiniz zaman engelleyebilirsiniz:",
    },
    {
      kind: "list",
      items: [
        "Google Chrome: Ayarlar -> Gizlilik ve Güvenlik -> Çerezler.",
        "Apple Safari: Tercihler -> Gizlilik -> Çerezleri Engelleyin.",
        "Mozilla Firefox: Seçenekler -> Gizlilik ve Güvenlik.",
      ],
    },
    {
      kind: "paragraph",
      text: "Zorunlu çerezlerin kapatılması durumunda web sitemizdeki 3D WebGL içeriklerinin görüntülenmesinde aksamalar yaşanabilir.",
    },
    { kind: "heading", text: "4. İletişim" },
    { kind: "paragraph", text: "E-posta: contact@hibrid360.com" },
  ],
};

export const cookiePolicyEn: LegalDoc = {
  title: "COOKIE POLICY",
  subtitle: "HIBRID360 Web Experience & Digital Tracking Transparency Framework",
  lastUpdated: "Last Updated: July 2026",
  // LEG-02 — final copy deck, August 2026.
  intro:
    "We use a small number of cookies: the ones this site needs to work, and the ones that tell us which pages are useful. You can accept or reject the second group at any time.",
  blocks: [
    { kind: "heading", text: "1. Overview of Cookie Usage" },
    {
      kind: "paragraph",
      text: "This Cookie Policy details how HIBRID360 uses cookies, local browser storage, and web beacons across our Web Experience platform (www.hibrid360.com).",
    },
    {
      kind: "paragraph",
      text: "We employ privacy-first web tracking technologies to ensure optimal 3D/WebGL rendering performance, preserve session security, and evaluate user engagement metrics.",
    },
    { kind: "heading", text: "2. Categorization of Deployed Cookies" },
    {
      kind: "paragraph",
      text: "Cookies deployed on our digital platform are categorized into four distinct operational buckets:",
    },
    {
      kind: "table",
      headers: ["Category", "Function & Purpose", "Lifespan", "Consent Requirement"],
      rows: [
        [
          "Essential / Necessary",
          "Session authentication, WebGL hardware initialization, security tokens",
          "Session / 30 Days",
          "Exempt (Strictly Necessary)",
        ],
        [
          "Performance & Analytics",
          "Anonymized visitor traffic metrics, frame-rate rendering diagnostics",
          "12 Months",
          "Consent Required",
        ],
        [
          "Functional",
          "User language choice, 3D scene lighting preference, spatial audio settings",
          "6 to 12 Months",
          "Consent Required",
        ],
        [
          "Marketing & Experience",
          "Campaign attribution for brand experience and film launch events",
          "6 Months",
          "Consent Required",
        ],
      ],
    },
    { kind: "heading", text: "3. WebGL Diagnostics & Privacy Analytics" },
    {
      kind: "paragraph",
      text: "To deliver high-performance 3D Web Experience applications without lag, our site runs hardware capability checks (GPU tier detection). These checks utilize temporary local session storage and do not link hardware profiles to individual user identities.",
    },
    { kind: "heading", text: "4. Managing Cookies via Browser Settings" },
    {
      kind: "paragraph",
      text: "Users can control or disable cookies through browser settings:",
    },
    {
      kind: "list",
      items: [
        "Apple Safari: Preferences -> Privacy -> Block all cookies.",
        "Google Chrome: Settings -> Privacy and security -> Cookies and other site data.",
        "Mozilla Firefox: Options -> Privacy & Security -> Cookies and Site Data.",
      ],
    },
    {
      kind: "paragraph",
      text: "Note that blocking essential cookies may disable dynamic 3D web features and interactive canvas rendering.",
    },
    {
      kind: "callout",
      text: 'Preference Control: You can modify or revoke your cookie preferences at any time by clicking the "Cookie Settings" link in our website footer.',
    },
    { kind: "heading", text: "5. Contact & Updates" },
    {
      kind: "paragraph",
      text: "For questions regarding our cookie practices, please email privacy@hibrid360.com.",
    },
  ],
};
