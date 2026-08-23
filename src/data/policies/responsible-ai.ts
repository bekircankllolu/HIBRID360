import type { LegalDoc } from "@/types/legal";

/**
 * Sorumlu Yapay Zekâ Politikası / Responsible AI Policy.
 * Kaynak: HIBRID360_Sorumlu_Yapay_Zeka_Politikasi_TR.docx /
 * HIBRID360_Responsible_AI_Policy_EN.docx (HIBRID360_Corporate_Policies_Pack,
 * müşteriden teslim alındı).
 *
 * brief-rev12.md Bölüm 18.9 (AI Usage & Rights) bu sayfa için yalnızca bir
 * İSKELET tanımlamıştı — brief'in kendi notu: "buradaki başlıklar
 * iskelettir... Bu sayfa hukuk danışmanıyla birlikte yazılmalı." Şimdi
 * hukuk danışmanı tarafından yazılmış gerçek metin elimizde; bu yüzden
 * sayfa brief'in geçici iskelet başlıkları yerine müşterinin teslim ettiği
 * dokümanın kendi başlık yapısını kullanıyor — brief'in beklediği tam
 * olarak buydu.
 *
 * DÜZELTİLEN YAZIM HATASI: TR dokümanındaki "contact @hibrid360.com"
 * ifadesindeki fazladan boşluk kaldırıldı (mailto: bağlantısı kırılmasın
 * diye) — bu, brief Bölüm 15'teki dokümandaki e-posta/yazım hatalarının
 * düzeltilmesi kuralının fonksiyonel karşılığıdır.
 */

export const responsibleAiPolicyTr: LegalDoc = {
  title: "SORUMLU YAPAY ZEKÂ POLİTİKASI",
  subtitle: "HIBRID360 Etik Yapay Zekâ Üretim ve Yönetişim Çerçevesi",
  lastUpdated: "Tarih: Temmuz 2026",
  blocks: [
    { kind: "heading", text: "1. Etik Vizyon ve Yönetişim" },
    {
      kind: "paragraph",
      text: "HIBRID360, insan yaratıcılığı ile ileri yapay zekâ teknolojilerini birleştiren bir inovasyon stüdyosudur. Yapay zekâyı, insan sanatçıların yeteneklerini çoğaltan ve üretim standartlarını yükselten bir araç olarak kabul ediyoruz.",
    },
    {
      kind: "paragraph",
      text: "Bu Sorumlu Yapay Zekâ Politikası; Creative Production, AI Solutions, Brand Experience, Web Experience ve Film Production süreçlerimizde uygulanan etik ve hukuki standartları belirler.",
    },
    { kind: "heading", text: "2. Temel İlkelerimiz" },
    {
      kind: "paragraph",
      text: "Yapay zekâ iş akışlarımız 4 temel ilke üzerine inşa edilmiştir:",
    },
    {
      kind: "table",
      headers: ["İlke", "Açıklama", "Uygulama Alanı"],
      rows: [
        [
          "İnsan Denetimi (HITL)",
          "İnsan karar mekanizması esastır",
          "Tüm yapay zekâ içerikleri Kreatif Direktör onayından geçer.",
        ],
        [
          "Telif ve Veri Saygısı",
          "Lisanslı veri kullanımı",
          "Telif ihlali barındıran veri setleri modellerde kullanılmaz.",
        ],
        [
          "Şeffaflık ve İzlenebilirlik",
          "İçerik menşei açıklaması",
          "Yapay zekâ üretimi materyaller talep halinde etiketlenir.",
        ],
        [
          "Tarafsızlık ve Çeşitlilik",
          "Ayrımcılığın önlenmesi",
          "Görsel veri modellerinde önyargı ve kalıp denetimi yapılır.",
        ],
      ],
    },
    { kind: "heading", text: "3. Telif Hakları, Model Eğitimi ve Veri Güvenliği" },
    {
      kind: "list",
      items: [
        "Lisanslı Model Kullanımı: Yalnızca ticari kullanıma uygun, lisanslı ve açık kaynak etik kurallarına uyan modeller tercih edilir.",
        "Müşteri Verisi İzolasyonu: Müşterilerimize ait marka verileri genel modellerin eğitilmesinde KESİNLİKLE kullanılmaz.",
        "Sanatçı Hakları: Yaşayan bireysel sanatçıların tarzlarını izinsiz kopyalayan modeller üretilmez.",
      ],
    },
    {
      kind: "callout",
      text: "Gizlilik Garantisi: Müşteri projeleri için eğitilen özel LoRA ve model ağırlıkları yalnızca ilgili müşterinin kullanımına sunulur.",
    },
    { kind: "heading", text: "4. Sentetik Medya ve Dezenformasyon Yasağı" },
    {
      kind: "paragraph",
      text: "Sentetik Ses ve Kişilik Kullanımı: Gerçek kişilerin ses veya yüz replikalarının üretilmesi, ilgili kişilerin açık ve yazılı rızasına bağlıdır.",
    },
    {
      kind: "paragraph",
      text: "Dezenformasyon Yasağı: HIBRID360, kamuoyunu yanıltma, itibar zedeleme veya siyasi manipülasyon amaçlı deepfake üretimi kesinlikle yapmaz.",
    },
    { kind: "heading", text: "5. Çevreye Duyarlı Yapay Zekâ" },
    {
      kind: "paragraph",
      text: "Yüksek işlemci gücü gerektiren yapay zekâ üretimlerimizde, yenilenebilir enerji kullanan yeşil bulut veri merkezleri tercih edilmektedir.",
    },
    { kind: "heading", text: "6. Yapay Zekâ Etik Kurulu ve İletişim" },
    {
      kind: "paragraph",
      text: "Şirketimiz bünyesindeki Yapay Zekâ Etik Kurulu üretim süreçlerini denetler.",
    },
    {
      kind: "paragraph",
      text: "Sorularınız için contact@hibrid360.com adresinden iletişime geçebilirsiniz.",
    },
  ],
};

