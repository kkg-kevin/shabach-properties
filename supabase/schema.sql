-- Shabach Properties database setup.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It is safe to run again, and running it again brings an older database up to date.

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text not null,
  price text not null,
  size text not null,
  description text not null default '',
  status text not null default 'Available',
  images text[] not null default '{}',
  features text[] not null default '{}',
  payment_plan text not null default '',
  title_status text not null default '',
  map_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null default '',
  message text not null default '',
  preferred_location text not null default '',
  property_id text not null default '',
  property_title text not null default '',
  visit_date date,
  notes text not null default '',
  status text not null default 'New' check (status in ('New', 'Contacted', 'Closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rate_limits (
  id bigint generated always as identity primary key,
  key text not null,
  created_at timestamptz not null default now()
);

-- Columns added after the first release, for databases created before them
alter table public.properties add column if not exists payment_plan text not null default '';
alter table public.properties add column if not exists title_status text not null default '';
alter table public.properties add column if not exists map_url text not null default '';
alter table public.leads add column if not exists visit_date date;
alter table public.leads add column if not exists notes text not null default '';

-- Reserved: under offer. Hidden: kept in the admin but not shown on the site.
alter table public.properties drop constraint if exists properties_status_check;
alter table public.properties add constraint properties_status_check
  check (status in ('Available', 'Reserved', 'Sold', 'Hidden'));

create index if not exists properties_created_at_idx on public.properties (created_at desc);
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists rate_limits_key_created_at_idx on public.rate_limits (key, created_at);

-- Row level security with no policies: the tables cannot be read or changed
-- with the public (anon) key. Only the website's server, which uses the
-- service role key, can access them.
alter table public.properties enable row level security;
alter table public.leads enable row level security;
alter table public.rate_limits enable row level security;

-- Public bucket for property photos: anyone can view a photo by its link,
-- but only the website's server can upload or delete.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('property-images', 'property-images', true, 3145728, array['image/jpeg'])
on conflict (id) do nothing;
