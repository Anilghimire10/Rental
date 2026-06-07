-- ============================================================================
-- GharBhada — Storage bucket + policies for property images.
-- Run AFTER schema.sql + rls.sql.
-- Layout: property-images/<owner_id>/<listing_id>/<filename>
-- Public read (approved listings are public); writes restricted to own folder.
-- Server also validates mime/size/filename before upload (storageService).
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-images', 'property-images', true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "property_images_public_read" on storage.objects;
create policy "property_images_public_read" on storage.objects
  for select using (bucket_id = 'property-images');

drop policy if exists "property_images_owner_insert" on storage.objects;
create policy "property_images_owner_insert" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.is_not_banned()
  );

drop policy if exists "property_images_owner_update" on storage.objects;
create policy "property_images_owner_update" on storage.objects
  for update to authenticated using (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "property_images_owner_delete" on storage.objects;
create policy "property_images_owner_delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'property-images'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );
