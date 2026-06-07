-- ============================================================================
-- GharBhada — Row Level Security. Run AFTER schema.sql.
-- Default-deny everywhere; access granted only via these policies. The
-- service-role key (server only) bypasses RLS for admin/mediator operations.
-- Column privacy (owner contact, lat/lng) is enforced additionally by DTOs.
-- ============================================================================

alter table public.profiles       enable row level security;
alter table public.categories     enable row level security;
alter table public.listings       enable row level security;
alter table public.inquiries      enable row level security;
alter table public.visit_requests enable row level security;
alter table public.favorites      enable row level security;
alter table public.advertisements enable row level security;

-- profiles -------------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
    and plan = (select plan from public.profiles where id = auth.uid())
    and is_banned = (select is_banned from public.profiles where id = auth.uid())
  );

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- categories -----------------------------------------------------------------
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select using (is_active or public.is_admin());

drop policy if exists "categories_admin_all" on public.categories;
create policy "categories_admin_all" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- listings -------------------------------------------------------------------
drop policy if exists "listings_public_read" on public.listings;
create policy "listings_public_read" on public.listings
  for select using (status = 'approved');

drop policy if exists "listings_owner_read" on public.listings;
create policy "listings_owner_read" on public.listings
  for select using (auth.uid() = owner_id);

drop policy if exists "listings_admin_read" on public.listings;
create policy "listings_admin_read" on public.listings
  for select using (public.is_admin());

drop policy if exists "listings_owner_insert" on public.listings;
create policy "listings_owner_insert" on public.listings
  for insert with check (
    auth.uid() = owner_id
    and public.is_not_banned()
    and public.current_role() in ('owner', 'admin')
    and status = 'pending'
    and is_featured = false
  );

drop policy if exists "listings_owner_update" on public.listings;
create policy "listings_owner_update" on public.listings
  for update using (auth.uid() = owner_id and public.is_not_banned())
  with check (
    auth.uid() = owner_id
    and is_featured = (select is_featured from public.listings l where l.id = listings.id)
    and status in ('pending', 'rejected')
  );

drop policy if exists "listings_owner_delete" on public.listings;
create policy "listings_owner_delete" on public.listings
  for delete using (auth.uid() = owner_id);

drop policy if exists "listings_admin_all" on public.listings;
create policy "listings_admin_all" on public.listings
  for all using (public.is_admin()) with check (public.is_admin());

-- inquiries ------------------------------------------------------------------
-- Route to ADMIN. Owners get COUNTS only (server/service-role). Tenants read own.
drop policy if exists "inquiries_insert_anyone" on public.inquiries;
create policy "inquiries_insert_anyone" on public.inquiries
  for insert with check (
    exists (select 1 from public.listings l
            where l.id = listing_id and l.status = 'approved' and l.is_rented = false)
    and (tenant_id is null or tenant_id = auth.uid())
    and status = 'new'
  );

drop policy if exists "inquiries_tenant_read_own" on public.inquiries;
create policy "inquiries_tenant_read_own" on public.inquiries
  for select using (auth.uid() = tenant_id);

drop policy if exists "inquiries_admin_all" on public.inquiries;
create policy "inquiries_admin_all" on public.inquiries
  for all using (public.is_admin()) with check (public.is_admin());
-- NOTE: deliberately NO owner SELECT on inquiries (owners never see tenant contact).

-- visit_requests -------------------------------------------------------------
drop policy if exists "visits_insert_anyone" on public.visit_requests;
create policy "visits_insert_anyone" on public.visit_requests
  for insert with check (
    exists (select 1 from public.listings l
            where l.id = listing_id and l.status = 'approved' and l.is_rented = false)
    and (tenant_id is null or tenant_id = auth.uid())
    and status = 'pending'
  );

drop policy if exists "visits_tenant_read_own" on public.visit_requests;
create policy "visits_tenant_read_own" on public.visit_requests
  for select using (auth.uid() = tenant_id);

drop policy if exists "visits_admin_all" on public.visit_requests;
create policy "visits_admin_all" on public.visit_requests
  for all using (public.is_admin()) with check (public.is_admin());

-- favorites ------------------------------------------------------------------
drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own" on public.favorites
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own" on public.favorites
  for insert with check (auth.uid() = user_id);

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own" on public.favorites
  for delete using (auth.uid() = user_id);

-- advertisements -------------------------------------------------------------
drop policy if exists "ads_public_read" on public.advertisements;
create policy "ads_public_read" on public.advertisements
  for select using (is_active or public.is_admin());

drop policy if exists "ads_admin_all" on public.advertisements;
create policy "ads_admin_all" on public.advertisements
  for all using (public.is_admin()) with check (public.is_admin());

-- Allow anon/auth to call the view-count RPC (SECURITY DEFINER, scoped to approved).
grant execute on function public.increment_listing_view(uuid) to anon, authenticated;
