-- ============================================================================
-- GharBhada — Migration 003
-- Adds rent flags to listings: negotiable, electricity-included, water-included.
-- Run once in the Supabase SQL Editor. Safe to re-run.
-- ============================================================================

alter table public.listings
  add column if not exists is_negotiable        boolean not null default false,
  add column if not exists electricity_included boolean not null default false,
  add column if not exists water_included       boolean not null default false;
