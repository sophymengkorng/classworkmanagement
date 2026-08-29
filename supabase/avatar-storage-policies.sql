insert into storage.buckets (
  id,
  name,
  public
)
values (
  'student-avatars',
  'student-avatars',
  true
)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Users can upload their own avatars"
on storage.objects;

create policy "Users can upload their own avatars"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'student-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update their own avatars"
on storage.objects;

create policy "Users can update their own avatars"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'student-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'student-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete their own avatars"
on storage.objects;

create policy "Users can delete their own avatars"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'student-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
