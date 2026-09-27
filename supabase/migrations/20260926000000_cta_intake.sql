-- Huo CTA intake: talent call (creatives) + hire interest (businesses)
-- Staging tables for the Phase 1 import. Public site can INSERT only; nobody
-- can read/update/delete with the anon key. JP/Rob view rows in Supabase Studio.

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create or replace function public.cta_normalize()
returns trigger
language plpgsql
as $$
begin
  new.email := lower(btrim(new.email));
  new.full_name := btrim(new.full_name);

  if tg_table_name = 'talent_call_submissions' then
    new.instagram_handle := lower(regexp_replace(btrim(new.instagram_handle), '^@+', ''));
    if new.refer_creative_handle is not null then
      new.refer_creative_handle := lower(regexp_replace(btrim(new.refer_creative_handle), '^@+', ''));
    end if;
  end if;

  -- server-controlled fields: ignore anything the client sent
  new.status := 'new';
  new.created_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Creatives: /#talent-call
-- ---------------------------------------------------------------------------

create table public.talent_call_submissions (
  id                     uuid primary key default gen_random_uuid(),
  created_at             timestamptz not null default now(),
  form_version           text not null default 'v1' check (char_length(form_version) <= 20),
  status                 text not null default 'new'
                           check (status in ('new', 'contacted', 'imported', 'rejected')),
  imported_at            timestamptz,

  -- everyone
  full_name              text not null check (char_length(full_name) between 1 and 200),
  email                  text not null check (char_length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone                  text check (char_length(phone) <= 30),
  city                   text not null check (city in ('columbus', 'other_ohio', 'other')),
  city_other             text check (char_length(city_other) <= 100),
  is_18_plus             boolean not null check (is_18_plus),
  consent_contact        boolean not null check (consent_contact),

  -- creative
  creative_types         text[] not null
                           check (cardinality(creative_types) between 1 and 7
                                  and creative_types <@ array['model','photographer','videographer',
                                                              'designer','stylist','hair_makeup','other']),
  creative_type_other    text check (char_length(creative_type_other) <= 100),
  specialty              text check (char_length(specialty) <= 200),
  instagram_handle       text not null check (instagram_handle ~ '^@?[A-Za-z0-9._]{1,30}$'),
  portfolio_url          text check (char_length(portfolio_url) <= 500),
  linkedin_url           text check (char_length(linkedin_url) <= 500),

  -- model only (required when 'model' is selected, see check below)
  height_inches          smallint check (height_inches between 48 and 90),
  bust                   text check (char_length(bust) <= 20),
  waist                  text check (char_length(waist) <= 20),
  hips                   text check (char_length(hips) <= 20),
  shoe                   text check (char_length(shoe) <= 20),
  eyes                   text check (char_length(eyes) <= 30),
  hair                   text check (char_length(hair) <= 30),
  headshot_url           text check (char_length(headshot_url) <= 500),

  -- optional, end of form
  referred_by            text check (char_length(referred_by) <= 200),
  refer_creative_handle  text check (char_length(refer_creative_handle) <= 60),
  businesses_want        text check (char_length(businesses_want) <= 1000),
  businesses_worked      text check (char_length(businesses_worked) <= 1000),
  anything_else          text check (char_length(anything_else) <= 2000),
  source                 text check (char_length(source) <= 100),   -- e.g. utm_source / 'instagram'

  constraint model_fields_required check (
    not ('model' = any(creative_types))
    or (height_inches is not null)
  )
);

create unique index talent_call_submissions_email_key
  on public.talent_call_submissions (email);

create trigger talent_call_submissions_normalize
  before insert on public.talent_call_submissions
  for each row execute function public.cta_normalize();

-- ---------------------------------------------------------------------------
-- Businesses: "Hiring creatives?" link
-- ---------------------------------------------------------------------------

create table public.business_interest_submissions (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  form_version       text not null default 'v1' check (char_length(form_version) <= 20),
  status             text not null default 'new'
                       check (status in ('new', 'contacted', 'imported', 'rejected')),
  imported_at        timestamptz,

  business_name      text not null check (char_length(business_name) between 1 and 200),
  full_name          text not null check (char_length(full_name) between 1 and 200),  -- contact person
  email              text not null check (char_length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone              text check (char_length(phone) <= 30),
  business_type      text not null
                       check (business_type in ('boutique_retail','restaurant_bar','salon_beauty',
                                                'agency_brand','events','other')),
  website_or_ig      text check (char_length(website_or_ig) <= 500),
  hires              text[] check (hires <@ array['model','photographer','videographer',
                                                   'designer','stylist','hair_makeup','other']),
  city               text not null check (city in ('columbus', 'other_ohio', 'other')),
  consent_contact    boolean not null check (consent_contact),
  anything_else      text check (char_length(anything_else) <= 2000),
  source             text check (char_length(source) <= 100)
);

create unique index business_interest_submissions_email_key
  on public.business_interest_submissions (email);

create trigger business_interest_submissions_normalize
  before insert on public.business_interest_submissions
  for each row execute function public.cta_normalize();

-- ---------------------------------------------------------------------------
-- Access: anon can INSERT only (no select/update/delete)
-- ---------------------------------------------------------------------------

alter table public.talent_call_submissions enable row level security;
alter table public.business_interest_submissions enable row level security;

revoke all on public.talent_call_submissions from anon, authenticated;
revoke all on public.business_interest_submissions from anon, authenticated;

grant insert on public.talent_call_submissions to anon;
grant insert on public.business_interest_submissions to anon;

create policy "public can submit talent call"
  on public.talent_call_submissions
  for insert to anon
  with check (true);

create policy "public can submit business interest"
  on public.business_interest_submissions
  for insert to anon
  with check (true);
