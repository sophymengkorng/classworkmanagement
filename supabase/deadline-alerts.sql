alter table public.profiles
add column if not exists telegram_chat_id text;

create table if not exists public.deadline_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  alert_type text not null check (alert_type in ('telegram', 'gmail')),
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id, task_id, alert_type)
);

create index if not exists deadline_alerts_user_task_idx
on public.deadline_alerts (
  user_id,
  task_id,
  alert_type
);

grant select, insert, update, delete
on table public.deadline_alerts
to authenticated;

alter table public.deadline_alerts enable row level security;

drop policy if exists "Users can read their own deadline alerts"
on public.deadline_alerts;

create policy "Users can read their own deadline alerts"
on public.deadline_alerts
for select
to authenticated
using (
  auth.uid() = user_id
);

drop policy if exists "Users can create their own deadline alerts"
on public.deadline_alerts;

create policy "Users can create their own deadline alerts"
on public.deadline_alerts
for insert
to authenticated
with check (
  auth.uid() = user_id
);
