create table if not exists public.notification_reads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  notification_id text not null,
  read_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id, notification_id)
);

grant usage on schema public to authenticated;

grant select, insert, update, delete
on table public.notification_reads
to authenticated;

alter table public.notification_reads enable row level security;

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

create index if not exists notification_reads_user_created_at_idx
on public.notification_reads (
  user_id,
  created_at desc
);
