-- ============================================================================
-- GharBhada (RentEase Pokhara) — Database schema
-- Run order: schema.sql → rls.sql → storage.sql → (npm run seed)
-- Mediated rental marketplace: owner contact + exact coordinates are PRIVATE.
-- ============================================================================

create extension if not exists "pgcrypto";

-- Enums ---------------------------------------------------------------------
do $$ begin create type user_role     as enum ('tenant', 'owner', 'admin'); exception when duplicate_object then null; end $$;
do $$ begin create type user_plan     as enum ('free', 'premium', 'featured'); exception when duplicate_object then null; end $$; -- future monetization
do $$ begin create type listing_status as enum ('pending', 'approved', 'rejected'); exception when duplicate_object then null; end $$;
do $$ begin create type inquiry_status as enum ('new', 'contacted', 'resolved'); exception when duplicate_object then null; end $$;
do $$ begin create type visit_status   as enum ('pending', 'confirmed', 'completed', 'cancelled'); exception when duplicate_object then null; end $$;

-- ============================================================================
-- profiles (1:1 with auth.users). Passwords live in auth.users (Supabase Auth).
-- ============================================================================
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text not null default '',
  email        text not null,
  phone        text,
  whatsapp     text,
  role         user_role not null default 'tenant',
  plan         user_plan not null default 'free',   -- future: paid plans
  is_verified  boolean not null default false,
  is_banned    boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ============================================================================
