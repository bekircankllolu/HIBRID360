# İçerik Eksikleri — Contact · Culture · Friends

**Tarih:** 2026-08-26
**Kapsam:** `/contact` · `/culture` (+ alt sayfalar) · `/friends`
**Kural:** Bu dokümanda **hiçbir içerik uydurulmadı.** Her satır ya kodda
duran bir `TODO`'nun, ya `docs/DECISIONS.md`'deki bir açık maddenin, ya da
nihai copy deck'in kendi `[KARAR]` / `[DOĞRULA]` işaretinin karşılığıdır.

Amaç: müşteriye tek seferde sorulabilecek net bir liste çıkarmak.
Her madde **kim cevaplayacak**, **ne olmadan ne yayınlanamaz** ve
**kodda nereye bağlı** bilgisiyle birlikte veriliyor.

---

## 0. Öncelik özeti

| Aciliyet | Madde sayısı | Ne bloke ediyor |
|---|---|---|
| 🔴 **Yayın bloklayıcı** | 5 | Bunlar olmadan site yayına alınamaz |
| 🟠 **Sayfa bloklayıcı** | 4 | İlgili sayfa eksik/boş kalır, site yayınlanabilir |
| 🟡 **İyileştirme** | 5 | Sayfa çalışıyor, daha iyi olabilir |

---

## 1. 🔴 Şirket resmi ünvanı

| | |
|---|---|
| **Soru** | Şirketin tam yasal ünvanı nedir? (Örn: "Hibrid 360 Reklam ve Prodüksiyon A.Ş." / "… Ltd. Şti.") |
| **Neden gerekli** | Footer telif satırı, KVKK aydınlatma metni, Gizlilik Politikası'ndaki "veri sorumlusu" alanı ve `schema.org` `legalName` alanı bu bilgi olmadan eksik |
| **Bugün ne var** | `SITE_NAME = "Hibrid 360"` — marka adı. Yasal ünvan **hiçbir yerde yok** |
| **Kodda nerede** | `src/lib/site.ts` (TODO kaydı mevcut) · `src/lib/schema.ts` · yasal sayfalar |
| **Bağlı karar** | `docs/DECISIONS.md` #1, #4 — AÇIK |
| **Bu olmadan** | KVKK/Gizlilik sayfaları hukuken eksik yayınlanır |

## 2. 🔴 İletişim e-postası teyidi

| | |
|---|---|
| **Soru** | `contact@hibrid360.com` yayına girecek nihai adres mi? Bu kutu aktif mi, kim okuyor? |
| **Neden gerekli** | Adres footer'da, Contact sayfasında ve form gönderim bildirimlerinde kullanılıyor |
| **Bugün ne var** | `contact@hibrid360.com` kullanılıyor — deck'in kendi verdiği adres (GEN-05 ve CON-03'te iki kez geçiyor), **ama teyit edilmedi** |
| **Kodda nerede** | `src/lib/site.ts` → `CONTACT.email` |
| **Bağlı karar** | `docs/DECISIONS.md` #5 — AÇIK · kod yorumu: *"son onay gelmeden bu sayfa/footer yayına alınmamalı"* |
| **Bu olmadan** | Site yayına alınırsa gelen talepler okunmayan bir kutuya düşebilir |

## 3. 🔴 Telefon numarası teyidi

| | |
|---|---|
| **Soru** | `+90 532 613 50 45` doğru mu? Bu bir cep numarası — sitede yayınlanması onaylanıyor mu? Kurumsal sabit hat tercih edilir mi? |
| **Neden gerekli** | Numara Contact künye kartında ve WhatsApp bağlantısında kullanılıyor (`wa.me` linki bu numaradan türetiliyor) |
| **Bugün ne var** | Nihai copy deck brief-rev12'deki sabit hattı (`+90 216 606 88 98`) **değiştirmiş**, yerine bu cep numarasını vermiş. Deck içinde iki kez teyit ediliyor ama müşteriden ayrıca onay alınmadı |
| **Kodda nerede** | `src/lib/site.ts` → `CONTACT.phone` |
| **Bu olmadan** | Kişisel bir numara kamuya açık yayınlanmış olur — bu bir onay gerektirir |

