-- ============================================================================
-- GharBhada — Migration 005 (consolidated)
-- Run this ONCE in the Supabase SQL Editor. Safe to re-run.
--
-- Fixes "table public.faqs / public.feedback not found" (creates them if missing)
-- and adds admin-editable site content (Terms & Conditions, Privacy Policy).
-- ============================================================================

-- 1) FAQs (in case migration-002 wasn't run) -------------------------------
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
create policy "faqs_public_read" on public.faqs for select using (is_active or public.is_admin());
drop policy if exists "faqs_admin_all" on public.faqs;
create policy "faqs_admin_all" on public.faqs for all using (public.is_admin()) with check (public.is_admin());

-- 2) Feedback --------------------------------------------------------------
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
create policy "feedback_insert_anyone" on public.feedback for insert with check (true);
drop policy if exists "feedback_admin_read" on public.feedback;
create policy "feedback_admin_read" on public.feedback for all using (public.is_admin()) with check (public.is_admin());

-- 3) Editable site content (Terms, Privacy, etc.) --------------------------
create table if not exists public.site_content (
  key        text primary key,          -- 'terms' | 'privacy'
  title      text not null,
  body       text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;
drop policy if exists "site_content_public_read" on public.site_content;
create policy "site_content_public_read" on public.site_content for select using (true);
drop policy if exists "site_content_admin_all" on public.site_content;
create policy "site_content_admin_all" on public.site_content for all using (public.is_admin()) with check (public.is_admin());

-- Seed default Terms & Privacy (only if not already present)
insert into public.site_content (key, title, body) values
(
  'terms',
  'Terms & Conditions',
  E'1. Who we are\nGharBhada is a property-rental marketplace and mediator operating in Pokhara, Nepal. We connect renters and property owners and are not a party to any rental agreement between them.\n\n2. How mediation works\nRenters never see an owner''s contact details or a property''s exact location. Inquiries and visit requests are sent to our team, who arrange introductions.\n\n3. Accounts\nYou may create one free account to browse homes and to list your own property. You are responsible for the accuracy of your information and for keeping your login secure. Email verification is required before posting a property.\n\n4. Listings & approval\nEvery listing is reviewed by an administrator before it appears publicly. We may reject or remove listings that are inaccurate, misleading, duplicated, or that violate these terms.\n\n5. Fees\nThis version of GharBhada is free for everyone. There are no listing fees, subscription fees, or online payments.\n\n6. Acceptable use\nDo not post false, unlawful or harmful content, attempt to access data you are not authorized to see, or use the service to spam or harass. We may suspend accounts that abuse the platform.\n\n7. Disclaimer\nGharBhada provides the platform "as is" and is not responsible for the conduct of any user or the condition or outcome of any rental.'
),
(
  'privacy',
  'Privacy Policy',
  E'1. What we collect\nWe collect only the information needed to operate the service: your name, email, phone, and the details you submit in listings, inquiries, visit requests and feedback.\n\n2. How we use it\nWe use your information to operate the marketplace and to mediate introductions between renters and owners. Owner contact details and exact addresses are stored privately and shown only to our administrators.\n\n3. What we do not do\nWe do not sell your personal data. We do not show owner contact details or exact coordinates to the public.\n\n4. Cookies & sessions\nWe use secure, http-only cookies to keep you signed in. We do not use them to track you across other sites.\n\n5. Data retention\nWe keep your data for as long as your account is active or as needed to provide the service. You may request deletion of your account by contacting us.\n\n6. Contact\nFor any privacy question, reach us via the contact details in the site footer.'
)
on conflict (key) do nothing;
