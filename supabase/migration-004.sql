-- ============================================================================
-- GharBhada — Migration 004
-- Per-category visibility controls: show in navbar, show as a home section.
-- Position is controlled by the existing `sort_order` column.
-- Run once in the Supabase SQL Editor. Safe to re-run.
-- ============================================================================

alter table public.categories
  add column if not exists show_in_nav  boolean not null default false,
  add column if not exists show_on_home boolean not null default false;

-- Preserve current behavior: show key types in the navbar...
update public.categories set show_in_nav = true
  where slug in ('house-rent', 'apartment', 'flat', 'office-space', 'shutter-shop', 'room');

-- ...and give Office Space + Flat a home-page section by default.
update public.categories set show_on_home = true
  where slug in ('office-space', 'flat');
