-- Works filtre facet'leri — 29 Ağustos 2026 müşteri revizyonu.
--
-- INNOCEAN referansındaki arşiv filtreleri üç eksene ihtiyaç duyuyor:
-- hizmet, sektör ve format. Üçü de nullable: iş envanteri henüz gelmedi
-- (docs/DECISIONS.md #16) ve mevcut satırların doldurulmasını zorlamak
-- veriyi uydurmaya davet eder. Boş kaldıkları sürece arayüz o filtreyi
-- hiç göstermez — seçenekler veriden türüyor.
--
-- ## Neden `format` değil `content_format`
--
-- `works.format` zaten var ama **başka bir şeyi** anlatıyor: varlık türü
-- (`video` | `image` | `case_study`), NOT NULL ve check constraint'li.
-- Filtredeki "Format" ise içerik formatı (brief 7.1 WORK-05: "Film ·
-- Photography · Live · AI"). Mevcut kolonu yeniden anlamlandırmak, aynı
-- ada iki anlam yüklemek olurdu; bu yüzden ayrı bir kolon açıldı ve
-- `format` olduğu gibi bırakıldı.
--
-- ## `category` neden dokunulmadan bırakıldı
--
-- Arayüzdeki "Format" süzgeci bugüne kadar `category` serbest metnini
-- listeliyordu (WorkArchive.tsx'te belgelenmiş geçici çözüm). Artık
-- `content_format` var, süzgeç oraya bağlandı. `category` verisi
-- **dönüştürülmedi, taşınmadı, silinmedi** — ne anlama geldiği müşteriyle
-- netleşene kadar olduğu yerde duruyor.
--
-- Veri kaybı riski yok: `works` tablosu boş (seed'e sahte proje
-- eklenmiyor), bu yüzden geriye dönük doldurma gerekmiyor.

alter table public.works
  add column if not exists service text,
  add column if not exists industry text,
  add column if not exists content_format text;

comment on column public.works.service is
  'Filtre facet''i: işi üreten hizmet (Creative, Production, ...). src/data/services.ts kataloğuyla hizalanmalı. Envanter gelene kadar null.';
comment on column public.works.industry is
  'Filtre facet''i: müşterinin sektörü. Serbest metin — doğrulanmamış sektör bilgisi uydurulmaz, envanterden gelir.';
comment on column public.works.content_format is
  'Filtre facet''i: içerik formatı (brief 7.1 WORK-05: Film / Photography / Live / AI). works.format ile karıştırılmamalı; o, varlık türüdür.';
comment on column public.works.category is
  'Eski serbest metin gruplama. Anlamı müşteriyle netleşmedi; arayüzde kullanılmıyor. content_format ile karıştırılmamalı.';

-- Filtreli arşiv sorgusu bu üç eksen + yıl üzerinden çalışıyor.
create index if not exists works_facets_idx
  on public.works (service, industry, content_format);

-- View'i yeni kolonlarla yeniden kur. Gizli müşteri maskelemesi ve
-- yayın/izin süzgeci aynen korunuyor — bu view güvenlik sınırı.
--
-- security_barrier bilinçli olarak korundu (security_invoker'a
-- geçirilmedi): taban `works` tablosunun anon/authenticated'a select
-- yetkisi yok, okuma yalnızca bu view üzerinden yapılıyor. invoker'a
-- geçmek view'i anon için tamamen okunamaz hale getirirdi.
drop view if exists public.works_public;

create view public.works_public
with (security_barrier = true)
as
  select
    id,
    slug,
    case when client_name_confidential then null else client_name end as client_name,
    client_name_confidential,
    year,
    format,
    category,
    service,
    industry,
    content_format,
    is_featured,
    cover_image_url,
    video_url,
    case_problem_tr,
    case_problem_en,
    case_solution_tr,
    case_solution_en,
    case_result_tr,
    case_result_en,
    director_id
  from public.works
  where published = true and permission_status = 'approved';

-- drop + create view sahipliği/yetkileri sıfırlar; grant yeniden verilir.
revoke all on public.works_public from anon, authenticated;
grant select on public.works_public to anon, authenticated;
grant all privileges on public.works_public to service_role;