-- categories (admin-manageable). Seeded from DEFAULT_CATEGORIES.
-- ============================================================================
create table if not exists public.categories (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  slug         text not null unique,
  is_active    boolean not null default true,
  show_in_nav  boolean not null default false,
  show_on_home boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

-- ============================================================================
-- listings
-- PRIVATE fields (admin/owner-only, never serialized publicly):
--   latitude, longitude, owner_name, owner_phone, owner_whatsapp, owner_email,
--   exact_address. Public consumers see area/ward + an approximate map circle.
-- ============================================================================
create table if not exists public.listings (
  id                uuid primary key default gen_random_uuid(),
  property_code     text unique,                          -- e.g. PKR-123 (auto)
  owner_id          uuid not null references public.profiles(id) on delete cascade,
  title             text not null,
  category_id       uuid references public.categories(id) on delete set null,
  description       text not null default '',

  -- Pricing
  monthly_rent      integer not null check (monthly_rent >= 0),
  security_deposit  integer not null default 0 check (security_deposit >= 0),
  advance_required  boolean not null default false,
  is_negotiable        boolean not null default false,
  electricity_included boolean not null default false,
  water_included       boolean not null default false,
  available_from    date,

  -- Location (city architected for multi-city; v1 = Pokhara)
  area              text not null,
  ward_number       integer,
  city              text not null default 'Pokhara',
  nearby_landmark   text,
  latitude          double precision not null,            -- PRIVATE
  longitude         double precision not null,            -- PRIVATE

  -- Owner contact (PRIVATE — admin only; agency mediates)
  owner_name        text,                                 -- PRIVATE
  owner_phone       text,                                 -- PRIVATE
  owner_whatsapp    text,                                 -- PRIVATE
  owner_email       text,                                 -- PRIVATE
  exact_address     text,                                 -- PRIVATE

  -- Media
  cover_image       text,
  gallery_images    text[] not null default '{}',

  -- Details
  total_rooms       integer not null default 0 check (total_rooms >= 0),
  bedrooms          integer not null default 0 check (bedrooms >= 0),
  kitchens          integer not null default 0 check (kitchens >= 0),
  bathrooms         integer not null default 0 check (bathrooms >= 0),
  floor_number      integer,
  area_sqft         integer check (area_sqft is null or area_sqft >= 0),
  amenities         text[] not null default '{}',

  -- Moderation / status
  status            listing_status not null default 'pending',
  rejection_reason  text,
  is_featured       boolean not null default false,
  is_rented         boolean not null default false,
  view_count        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists listings_status_idx   on public.listings (status);
create index if not exists listings_owner_idx     on public.listings (owner_id);
create index if not exists listings_category_idx  on public.listings (category_id);
create index if not exists listings_featured_idx  on public.listings (is_featured) where is_featured;
create index if not exists listings_rent_idx      on public.listings (monthly_rent);
create index if not exists listings_area_idx      on public.listings (area);
create index if not exists listings_browse_idx    on public.listings (status, is_rented, created_at desc);

-- propertyCode sequence + auto-generation (PKR-1, PKR-2, ...). City-prefixed so
-- adding cities later just extends the CASE without a data migration.
create sequence if not exists public.listing_code_seq start 100;

create or replace function public.assign_property_code()
returns trigger language plpgsql as $$
declare prefix text;
begin
  if new.property_code is null then
    prefix := case lower(coalesce(new.city, 'pokhara'))
      when 'pokhara' then 'PKR'
      when 'kathmandu' then 'KTM'
      when 'chitwan' then 'CWN'
      when 'butwal' then 'BTL'
      when 'dharan' then 'DRN'
      else upper(substr(regexp_replace(coalesce(new.city,'CITY'), '[^a-zA-Z]', '', 'g'), 1, 3))
    end;
    new.property_code := prefix || '-' || nextval('public.listing_code_seq');
  end if;
  return new;
end; $$;

drop trigger if exists trg_listings_code on public.listings;
create trigger trg_listings_code before insert on public.listings
  for each row execute function public.assign_property_code();

-- ============================================================================
-- inquiries  (route to ADMIN; status new → contacted → resolved)
-- ============================================================================
create table if not exists public.inquiries (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings(id) on delete cascade,
  tenant_id   uuid references public.profiles(id) on delete set null,
  name        text not null,
  phone       text not null,
  email       text not null,
  message     text not null default '',
  status      inquiry_status not null default 'new',
  admin_notes text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists inquiries_listing_idx on public.inquiries (listing_id);
create index if not exists inquiries_tenant_idx  on public.inquiries (tenant_id);
create index if not exists inquiries_status_idx  on public.inquiries (status);

-- ============================================================================
-- visit_requests  (status pending → confirmed → completed → cancelled)
-- ============================================================================
create table if not exists public.visit_requests (
  id             uuid primary key default gen_random_uuid(),
  listing_id     uuid not null references public.listings(id) on delete cascade,
  tenant_id      uuid references public.profiles(id) on delete set null,
  name           text not null,
  phone          text not null,
  preferred_date date,
  preferred_time text,
  notes          text not null default '',
  status         visit_status not null default 'pending',
  admin_notes    text not null default '',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists visits_listing_idx on public.visit_requests (listing_id);
create index if not exists visits_tenant_idx  on public.visit_requests (tenant_id);
create index if not exists visits_status_idx  on public.visit_requests (status);

-- ============================================================================
-- favorites
-- ============================================================================
create table if not exists public.favorites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);
create index if not exists favorites_user_idx on public.favorites (user_id);

-- ============================================================================
-- advertisements (banner ads — future monetization hook, admin-managed)
-- ============================================================================
create table if not exists public.advertisements (
  id         uuid primary key default gen_random_uuid(),
  title      text not null unique,
  image      text not null,
  link_url   text,
  position   text not null default 'home_hero',  -- e.g. home_hero, sidebar, search_top
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists ads_position_idx on public.advertisements (position) where is_active;

-- ============================================================================
-- faqs (admin-managed, shown on the landing page)
-- ============================================================================
create table if not exists public.faqs (
  id         uuid primary key default gen_random_uuid(),
  question   text not null,
  answer     text not null,
  is_active  boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- feedback (public submissions; admin-only read)
-- ============================================================================
create table if not exists public.feedback (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text,
  rating     integer check (rating is null or (rating between 1 and 5)),
  message    text not null,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Helper functions (SECURITY DEFINER to read role without recursive RLS).
-- ============================================================================
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.current_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_not_banned()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select not is_banned from public.profiles where id = auth.uid()), false);
$$;

-- Safe, anonymous-friendly view counter (only bumps approved listings).
create or replace function public.increment_listing_view(p_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.listings set view_count = view_count + 1
  where id = p_id and status = 'approved';
$$;

-- ============================================================================
-- Triggers: updated_at, new-user profile, email-confirmation mirror
-- ============================================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_listings_touch on public.listings;
create trigger trg_listings_touch before update on public.listings
  for each row execute function public.touch_updated_at();
drop trigger if exists trg_inquiries_touch on public.inquiries;
create trigger trg_inquiries_touch before update on public.inquiries
  for each row execute function public.touch_updated_at();
drop trigger if exists trg_visits_touch on public.visit_requests;
create trigger trg_visits_touch before update on public.visit_requests
  for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare requested_role text := coalesce(new.raw_user_meta_data->>'role', 'tenant');
        safe_role user_role;
begin
  -- Never honor self-assigned admin at signup. Only tenant/owner.
  if requested_role = 'owner' then safe_role := 'owner'; else safe_role := 'tenant'; end if;
  insert into public.profiles (id, email, name, phone, whatsapp, role, is_verified)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'whatsapp',
    safe_role,
    new.email_confirmed_at is not null
  ) on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.handle_user_confirmed()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email_confirmed_at is not null then
    update public.profiles set is_verified = true where id = new.id;
  end if;
  return new;
end; $$;

drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed after update of email_confirmed_at on auth.users
  for each row execute function public.handle_user_confirmed();
