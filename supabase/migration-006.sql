-- ============================================================================
-- GharBhada — Migration 006
-- Run this ONCE in the Supabase SQL Editor. Safe to re-run.
--
-- Adds a "category" (group title) to FAQs so questions can be grouped under
-- headings on the landing / FAQ page (e.g. "Renting", "Listing", "Payments").
-- ============================================================================

alter table public.faqs
  add column if not exists category text not null default 'General';
