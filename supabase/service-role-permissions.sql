grant select, insert, update, delete
on table public.tasks
to service_role;

grant select, insert, update, delete
on table public.profiles
to service_role;

grant select, insert, update, delete
on table public.deadline_alerts
to service_role;

grant usage
on schema public
to service_role;
