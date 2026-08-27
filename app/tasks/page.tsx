import { AppShell } from "../components/app-shell";
import { TasksManager } from "../components/tasks-manager";
import { requireAuth } from "../lib/require-auth";
import { readTasks } from "../lib/task-store";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const user = await requireAuth();
  const tasks = await readTasks();

  return (
    <AppShell title="My Tasks" eyebrow="Assignments" user={user}>
      <TasksManager initialTasks={tasks} />
    </AppShell>
  );
}
