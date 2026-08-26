# Supabase Kurulum Notu

Bu repo Supabase tarafında çalışacak başlangıç şemasını içerir. Gerçek proje
henüz bağlanmadığı için son adım müşteri Supabase hesabı açıldıktan sonra
yapılacaktır.

## Hazır Olanlar

- `supabase/config.toml`: local Supabase CLI yapılandırması.
- `supabase/migrations/20260826212814_initial_hibrid360_schema.sql`: başlangıç
  migration'ı.
- `supabase/seed.sql`: boş seed. İzinli gerçek veri gelmeden seed eklenmez.
- `docs/supabase-schema.sql`: aynı migration'ın okunabilir doküman kopyası.

## Migration İçeriği

- `works`, `directors`, `testimonials`, `insights_posts`
- `brief_submissions`, `contact_submissions`
- `works_public` view'i ile gizli müşteri adı maskeleme
- Public okuma için yalnızca yayın/onay süzgeçli RLS politikaları
- Form tablolarında yalnızca `kvkk_consent = true` insert politikası
- Explicit `grant` tanımları; yeni Supabase Data API auto-exposure değişikliğine
  bağımlı değil

## Müşteri Hesabı Açılınca

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Vercel env:

```bash
NEXT_PUBLIC_SUPABASE_URL=<project-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` fallback olarak desteklenir. `service_role`
anahtarı frontend ortam değişkenlerine girmez.

## Doğrulama

Projeye bağlandıktan sonra Supabase Dashboard SQL Editor'da şu kontroller
çalıştırılabilir:

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;

select *
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated')
order by table_name, privilege_type;
```

Beklenti: içerik tablolarında RLS açık; `brief_submissions` ve
`contact_submissions` public select/update/delete açmaz; `works_public` public
select alır, `works` taban tablosu public select almaz.
