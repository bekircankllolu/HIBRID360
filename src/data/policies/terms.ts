import type { LegalDoc } from "@/types/legal";

/**
 * Kullanım Koşulları / Terms of Use.
 * Kaynak: HIBRID360_Kullanim_Kosullari_TR.docx / HIBRID360_Terms_of_Use_EN.docx
 * (HIBRID360_Corporate_Policies_Pack, müşteriden teslim alındı).
 *
 * Bu sayfa brief-rev12.md'nin Bölüm 14 yasal sayfa listesinde yoktu —
 * o liste yalnızca Privacy/Cookie/KVKK/404'ü sayıyordu. Ancak müşteri
 * eksiksiz bir Kullanım Koşulları metni teslim etti; gerçek, onaylı içerik
 * elde var olduğu için sahte içerik üretmek yerine footer'a yeni bir
 * yasal link olarak eklendi (bkz. Footer.tsx, sitemap.ts).
 */

export const termsOfUseTr: LegalDoc = {
  title: "KULLANIM KOŞULLARI",
  subtitle: "HIBRID360 Platform, Web Deneyimi ve Genel Hizmet Kullanım Şartları",
  blocks: [
    { kind: "heading", text: "1. Taraflar ve Sözleşmenin Kabulü" },
    {
      kind: "paragraph",
      text: 'Bu Kullanım Koşulları ("Koşullar"), www.hibrid360.com web sitesini, dijital platformları ve HIBRID360 tarafından sunulan hizmetleri kullanan tüm ziyaretçiler ve müşteriler için geçerlidir.',
    },
    {
      kind: "paragraph",
      text: "Platformu ziyaret ederek veya HIBRID360 ile projelerde çalışarak bu Koşulları kabul etmiş sayılırsınız.",
    },
    { kind: "heading", text: "2. Hizmet Disiplinleri ve Kapsam" },
    {
      kind: "paragraph",
      text: "HIBRID360 aşağıdaki 5 ana alanda yüksek standartlı hizmetler sunar:",
    },
    {
      kind: "list",
      items: [
        "Creative Production: Görsel efekt (VFX), 3D animasyon, CGI, sanat yönetmenliği ve kreatif içerik üretimi.",
        "AI Solutions: Özel yapay zekâ modelleri, algoritmik üretim süreçleri, sentetik medya ve otomatik iş akışları.",
        "Brand Experience: Deneyimsel tasarım, fiziksel ve dijital marka aktivasyonları, mekânsal anlatım.",
        "Web Experience: İleri düzey WebGL/3D web siteleri, etkileşimli arayüzler ve dijital platform mimarisi.",
        "Film Production: Reklam filmi yönetmenliği, sinematografi, post-prodüksiyon, renk düzenleme ve ses mimarisi.",
      ],
    },
    { kind: "heading", text: "3. Fikri ve Sınai Mülkiyet Hakları" },
    {
      kind: "paragraph",
      text: "Platform Hakları: www.hibrid360.com üzerinde yer alan tüm kodlar, WebGL şablonları, 3D tasarımlar, arayüzler ve yazılımlar HIBRID360'ın mülkiyetindedir.",
    },
    {
      kind: "paragraph",
      text: "Proje Teslimat Hakları: Müşteriler için hazırlanan nihai işlerin mülkiyet ve telif hakları, ilgili Hizmet Sözleşmesi ve finansal yükümlülüklerin tamamlanmasıyla müşteriye devredilir.",
    },
    {
      kind: "callout",
      text: "Konsept Taslakları: Proje öncesi sunulan seçilmeyen kreatif konseptler ve yapay zekâ taslakları HIBRID360'a aittir.",
    },
    { kind: "heading", text: "4. Kullanım Kuralları ve Yasaklar" },
    { kind: "paragraph", text: "Kullanıcılar aşağıdaki eylemleri gerçekleştiremezler:" },
    {
      kind: "list",
      items: [
        "HIBRID360 araçlarını, WebGL kodlarını veya yapay zekâ sistemlerini tersine mühendislikle kopyalamak.",
        "Hukuka aykırı, telif ihlali barındıran veya yanıltıcı materyalleri sisteme yüklemek.",
        "Otomatik veri çekme araçları (bot, scraper) kullanarak siteden veri toplamak.",
        "Sistem güvenliğini tehdit edecek siber saldırı veya sızma girişiminde bulunmak.",
      ],
    },
    { kind: "heading", text: "5. Sorumluluğun Sınırlandırılması" },
    {
      kind: "paragraph",
      text: "HIBRID360, platformun kesintisiz ve hatasız çalışması için makul özeni gösterir; ancak sunucu kesintileri veya 3. taraf altyapı aksaklıklarından kaynaklanan dolaylı zararlardan sorumlu tutulamaz.",
    },
    { kind: "heading", text: "6. Uygulanacak Hukuk ve Yetkili Mahkeme" },
    {
      kind: "paragraph",
      text: "Bu Koşulların uygulanmasında Türkiye Cumhuriyeti Hukuku geçerlidir. Doğabilecek uyuşmazlıklarda İstanbul (Çağlayan) Mahkemeleri ve İcra Daireleri yetkilidir.",
    },
    { kind: "heading", text: "7. İletişim" },
    { kind: "paragraph", text: "HIBRID360 Hukuk Departmanı" },
    { kind: "paragraph", text: "E-posta: contact@hibrid360.com | zuhre@hibrid360.com" },
    { kind: "paragraph", text: "Web: www.hibrid360.com" },
  ],
};

