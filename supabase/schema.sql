-- SAPO initial Supabase schema.
-- Enable anonymous sign-ins in Supabase Auth before relying on auth.uid() policies.

create table if not exists public.trips (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  city_code text not null,
  title text not null,
  start_date text not null,
  end_date text not null,
  member_count integer not null default 1,
  detail jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.liked_spots (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  spots jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.cities (
  code text primary key,
  name text not null,
  country_code text not null default 'JP',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.spot_categories (
  code text primary key,
  label text not null,
  icon text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.spots (
  id text primary key,
  city_code text not null references public.cities(code) on delete restrict,
  category text not null references public.spot_categories(code) on delete restrict,
  name text not null,
  name_ko text,
  name_ja text,
  name_en text,
  name_ko_auto text,
  name_ko_status text not null default 'reviewed',
  search_keywords text[] not null default '{}'::text[],
  wikidata_id text,
  source_name text,
  source_url text,
  source_license text,
  rating text not null default '',
  menu text not null default '',
  tips text not null default '',
  address text not null default '',
  open_time text not null default '',
  close_time text not null default '',
  latitude double precision,
  longitude double precision,
  google_place_id text,
  google_maps_url text,
  thumbnail_url text,
  image_url text,
  image_blurhash text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.spots add column if not exists latitude double precision;
alter table public.spots add column if not exists longitude double precision;
alter table public.spots add column if not exists google_place_id text;
alter table public.spots add column if not exists google_maps_url text;
alter table public.spots add column if not exists name_ko text;
alter table public.spots add column if not exists name_ja text;
alter table public.spots add column if not exists name_en text;
alter table public.spots add column if not exists name_ko_auto text;
alter table public.spots add column if not exists name_ko_status text not null default 'reviewed';
alter table public.spots add column if not exists search_keywords text[] not null default '{}'::text[];
alter table public.spots add column if not exists wikidata_id text;
alter table public.spots add column if not exists source_name text;
alter table public.spots add column if not exists source_url text;
alter table public.spots add column if not exists source_license text;
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'spots_name_ko_status_check'
      and conrelid = 'public.spots'::regclass
  ) then
    alter table public.spots add constraint spots_name_ko_status_check
      check (name_ko_status in ('auto', 'reviewed', 'rejected'));
  end if;
end $$;

insert into public.cities (code, name, country_code, sort_order)
values
  ('sapporo', 'Sapporo', 'JP', 10),
  ('otaru', 'Otaru', 'JP', 20),
  ('tokyo', 'Tokyo', 'JP', 30),
  ('osaka', 'Osaka', 'JP', 40)
on conflict (code) do update set
  name = excluded.name,
  country_code = excluded.country_code,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.spot_categories (code, label, icon, sort_order)
values
  ('spot', 'Sightseeing', 'pin', 10),
  ('noodle', 'Noodles', 'restaurant', 20),
  ('meat', 'Meat', 'flame', 30),
  ('seafood', 'Seafood', 'fish', 40),
  ('dessert', 'Dessert', 'cafe', 50),
  ('cafe', 'Cafe', 'cafe', 60),
  ('shopping', 'Shopping', 'bag', 70),
  ('etc', 'Other', 'ellipsis', 80)
on conflict (code) do update set
  label = excluded.label,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  updated_at = now();

create table if not exists public.partner_clicks (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null default auth.uid(),
  provider text not null,
  city text,
  category text,
  product_id text,
  product_name text,
  target_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.partner_products_cache (
  cache_key text primary key,
  provider text not null,
  payload jsonb not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.trips enable row level security;
alter table public.liked_spots enable row level security;
alter table public.cities enable row level security;
alter table public.spot_categories enable row level security;
alter table public.spots enable row level security;
alter table public.partner_clicks enable row level security;
alter table public.partner_products_cache enable row level security;

drop policy if exists "Users can manage own trips" on public.trips;
drop policy if exists "Users can manage own liked spots" on public.liked_spots;
drop policy if exists "Anyone can read active cities" on public.cities;
drop policy if exists "Anyone can read active spot categories" on public.spot_categories;
drop policy if exists "Anyone can read active spots" on public.spots;
drop policy if exists "Users can create own partner clicks" on public.partner_clicks;
drop policy if exists "Users can read own partner clicks" on public.partner_clicks;

create policy "Users can manage own trips"
  on public.trips
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own liked spots"
  on public.liked_spots
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Anyone can read active cities"
  on public.cities
  for select
  using (is_active);

create policy "Anyone can read active spot categories"
  on public.spot_categories
  for select
  using (is_active);

create policy "Anyone can read active spots"
  on public.spots
  for select
  using (is_active);

create policy "Users can create own partner clicks"
  on public.partner_clicks
  for insert
  with check (auth.uid() = user_id);

create policy "Users can read own partner clicks"
  on public.partner_clicks
  for select
  using (auth.uid() = user_id);

-- Product cache should normally be read through Edge Functions using the service role.
-- Keep direct client access closed for now.
