-- GOİZM turnuva ön kayıtları (/goizm sayfası).
-- Anonim kullanıcılar sadece INSERT yapabilir; telefon/e-posta asla dışarı okunmaz.
-- Herkese açık liste goizm_registration_list() RPC'si ile, yalnızca güvenli kolonlarla döner.

create table if not exists public.goizm_registrations (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  tournament  text not null default 'izmir-19',
  first_name  text not null check (char_length(btrim(first_name)) between 1 and 60),
  last_name   text not null check (char_length(btrim(last_name)) between 1 and 60),
  rank        text not null check (rank ~ '^([1-9]|[12][0-9]|30)k$|^[1-9]d$'),
  gor         integer check (gor between -1000 and 3200),
  egd_pin     text check (egd_pin is null or egd_pin ~ '^[0-9]{6,9}$'),
  city        text check (city is null or char_length(city) <= 60),
  country     text not null default 'TR' check (country ~ '^[A-Z]{2}$'),
  club        text check (club is null or char_length(club) <= 60),
  phone       text not null check (phone ~ '^\+?[0-9 ()-]{10,20}$'),
  email       text check (email is null or char_length(email) <= 120),
  membership  text not null default 'yok' check (membership in ('yok', 'goizm', 'tgod', 'diger')),
  notes       text check (notes is null or char_length(notes) <= 500),
  hidden      boolean not null default false
);

create unique index if not exists goizm_registrations_pin_uniq
  on public.goizm_registrations (tournament, egd_pin) where egd_pin is not null;
create unique index if not exists goizm_registrations_phone_uniq
  on public.goizm_registrations (tournament, phone);

alter table public.goizm_registrations enable row level security;

drop policy if exists "goizm_registrations_public_insert" on public.goizm_registrations;
create policy "goizm_registrations_public_insert" on public.goizm_registrations
  for insert to anon, authenticated
  with check (hidden = false);

revoke all on public.goizm_registrations from anon, authenticated;
grant insert (tournament, first_name, last_name, rank, gor, egd_pin, city, country, club,
              phone, email, membership, notes)
  on public.goizm_registrations to anon, authenticated;

create or replace function public.goizm_registration_list(p_tournament text default 'izmir-19')
returns table (
  no bigint, first_name text, last_name text, rank text, gor integer,
  city text, country text, club text, egd_pin text, created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select row_number() over (order by r.id), r.first_name, r.last_name, r.rank, r.gor,
         r.city, r.country, r.club, r.egd_pin, r.created_at
  from public.goizm_registrations r
  where r.tournament = p_tournament and not r.hidden
  order by r.id;
$$;

revoke all on function public.goizm_registration_list(text) from public;
grant execute on function public.goizm_registration_list(text) to anon, authenticated;