export const termsOfUseEn: LegalDoc = {
  title: "TERMS OF USE",
  subtitle: "HIBRID360 Master Platform Conditions, Creative & Web Experience Usage Standards",
  blocks: [
    { kind: "heading", text: "1. Binding Agreement & Acceptance" },
    {
      kind: "paragraph",
      text: 'These Terms of Use ("Terms") constitute a legal agreement between you ("User", "Client", or "Visitor") and HIBRID360 regarding access to and use of our web platform (www.hibrid360.com), proprietary creative tools, interactive web experiences, and production services.',
    },
    {
      kind: "paragraph",
      text: "By navigating our platform or engaging HIBRID360 for Creative Production, AI Solutions, Brand Experience, Web Experience, or Film Production services, you agree to be bound by these Terms.",
    },
    { kind: "heading", text: "2. Multi-Disciplinary Service Scope" },
    {
      kind: "paragraph",
      text: "HIBRID360 operates an integrated studio structured around five core pillars:",
    },
    {
      kind: "list",
      items: [
        "Creative Production: Visual Effects (VFX), 3D animation, CGI, art direction, and high-fidelity asset creation.",
        "AI Solutions: Custom generative AI models, algorithmic creative pipelines, synthetic media creation, and automated workflows.",
        "Brand Experience: Physical and digital brand activations, experiential design, spatial storytelling, and interactive installations.",
        "Web Experience: Next-generation WebGL/3D web environments, custom web applications, dynamic headless architecture, and front-end engineering.",
        "Film Production: Commercial direction, cinematography, virtual production, post-production, color grading, and sound architecture.",
      ],
    },
    { kind: "heading", text: "3. Intellectual Property Rights & Ownership" },
    {
      kind: "paragraph",
      text: "HIBRID360 Platform IP: All interface elements, WebGL shaders, source code, 3D interactive models, brand marks, and custom AI tools contained within www.hibrid360.com remain the exclusive intellectual property of HIBRID360.",
    },
    {
      kind: "paragraph",
      text: "Client Project Deliverables: Ownership rights to final creative deliverables, film master cuts, and digital assets transferred to clients are governed by individual Master Services Agreements (MSAs) and Statements of Work (SOWs), taking effect upon full financial settlement.",
    },
    {
      kind: "callout",
      text: "Exploratory Pitch Material: Preliminary concepts, AI visual pitch decks, and unselected creative proposals remain the sole property of HIBRID360.",
    },
    { kind: "heading", text: "4. Prohibited Conduct & Platform Integrity" },
    {
      kind: "paragraph",
      text: "When accessing or interacting with HIBRID360 digital assets, users agree not to:",
    },
    {
      kind: "list",
      items: [
        "Decompile, reverse-engineer, or attempt to extract neural model weights, WebGL code, or server architecture.",
        "Upload unlawful, defamatory, infringing, or malicious content through project submission tools.",
        "Use automated scraping software, bots, or data mining tools on www.hibrid360.com without express written authorization.",
        "Attempt to bypass security protocols, probe vulnerabilities, or launch denial-of-service (DoS) attacks.",
      ],
    },
    { kind: "heading", text: "5. Disclaimer of Warranties & Limitation of Liability" },
    {
      kind: "paragraph",
      text: 'HIBRID360 digital platforms and interactive previews are provided "as is" and "as available". HIBRID360 makes no warranties regarding uninterrupted availability, zero latency in 3D WebGL rendering, or third-party API reliability.',
    },
    {
      kind: "paragraph",
      text: "HIBRID360 shall not be liable for direct, indirect, incidental, or consequential damages resulting from platform downtime, network latency, or service interruptions.",
    },
    { kind: "heading", text: "6. Governing Law & Legal Forum" },
    {
      kind: "paragraph",
      text: "These Terms shall be governed by and interpreted in accordance with the laws of the Republic of Türkiye.",
    },
    {
      kind: "paragraph",
      text: "Any dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the Courts and Execution Offices of Istanbul, Türkiye.",
    },
    { kind: "heading", text: "7. Contact Information" },
    { kind: "paragraph", text: "HIBRID360 Legal Department" },
    { kind: "paragraph", text: "Email: contact@hibrid360.com | zuhre@hibrid360.com" },
    { kind: "paragraph", text: "Website: www.hibrid360.com" },
  ],
};
