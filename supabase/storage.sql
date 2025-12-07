-- Create 'templates' bucket
insert into storage.buckets (id, name, public)
values ('templates', 'templates', true)
on conflict (id) do nothing;

-- Policy: Allow public read (so the API can download it easily, or anyone with the link)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'templates' );

-- Policy: Allow authenticated uploads (Admins need to upload)
create policy "Authenticated Uploads"
  on storage.objects for insert
  with check ( bucket_id = 'templates' and auth.role() = 'authenticated' );

-- Policy: Allow authenticated deletes
create policy "Authenticated Deletes"
  on storage.objects for delete
  using ( bucket_id = 'templates' and auth.role() = 'authenticated' );
