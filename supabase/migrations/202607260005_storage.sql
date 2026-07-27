begin;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values
  ('ask-media', 'ask-media', false, 10485760, array['image/jpeg','image/png','image/webp']),
  ('resource-media', 'resource-media', false, 10485760, array['image/jpeg','image/png','image/webp']),
  ('incident-evidence', 'incident-evidence', false, 15728640, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Object paths: <circle_id>/<owner_profile_id>/<uuid>.<ext>
create policy ask_media_member_read on storage.objects for select to authenticated using (
  bucket_id = 'ask-media'
  and public.is_active_circle_member((storage.foldername(name))[1]::uuid)
);
create policy ask_media_owner_write on storage.objects for insert to authenticated with check (
  bucket_id = 'ask-media'
  and (storage.foldername(name))[2]::uuid = auth.uid()
  and public.is_active_circle_member((storage.foldername(name))[1]::uuid)
);
create policy ask_media_owner_update on storage.objects for update to authenticated using (
  bucket_id = 'ask-media' and owner_id = auth.uid()::text
) with check (bucket_id = 'ask-media' and owner_id = auth.uid()::text);
create policy ask_media_owner_delete on storage.objects for delete to authenticated using (bucket_id = 'ask-media' and owner_id = auth.uid()::text);

create policy resource_media_member_read on storage.objects for select to authenticated using (
  bucket_id = 'resource-media'
  and public.is_active_circle_member((storage.foldername(name))[1]::uuid)
);
create policy resource_media_owner_write on storage.objects for insert to authenticated with check (
  bucket_id = 'resource-media'
  and (storage.foldername(name))[2]::uuid = auth.uid()
  and public.is_active_circle_member((storage.foldername(name))[1]::uuid)
);
create policy resource_media_owner_change on storage.objects for update to authenticated using (bucket_id='resource-media' and owner_id=auth.uid()::text) with check (bucket_id='resource-media' and owner_id=auth.uid()::text);
create policy resource_media_owner_delete on storage.objects for delete to authenticated using (bucket_id='resource-media' and owner_id=auth.uid()::text);

-- Evidence is uploaded by involved users; download is server-mediated after a scoped access check.
create policy evidence_uploader_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'incident-evidence' and (storage.foldername(name))[2]::uuid = auth.uid()
);
create policy evidence_uploader_read on storage.objects for select to authenticated using (
  bucket_id = 'incident-evidence' and owner_id = auth.uid()::text
);

commit;