## 4. 🔴 Adres ve yol tarifi teyidi

| | |
|---|---|
| **Soru** | "Feneryolu Mahallesi, Ebru Sk. Manolya Apt. No: 3A / 3B · Kadıköy — İstanbul" güncel ofis adresi mi? |
| **Neden gerekli** | Adres Contact künye kartında, footer'da, `schema.org` `PostalAddress` alanında ve Google Maps yol tarifi bağlantısında kullanılıyor |
| **Bugün ne var** | Adres deck'ten alındı ve kullanılıyor. Yol tarifi bağlantısı **uydurma bir place-id değil**, adresten türetilen resmi Google Maps `dir/?api=1` şeması |
| **Kodda nerede** | `src/lib/site.ts` → `CONTACT.addressLines` · `src/app/[locale]/contact/page.tsx` |
| **Ayrıca sorulacak** | Gömülü harita istiyor musunuz? İsteniyorsa Google Maps veya Mapbox **API anahtarı** gerekiyor — bugün yok (kodda TODO). Şu an yerine adres/telefon/e-posta taşıyan bir künye kartı duruyor, boş bir kutu değil |

## 5. 🔴 Müşteri listesi — 5 isim doğrulama bekliyor

| | |
|---|---|
| **Soru** | Şu beş isim doğru mu, bu markalar gerçekten müşteri mi? **Sirmasion · Meribell Cafe · Bonakare · Kerschkaret · Pleaon Sportivo** |
| **Neden gerekli** | Nihai copy deck bu beş ismi `[DOĞRULA]` olarak işaretledi — yazımları veya varlıkları şüpheli |
| **Bugün ne var** | Kod bunları `verified: false` olarak ayrı tutuyor; silinmediler ama işaretliler |
| **Kodda nerede** | `src/data/clients.ts` |
| **Bu olmadan** | Yanlış yazılmış ya da hiç müşteri olmayan bir marka adı yayınlanma riski |

---

## 6. 🟠 Müşteri logoları — hiç yok

| | |
|---|---|
| **Soru** | Müşteri logolarını (vektörel, tercihen SVG/EPS) paylaşabilir misiniz? Her marka için **logo kullanım izni** var mı? |
| **Neden gerekli** | Friends sayfası bugün 60+ müşteriyi **düz metin listesi** olarak gösteriyor. Eski site de aynıydı. Logo ızgarası bu sayfayı bambaşka bir seviyeye taşır |
| **Bugün ne var** | Hiç logo yok — ne repoda, ne müşteriden gelen 119 dosyalık fotoğraf arşivinde |
| **Kodda nerede** | `src/components/friends/ClientLogoGrid.tsx` (TODO: *"müşteri logoları teslim edilmedi; ızgara …"*) |
| **Dikkat** | Logo kullanım izni, işin yayın izninden **ayrı** bir izindir. Bir markayla çalışmış olmak, logosunu sitede kullanma hakkı vermez |

## 7. 🟠 Yeni müşteri grubu — sözleşme izni kontrolü

| | |
|---|---|
| **Soru** | Deck'in "yeni müşteriler" (FRD-03) olarak eklediği markaların **sözleşmelerinde referans olarak yayınlanma izni** var mı? |
| **Neden gerekli** | Deck'in kendi notu: *"[KARAR] Bu markaların adlarının ve logolarının referans olarak yayınlanması için sözleşmelerde izin olup olmadığı kontrol edilmeli"* |
| **Bugün ne var** | Kod bu grubu hazır tutuyor ama `SHOW_NEW_CLIENTS` bayrağı `false` — **sayfada görünmüyorlar** |
| **Kodda nerede** | `src/data/clients.ts` → `newClients` |
| **Not** | Bu madde `docs/DECISIONS.md`'ye henüz eklenmemiş; kod yorumu ekleme gereğini not düşüyor |

## 8. 🟠 Directors & Crew — kadro listesi yok

