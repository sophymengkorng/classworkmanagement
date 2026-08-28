import { AppShell } from "../components/app-shell";
import { DashboardHeaderActions } from "../components/dashboard-header-actions";
import { TasksManager } from "../components/tasks-manager";
import { readNotificationReadIds } from "../lib/notification-store";
import { requireAuthContext } from "../lib/require-auth";
import { readTasks } from "../lib/task-store";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const auth = await requireAuthContext();
  const [tasks, readNotificationIds] = await Promise.all([readTasks(auth), readNotificationReadIds(auth)]);

  return (
    <AppShell title="My Tasks" eyebrow="Assignments" action={<DashboardHeaderActions tasks={tasks} readNotificationIds={readNotificationIds} />} user={auth?.user}>
      <TasksManager initialTasks={tasks} />
    </AppShell>
  );
}
