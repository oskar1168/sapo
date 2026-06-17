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
alter table public.partner_clicks enable row level security;
alter table public.partner_products_cache enable row level security;

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
