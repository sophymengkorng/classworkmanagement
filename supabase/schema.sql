create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  subject text not null,
  teacher text not null,
  deadline date not null,
  description text not null default 'No description added yet.',
  status text not null default 'Pending'
    check (status in ('Pending', 'In progress', 'Completed')),
  priority text not null default 'Medium'
    check (priority in ('High', 'Medium', 'Low')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  subject text not null,
  type text not null,
  size text not null,
  storage_path text not null,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.notification_reads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  notification_id text not null,
  read_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id, notification_id)
);

create index if not exists tasks_user_created_at_idx
on public.tasks (
  user_id,
  created_at desc
);

create index if not exists documents_user_uploaded_at_idx
on public.documents (
  user_id,
  uploaded_at desc
);

create index if not exists notification_reads_user_created_at_idx
on public.notification_reads (
  user_id,
  created_at desc
);

grant select, insert, update, delete
on table public.tasks
to authenticated;

grant select, insert, update, delete
on table public.documents
to authenticated;

grant select, insert, update, delete
on table public.notification_reads
to authenticated;

alter table public.tasks enable row level security;

alter table public.documents enable row level security;

alter table public.notification_reads enable row level security;

drop policy if exists "Users can read their own tasks"
on public.tasks;

create policy "Users can read their own tasks"
on public.tasks
for select
to authenticated
using (
  auth.uid() = user_id
);

drop policy if exists "Users can create their own tasks"
on public.tasks;

create policy "Users can create their own tasks"
on public.tasks
for insert
to authenticated
with check (
  auth.uid() = user_id
);

drop policy if exists "Users can update their own tasks"
on public.tasks;

create policy "Users can update their own tasks"
on public.tasks
for update
to authenticated
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

drop policy if exists "Users can delete their own tasks"
on public.tasks;

create policy "Users can delete their own tasks"
on public.tasks
for delete
to authenticated
using (
  auth.uid() = user_id
);

drop policy if exists "Users can read their own documents"
on public.documents;

create policy "Users can read their own documents"
on public.documents
for select
to authenticated
using (
  auth.uid() = user_id
);

drop policy if exists "Users can create their own documents"
on public.documents;

create policy "Users can create their own documents"
on public.documents
for insert
to authenticated
with check (
  auth.uid() = user_id
);

drop policy if exists "Users can update their own documents"
on public.documents;

create policy "Users can update their own documents"
on public.documents
for update
to authenticated
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

drop policy if exists "Users can delete their own documents"
on public.documents;

create policy "Users can delete their own documents"
on public.documents
for delete
to authenticated
using (
  auth.uid() = user_id
);

drop policy if exists "Users can read their own notification reads"
on public.notification_reads;

create policy "Users can read their own notification reads"
on public.notification_reads
for select
to authenticated
using (
  auth.uid() = user_id
);

drop policy if exists "Users can create their own notification reads"
on public.notification_reads;

create policy "Users can create their own notification reads"
on public.notification_reads
for insert
to authenticated
with check (
  auth.uid() = user_id
);

drop policy if exists "Users can update their own notification reads"
on public.notification_reads;

create policy "Users can update their own notification reads"
on public.notification_reads
for update
to authenticated
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

drop policy if exists "Users can delete their own notification reads"
on public.notification_reads;

create policy "Users can delete their own notification reads"
on public.notification_reads
for delete
to authenticated
using (
  auth.uid() = user_id
);

insert into storage.buckets (
  id,
  name,
  public
)
values (
  'student-documents',
  'student-documents',
  false
)
on conflict (id) do nothing;

drop policy if exists "Users can read their own stored documents"
on storage.objects;

create policy "Users can read their own stored documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'student-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can upload their own stored documents"
on storage.objects;

create policy "Users can upload their own stored documents"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'student-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update their own stored documents"
on storage.objects;

create policy "Users can update their own stored documents"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'student-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'student-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete their own stored documents"
on storage.objects;

create policy "Users can delete their own stored documents"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'student-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);
