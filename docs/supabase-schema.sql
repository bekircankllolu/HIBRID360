-- Hibrid 360 web sitesi — Supabase başlangıç şeması
-- Müşteri Supabase projesi açıp env değerlerini bağladıktan sonra çalıştırılacak ilk migration.

create extension if not exists pgcrypto;

alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke execute on functions from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke usage, select on sequences from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke execute on functions from public;

create table public.directors (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  full_name text not null,
  role text not null,
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

create table public.works (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  client_name text not null,
  client_name_confidential boolean default false,
  year integer not null check (year >= 1990 and year <= 2100),
  -- Varlık türü. Filtredeki "Format" bu DEĞİL — bkz. content_format.
  format text not null check (format in ('video', 'image', 'case_study')),
  -- Eski serbest metin gruplama. Anlamı müşteriyle netleşmedi; arayüzde
  -- kullanılmıyor, dönüştürülmedi.
  category text,
  -- Filtre facet'leri (29 Ağustos 2026 revizyonu). Üçü de nullable: iş
  -- envanteri gelmeden doldurulamaz ve zorlamak veriyi uydurmaya davet
  -- eder. Boşken arayüz o filtreyi hiç göstermez.
  service text,
  industry text,
  content_format text,
  is_featured boolean default false,
  permission_status text default 'pending' check (permission_status in ('approved', 'pending', 'not_allowed')),
  cover_image_url text,
  video_url text,
  case_problem_tr text,
  case_problem_en text,
  case_solution_tr text,
  case_solution_en text,
  case_result_tr text,
  case_result_en text,
  director_id uuid references public.directors(id) on delete set null,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  person_name text not null,
  person_title text not null,
  brand_name text not null,
  quote_tr text,
  quote_en text,
  video_url_vertical text,
  video_url_horizontal text,
  work_id uuid references public.works(id) on delete set null,
  placement text[] default array['friends'],
  written_consent_confirmed boolean default false,
  is_published boolean default false,
  created_at timestamptz default now()
);

create table public.insights_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_tr text not null,
  title_en text not null,
  summary_tr text,
  summary_en text,
  body_tr text,
  body_en text,
  cover_image_url text,
  category text,
  published_at timestamptz,
  last_reviewed_at timestamptz,
  author_name text,
  author_title text,
  is_published boolean default false,
  created_at timestamptz default now()
);

create table public.brief_submissions (
  id uuid primary key default gen_random_uuid(),
  what_making text,
  who_for text,
  when_live text,
  where_running text[],
  budget_band text,
  reference_link text,
  reference_file_url text,
  contact_email text not null,
  kvkk_consent boolean not null default false,
  language text default 'tr' check (language in ('tr', 'en')),
  status text default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz default now()
);

create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  message text,
  email text not null,
  kvkk_consent boolean not null default false,
  language text default 'tr' check (language in ('tr', 'en')),
  status text default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz default now()
);

create index directors_published_sort_idx
  on public.directors (is_published, sort_order, full_name);

create index works_public_sort_idx
  on public.works (published, permission_status, is_featured, year desc);

create index works_facets_idx
  on public.works (service, industry, content_format);

create index testimonials_public_idx
  on public.testimonials (is_published, written_consent_confirmed);

create index insights_public_sort_idx
  on public.insights_posts (is_published, published_at desc);

create index brief_submissions_created_at_idx
  on public.brief_submissions (created_at desc);

create index contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public;
revoke all on function public.set_updated_at() from anon, authenticated;

create trigger works_set_updated_at
  before update on public.works
  for each row execute function public.set_updated_at();

alter table public.directors enable row level security;
alter table public.works enable row level security;
alter table public.testimonials enable row level security;
alter table public.insights_posts enable row level security;
alter table public.brief_submissions enable row level security;
alter table public.contact_submissions enable row level security;

create policy "public can read published directors"
  on public.directors
  for select to anon, authenticated
  using (is_published = true);

create policy "public can read approved published works"
  on public.works
  for select to anon, authenticated
  using (published = true and permission_status = 'approved');

create policy "public can read consented published testimonials"
  on public.testimonials
  for select to anon, authenticated
  using (is_published = true and written_consent_confirmed = true);

create policy "public can read published insights"
  on public.insights_posts
  for select to anon, authenticated
  using (
    is_published = true
    and published_at is not null
    and published_at <= now()
  );

create policy "public can insert consented brief submissions"
  on public.brief_submissions
  for insert to anon, authenticated
  with check (kvkk_consent = true);

create policy "public can insert consented contact submissions"
  on public.contact_submissions
  for insert to anon, authenticated
  with check (kvkk_consent = true);

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

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select on public.directors to anon, authenticated;
grant select on public.testimonials to anon, authenticated;
grant select on public.insights_posts to anon, authenticated;
grant insert on public.brief_submissions to anon, authenticated;
grant insert on public.contact_submissions to anon, authenticated;
grant select on public.works_public to anon, authenticated;

grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;
