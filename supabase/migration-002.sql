-- ============================================================================
-- GharBhada — Migration 002
-- Run this ONCE in the Supabase SQL Editor against your existing project.
-- Adds: FAQs, Feedback, "any user can list", and BK categories.
-- Safe to re-run (idempotent).
-- ============================================================================

-- 1) Any verified, non-banned user may create a listing (no separate owner role)
drop policy if exists "listings_owner_insert" on public.listings;
create policy "listings_owner_insert" on public.listings
  for insert with check (
    auth.uid() = owner_id
    and public.is_not_banned()
    and status = 'pending'
    and is_featured = false
  );

-- 2) FAQs (admin-managed, shown on the landing page)
create table if not exists public.faqs (
  id         uuid primary key default gen_random_uuid(),
  question   text not null,
  answer     text not null,
  is_active  boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.faqs enable row level security;

drop policy if exists "faqs_public_read" on public.faqs;
create policy "faqs_public_read" on public.faqs
  for select using (is_active or public.is_admin());

drop policy if exists "faqs_admin_all" on public.faqs;
create policy "faqs_admin_all" on public.faqs
  for all using (public.is_admin()) with check (public.is_admin());

-- 3) Feedback (public submissions; only admins can read)
create table if not exists public.feedback (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text,
  rating     integer check (rating is null or (rating between 1 and 5)),
  message    text not null,
  created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;

drop policy if exists "feedback_insert_anyone" on public.feedback;
create policy "feedback_insert_anyone" on public.feedback
  for insert with check (true);

drop policy if exists "feedback_admin_read" on public.feedback;
create policy "feedback_admin_read" on public.feedback
  for all using (public.is_admin()) with check (public.is_admin());

-- 4) Seed a few default FAQs (only if none exist yet)
insert into public.faqs (question, answer, sort_order)
select * from (values
  ('Is it free to list my property?', 'Yes — listing on GharBhada is completely free. There are no listing or subscription fees.', 0),
  ('Will renters see my phone number?', 'No. We are a mediator — your contact details and exact address are never shown publicly. Our team connects you with interested renters.', 1),
  ('How do I rent a property I like?', 'Open the listing and tap “Send inquiry” or “Request a visit”. Our team receives it and connects you with the owner.', 2),
  ('Why can I only see an approximate location?', 'For privacy and safety, the map shows an approximate area, not the exact pin. The exact address is shared once we connect you.', 3),
  ('Can the same account rent and list?', 'Yes. One account lets you both browse homes and list your own property.', 4)
) as v(question, answer, sort_order)
where not exists (select 1 from public.faqs);

-- 5) Add Nepali BK categories (Bedroom-Kitchen), if missing
insert into public.categories (name, slug, sort_order, is_active) values
  ('1 BK', '1-bk', 2, true),
  ('2 BK', '2-bk', 3, true)
on conflict (slug) do nothing;
