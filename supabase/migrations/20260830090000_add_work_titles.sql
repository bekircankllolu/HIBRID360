-- INNOCEAN-style Work grid needs a project title distinct from the client.
-- Both localized titles stay nullable until the approved inventory arrives.

alter table public.works
  add column if not exists title_tr text,
  add column if not exists title_en text;

comment on column public.works.title_tr is
  'Turkish project title shown in the Work grid and case page. Nullable until inventory approval.';
comment on column public.works.title_en is
  'English project title shown in the Work grid and case page. Nullable until inventory approval.';

-- Recreate the security-boundary view so the new presentation fields are
-- available without exposing permission or publication controls.
drop view if exists public.works_public;

create view public.works_public
with (security_barrier = true)
as
  select
    id,
    slug,
    title_tr,
    title_en,
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

revoke all on public.works_public from anon, authenticated;
grant select on public.works_public to anon, authenticated;
grant all privileges on public.works_public to service_role;
