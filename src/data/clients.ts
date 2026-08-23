/**
 * Müşteri (Friends) listesi — FRD-02/03 (nihai copy deck, Ağustos 2026).
 * Bu liste brief-rev12.md Bölüm 8.2/8.3'ün yerini alır: deck "15 yazım
 * hatası düzeltildi" diyerek düzeltilmiş, daha kapsamlı bir isim listesi
 * veriyor — eski kısa liste bu yüzden tamamen değiştirildi.
 *
 * `clients` = FRD-02, yayına hazır kabul edilen düzeltilmiş liste.
 * Deck'in kendi [DOĞRULA] işaretlediği beş isim (Sirmasion · Meribell
 * Cafe · Bonakare · Kerschkaret · Pleaon Sportivo) `verified: false`
 * olarak ayrı tutuluyor — silinmedi, sadece yayın öncesi teyit gerekiyor.
 *
 * `newClients` = FRD-03, deck'in "[KARAR] Bu markaların adlarının ve
 * logolarının referans olarak yayınlanması için sözleşmelerde izin olup
 * olmadığı kontrol edilmeli" notuyla eklediği yeni müşteriler. Bu karar
 * kapanmadan (docs/DECISIONS.md'ye eklenmeli) bu grup yayına alınmamalı;
 * kod içinde hazır tutuluyor, sayfa bu grubu `SHOW_NEW_CLIENTS` false
 * iken göstermiyor.
 */
export interface ClientEntry {
  name: string;
  /** false = deck'in [DOĞRULA] işareti; yayın öncesi isim/varlık teyidi gerekiyor. */
  verified: boolean;
}

export const clients: ClientEntry[] = [
  { name: "Koç Holding", verified: true },
  { name: "Diler Holding", verified: true },
  { name: "Adalı Holding", verified: true },
  { name: "Ciner Holding", verified: true },
  { name: "Peker Holding", verified: true },
  { name: "Delta Holding", verified: true },
  { name: "Mermerler Holding", verified: true },
  { name: "Delta Group", verified: true },

  { name: "Arçelik A.Ş.", verified: true },
  { name: "Arçelik Corporate", verified: true },
  { name: "Arçelik", verified: true },
  { name: "Beko", verified: true },
  { name: "Beko Corporate", verified: true },
  { name: "Token Inc.", verified: true },
  { name: "Arçelik – Beko Yetkili Servis", verified: true },
  { name: "Arçelik Perakende TV", verified: true },
  { name: "Arçelik Perakende Akademi", verified: true },
  { name: "Arçelik Servis Akademi", verified: true },

  { name: "Tat Gıda A.Ş.", verified: true },
  { name: "TEB BNP Paribas Leasing", verified: true },
  { name: "Cornelia Golf Resort", verified: true },
  { name: "Doppelherz", verified: true },
  { name: "İzmir Büyükşehir Belediyesi", verified: true },
  { name: "Chery Otomobil", verified: true },
  { name: "Güzel İşler Derneği", verified: true },
  { name: "Renova", verified: true },

  { name: "Girne Amerikan Üniversitesi", verified: true },
  { name: "Kuzey Kıbrıs Üniversitesi", verified: true },
  { name: "Önlem Çocuk Bezi", verified: true },
  { name: "Emay İnşaat", verified: true },
  { name: "Kent Plus", verified: true },
  { name: "Brandium", verified: true },
  { name: "Panorama İnşaat", verified: true },
  { name: "North İstanbul", verified: true },
  { name: "Panavia Suites", verified: true },
  { name: "Sultan Makamı Evleri", verified: true },

  { name: "Regie Ottoman Hotel", verified: true },
  { name: "Grand Yazıcı Otelleri", verified: true },
  { name: "Mares Hotel Marmaris", verified: true },
  { name: "Turban Hotel Marmaris", verified: true },
  { name: "Palace Hotel Marmaris", verified: true },
  { name: "Le Chalet", verified: true },
  { name: "Palace Beach Club", verified: true },
  { name: "Taksim Ottoman Palace", verified: true },

  { name: "Pidi Pidi Baby Shoes", verified: true },
  { name: "Reha Tekstil", verified: true },
  { name: "Kral Tekstil", verified: true },
  { name: "Kral Termal Hotels", verified: true },
  { name: "Minia Catering & Patisserie İstanbul", verified: true },
  { name: "Grand Hubb Greeting Cards", verified: true },
  { name: "Pescado Fish Restaurant", verified: true },
  { name: "Wellness Club Turban", verified: true },
  { name: "Arcadia Spa", verified: true },
  { name: "Dalyan Club", verified: true },

  { name: "İstanbul 2010 Culture Co.", verified: true },
  { name: "Magnolia Concept Store", verified: true },
  { name: "Clarte", verified: true },
  { name: "Dr. Çağrı Sade", verified: true },
  { name: "Monalisa Laser & Beauty Center", verified: true },
  { name: "Gazelle Next", verified: true },
  { name: "Mamamia Wedding & Ceremony", verified: true },
  { name: "Calibre", verified: true },
  { name: "Balçova Rotary Kulübü", verified: true },

  { name: "Türkiye Yarış Atları Yetiştiricileri ve Sahipleri Derneği", verified: true },
  { name: "Türkiye Hayvanları Koruma Derneği", verified: true },

  // [DOĞRULA] — deck bu beşini ayrı işaretledi, yayın öncesi teyit gerekiyor.
  { name: "Sirmasion", verified: false },
  { name: "Meribell Cafe", verified: false },
  { name: "Bonakare", verified: false },
  { name: "Kerschkaret", verified: false },
  { name: "Pleaon Sportivo", verified: false },
];

/**
 * FRD-03 — [KARAR] sözleşme izni netleşmeden yayına alınmamalı. Sayfa bu
 * grubu SHOW_NEW_CLIENTS false iken render etmiyor (bkz. friends/page.tsx).
 */
export const newClients: string[] = [
  "Koç Finans",
  "Altus",
  "Grundig",
  "Oliz",
  "Whirlpool",
  "Hotpoint",
  "Ariston",
  "Leisure",
  "Hitachi",
  "Ödero",
  "Tokenflex",
  "WAT Motor",
  "WAT Mobilite",
  "Tatil Plus",
  "Ticari Liderlik Programı",
];

/** TODO: docs/DECISIONS.md — FRD-03 [KARAR] kapanınca true yapılacak. */
export const SHOW_NEW_CLIENTS = false;
