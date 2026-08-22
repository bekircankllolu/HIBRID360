-- Hibrid 360 web sitesi — Supabase şema
-- Faz 1'de çalıştırılacak ilk migration

-- ==========================================================
-- DIRECTORS & CREW  (works tablosundan referans alındığı için önce kurulur)
-- ==========================================================
create table directors (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  full_name text not null,
  role text not null, -- Yönetmen / DOP / Fotoğrafçı / Kurgu / Colorist
  one_liner_tr text,
  one_liner_en text,
  bio_tr text,
  bio_en text,
  reel_video_url text,
  photo_url text,
  city text default 'İstanbul',
  languages text[] default array['TR', 'EN'],
  relationship_type text default 'freelance' check (relationship_type in ('staff', 'freelance')),
  is_published boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ==========================================================
-- WORKS (Works sayfası + vaka sayfaları)
-- ==========================================================
create table works (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  client_name text not null,
  client_name_confidential boolean default false, -- izin yoksa marka adı gizlenir
  year integer not null,
  format text not null check (format in ('video', 'image', 'case_study')),
  category text, -- Creative / Production / Digital / AI / Live Broadcast / Photography
  is_featured boolean default false, -- Recent Works'te öne çıksın mı
  permission_status text default 'pending' check (permission_status in ('approved', 'pending', 'not_allowed')),
  cover_image_url text,
  video_url text,
  -- vaka sayfası şablonu (Sorun / Çözüm / Sonuç / Kanıt)
  case_problem_tr text,
  case_problem_en text,
  case_solution_tr text,
  case_solution_en text,
  case_result_tr text, -- rakam + kalın satır
  case_result_en text,
  director_id uuid references directors(id),
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==========================================================
-- TESTIMONIALS (müşteri sözleri — video + yazılı)
-- ==========================================================
create table testimonials (
  id uuid primary key default gen_random_uuid(),
  person_name text not null,
  person_title text not null,
  brand_name text not null,
  quote_tr text,
  quote_en text,
  video_url_vertical text,
  video_url_horizontal text,
  work_id uuid references works(id), -- ilgili vaka sayfasına bağlanabilir
  placement text[] default array['friends'], -- friends / works / homepage / service_production
  written_consent_confirmed boolean default false, -- yayın için zorunlu
  is_published boolean default false,
  created_at timestamptz default now()
);

-- ==========================================================
-- INSIGHTS (blog / GEO içerik motoru)
-- ==========================================================
create table insights_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_tr text not null,
  title_en text not null,
  summary_tr text, -- yazı başında 3-5 maddelik özet (AI araçları bunu alıntılıyor)
  summary_en text,
  body_tr text,
  body_en text,
  cover_image_url text,
  category text,
  published_at timestamptz,
  last_reviewed_at timestamptz, -- 3 ayda bir güncelleme kuralı için
  author_name text,
  author_title text,
  is_published boolean default false,
  created_at timestamptz default now()
);

-- ==========================================================
-- BRIEF BUILDER (MONA'nın 6 soruluk form işlevi)
-- ==========================================================
create table brief_submissions (
  id uuid primary key default gen_random_uuid(),
  what_making text, -- reklam filmi / ürün-how-to / sosyal medya / canlı yayın / fotoğraf / emin değil
  who_for text, -- marka adı + hedef kitle serbest metin
  when_live text, -- 2 hafta / 1 ay / 2-3 ay / belirsiz
  where_running text[], -- TV / Instagram-TikTok / YouTube / web / bayi ekranları / etkinlik
  budget_band text,
  reference_link text,
  reference_file_url text,
  contact_email text not null,
  kvkk_consent boolean not null default false,
  language text default 'tr' check (language in ('tr', 'en')),
  status text default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz default now()
);

-- ==========================================================
-- CONTACT (genel iletişim formu)
-- ==========================================================
create table contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  message text,
  email text not null,
  kvkk_consent boolean not null default false,
  language text default 'tr',
  status text default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz default now()
);

-- ==========================================================
-- RLS (Row Level Security) — form tabloları yalnızca insert açık,
-- okuma yalnızca service role / admin panel için
-- ==========================================================
alter table brief_submissions enable row level security;
alter table contact_submissions enable row level security;

create policy "public can insert brief" on brief_submissions
  for insert with check (kvkk_consent = true);

create policy "public can insert contact" on contact_submissions
  for insert with check (kvkk_consent = true);

-- works, directors, testimonials, insights_posts: public read (yalnızca published=true)
alter table works enable row level security;
alter table directors enable row level security;
alter table testimonials enable row level security;
alter table insights_posts enable row level security;

create policy "public can read published works" on works
  for select using (published = true);

create policy "public can read published directors" on directors
  for select using (is_published = true);

create policy "public can read published testimonials" on testimonials
  for select using (is_published = true);

create policy "public can read published insights" on insights_posts
  for select using (is_published = true);