| | |
|---|---|
| **Soru** | Sayfaya kimler girecek? Her kişi için: **ad-soyad · rol · şehir · diller · kadrolu mu / freelance mı · tek cümlelik tanım · biyografi · reel video linki** |
| **Neden gerekli** | Sayfa kodda hazır (liste + kişi detay sayfası + reel alanı), veri tabanı tablosu hazır — **tek eksik kadro** |
| **Bugün ne var** | Sayfa boş durum gösteriyor. Supabase `directors` tablosu boş |
| **Kodda nerede** | `src/app/[locale]/culture/directors/page.tsx` · `.../[slug]/page.tsx` · `src/lib/content.ts` |
| **Bağlı karar** | `docs/DECISIONS.md` #14 — AÇIK |
| **Bu olmadan** | Directors & Crew sayfası boş kalır. Site yayınlanabilir ama bu sayfa eksiktir |

## 9. 🟠 Ekip fotoğraf çekimi — planlanmadı

| | |
|---|---|
| **Soru** | Ekip fotoğraf çekimi ne zaman yapılacak? Kaç kişi katılacak? |
| **Neden gerekli** | Directors & Crew sayfası için tutarlı, aynı ışıkta çekilmiş portreler gerekiyor. Karışık kaynaklı (telefon/eski çekim) fotoğraflar sayfayı bozar |
| **Bugün ne var** | Hiç ekip fotoğrafı yok. Müşteri arşivinde de kullanılabilir portre yok |
| **Bağlı karar** | `docs/DECISIONS.md` #14 — AÇIK |
| **Öneri** | Çekim, kadro listesi kesinleşmeden planlanmasın — ama kadro listesi de çekimi beklemesin. İkisi paralel yürüyebilir; sayfa fotoğrafsız da (baş harf/monogram ile) yayınlanabilir |
| **Ek** | Kurucu fotoğrafı da eksik — `culture/who-we-are` sayfasında ayrı TODO |

## 10. 🟠 Studio Food Room bilgileri

| | |
|---|---|
| **Soru** | Studio Food Room hakkında ne yayınlanacak? Gereken: **ne olduğu (2-3 cümle) · konumu · kapasitesi/imkânları · görselleri · logosu · web sitesi/sosyal medya linki** |
| **Neden gerekli** | Deck (PAR-03) MOTIVE'yi partner listesinden çıkardı; **Studio Food Room artık tek partner**. Yani Partners sayfasının içeriğinin tamamı bu tek partnere bağlı |
| **Bugün ne var** | Sadece adı geçiyor. `src/data/service-production.ts` içinde tek bir cümle var: *"our own kitchen studio for food and product shoots (Studio Food Room)"* |
| **Kodda nerede** | `src/app/[locale]/culture/partners/page.tsx` · `src/data/service-production.ts` |
| **Bu olmadan** | Partners sayfası tek satırlık bir sayfa olarak kalır |

---

## 11. 🟡 Müşteri sözleri (testimonial) — hiç kayıt yok

| | |
|---|---|
| **Soru** | Hangi müşterilerden söz alınacak? Her söz için: **tek cümle (max 20 kelime) · ad-soyad · unvan · marka · yazılı onay** |
| **Neden gerekli** | Friends sayfasının asıl gücü isim listesi değil, müşteri sözleri olacak (brief 18.7) |
| **Bugün ne var** | Bileşen hazır, `testimonials` tablosu boş. Kod **yazılı onayı olmayan hiçbir sözü render etmiyor** — `is_published` tek başına yetmiyor, `written_consent_confirmed` de gerekiyor |
| **Kodda nerede** | `src/components/testimonials/TestimonialList.tsx` |
| **Kural** | Brief 18.7: *"İsimsiz söz kullanılmaz."* Anonim testimonial yayınlanmayacak |

## 12. 🟡 David Ogilvy alıntısı — atıf doğrulanmadı

| | |
|---|---|
| **Soru** | Partners sayfasındaki alıntı gerçekten David Ogilvy'ye mi ait? |
| **Neden gerekli** | Mevcut sitede alıntı MOTIVE'ye atfedilmiş; nihai deck reklamcılıkta Ogilvy'ye ait olduğunu söylüyor **ama kesin doğrulama istiyor** (`[DOĞRULA]`) |
| **Bugün ne var** | Atıf deck'teki hâliyle bırakıldı, kodda TODO düşüldü |
| **Kodda nerede** | `src/app/[locale]/culture/partners/page.tsx` |
| **Risk** | Yanlış atıf, reklam sektörüne hitap eden bir sitede itibar kaybı |