export const responsibleAiPolicyEn: LegalDoc = {
  title: "RESPONSIBLE AI POLICY",
  subtitle: "HIBRID360 Ethical Artificial Intelligence Framework for Creative Production & Film",
  lastUpdated: "Effective Date: July 2026",
  blocks: [
    { kind: "heading", text: "1. Vision & Ethical Governance" },
    {
      kind: "paragraph",
      text: "At HIBRID360, we pioneer the integration of human creative brilliance with advanced Artificial Intelligence. We believe AI should serve as an multiplier for human artistic vision, accelerating workflows while safeguarding intellectual property, human dignity, and ethical standards.",
    },
    {
      kind: "paragraph",
      text: "This Responsible AI Policy establishes the mandatory ethical framework for all AI tools, neural pipelines, synthetic media, and generative workflows utilized across Creative Production, AI Solutions, Brand Experience, Web Experience, and Film Production.",
    },
    { kind: "heading", text: "2. Core Principles of Responsible AI" },
    {
      kind: "paragraph",
      text: "Our ethical AI strategy is grounded in four fundamental pillars:",
    },
    {
      kind: "table",
      headers: ["Pillar", "Core Mandate", "Operational Implementation"],
      rows: [
        [
          "Human-in-the-Loop (HITL)",
          "Human editorial authority",
          "Creative Directors must review and approve all AI-assisted outputs before delivery.",
        ],
        [
          "Copyright Respect",
          "Ethical dataset sourcing",
          "No unlicensed copyrighted art or proprietary media used in model training.",
        ],
        [
          "Transparency & Provenance",
          "Disclosure of synthetic assets",
          "AI-generated visual or audio elements labeled upon client request.",
        ],
        [
          "Fairness & Inclusivity",
          "Mitigation of algorithmic bias",
          "Prompts and training datasets audited to prevent harmful stereotypes.",
        ],
      ],
    },
    { kind: "heading", text: "3. Copyright, Model Fine-Tuning & Asset Security" },
    {
      kind: "list",
      items: [
        "Ethical Model Selection: We utilize commercial foundation models trained on licensed, public domain, or ethically sourced training datasets.",
        "Client Asset Protection: Custom fine-tuned weights (LoRAs, ControlNets) created for specific brand campaigns are kept strictly isolated and remain exclusive to that client.",
        "Anti-Scraping Stance: HIBRID360 does not engage in scraping living independent artists' works without consent.",
      ],
    },
    {
      kind: "callout",
      text: "Zero Data Leakage: Client brief inputs and visual assets are stored in encrypted sandbox environments and never leaked into public training corpora.",
    },
    { kind: "heading", text: "4. Synthetic Media, Likeness Safeguards & Anti-Deception" },
    {
      kind: "paragraph",
      text: "Synthetic Voice & Likeness Policy: Generating digital replicas, synthetic voice cloning, or visual deepfakes of living or deceased individuals requires explicit, written consent and clear contractual authorization.",
    },
    {
      kind: "paragraph",
      text: "Prohibition of Malicious Media: HIBRID360 strictly prohibits generating synthetic media intended for political manipulation, disinformation, defamation, or fraud.",
    },
    { kind: "heading", text: "5. Environmental Sustainability in AI Computing" },
    {
      kind: "paragraph",
      text: "Recognizing the energy intensity of high-resolution AI rendering and 3D generation, HIBRID360 partners with green cloud data centers powered by renewable energy and optimizes prompt engineering to reduce compute overhead.",
    },
    { kind: "heading", text: "6. Governance & Ethics Oversight" },
    {
      kind: "paragraph",
      text: "HIBRID360 maintains an internal AI Ethics Oversight Committee comprising Creative Directors, Lead Engineers, and Legal Counsel. For inquiries, contact ai-ethics@hibrid360.com.",
    },
  ],
};
