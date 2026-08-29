import { AppShell } from "../components/layout/app-shell";
import { DashboardHeaderActions } from "../features/dashboard/dashboard-header-actions";
import { TasksManager } from "../features/tasks/tasks-manager";
import { readNotificationReadIds } from "../lib/stores/notification-store";
import { readProfile } from "../lib/stores/profile-store";
import { requireAuthContext } from "../lib/require-auth";
import { readTasks } from "../lib/stores/task-store";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const auth = await requireAuthContext();
  const [tasks, readNotificationIds, profile] = await Promise.all([readTasks(auth), readNotificationReadIds(auth), readProfile(auth)]);

  return (
    <AppShell title="My Tasks" eyebrow="Assignments" action={<DashboardHeaderActions tasks={tasks} readNotificationIds={readNotificationIds} />} user={auth?.user} profile={profile}>
      <TasksManager initialTasks={tasks} />
    </AppShell>
  );
}