## 13. 🟡 Culture hub — üç bölüm adının TR karşılığı

| | |
|---|---|
| **Soru** | "What We Believe", "Directors & Crew", "Partners" başlıklarının TR karşılıkları ne olacak? |
| **Neden gerekli** | Culture hub'da "Biz Kimiz" ve "Sürdürülebilirlik" çevrildi, bu üçü İngilizce kaldı → aynı ızgarada karışık dil. CLAUDE.md: *"karışık dil yasak"* |
| **Bugün ne var** | Deck TR karşılığını vermediği için İngilizce bırakıldı (onaysız çeviri uydurulmuyor) |
| **Kodda nerede** | `messages/tr.json` → `culture.hub.*` |
| **Not** | Bu, `docs/DECISIONS.md`'deki "TR çevirisi bekleyen metinler" tablosunun bir satırı — o tabloda toplam **7 blok** bekliyor |

## 14. 🟡 Sosyal medya hesapları

| | |
|---|---|
| **Soru** | Instagram · Vimeo · YouTube · LinkedIn · Spotify hesaplarının **gerçek URL'leri** neler? Hepsi aktif mi? |
| **Neden gerekli** | Footer'da platform adları listeleniyor ama **hiçbiri tıklanabilir değil** — link yok |
| **Bugün ne var** | `SOCIAL_PLATFORMS` dizisi sadece isimleri taşıyor. `schema.org` `sameAs` alanı da bu yüzden boş |
| **Kodda nerede** | `src/lib/site.ts` → `SOCIAL_PLATFORMS` · `src/components/layout/Footer.tsx` |
| **Bağlı** | brief-rev12 Bölüm 17.2 — hesaplar "var/açılacak" durumda, URL'ler teyit edilmemiş |

## 15. 🟡 Randevu linki (Cal.com)

| | |
|---|---|
| **Soru** | "30 dakikalık tanışma görüşmesi" için takvim hesabı açılacak mı? Cal.com onaylanıyor mu, yoksa Calendly mi? |
| **Neden gerekli** | Sitenin **birincil eylemi** bu (DECISIONS #12). Contact sayfasında ve her sayfanın CTA bandında butonu var |
| **Bugün ne var** | Buton var, gerçek link yok — kodda TODO |
| **Kodda nerede** | `src/components/cta/CtaBand.tsx` · `src/app/[locale]/contact/page.tsx` |
| **Bağlı karar** | `docs/DECISIONS.md` #11 — VARSAYILANLA İLERLE (Cal.com önerisi) |

---

## 16. Sorumluluk dağılımı

| Kim | Maddeler |
|---|---|
| **Müşteri (Hibrid 360)** | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15 |
| **Hukuk danışmanı** | 1 (ünvan), 6–7 (logo/referans izni), 11 (yazılı onay metni) |
| **Web ekibi** | 12 (atıf araştırması) · 15 (hesap açılınca entegrasyon) |

## 17. Yayın için minimum set

Site yayına alınabilmesi için **en az** şunlar gerekiyor:

1. Şirket resmi ünvanı (madde 1)
2. E-posta teyidi (madde 2)
3. Telefon onayı (madde 3)
4. Adres teyidi (madde 4)
5. Müşteri listesindeki 5 ismin doğrulanması (madde 5)

Geri kalan maddeler sayfaları **eksik** bırakır ama yayını bloke etmez —
o sayfalar dürüst boş durumlarıyla yayınlanabilir.

---

### İlgili dokümanlar

- `docs/DECISIONS.md` — açık kararların ana kaydı (#1, #4, #5, #11, #14) + TR çeviri bekleyen 7 blok
- `docs/work/WORK_INVENTORY_REQUEST.md` — Work içerik talebi (bu dokümanla **çakışmıyor**, tamamlıyor)
- `docs/visual-audit/BLOCKERS.md` — görsel/telif blocker'ları
- `docs/mona/MONA_ART_DIRECTION.md` — MONA prodüksiyon kararları
