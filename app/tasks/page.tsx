import { AppShell } from "../components/app-shell";
import { TasksManager } from "../components/tasks-manager";
import { requireAuthContext } from "../lib/require-auth";
import { readTasks } from "../lib/task-store";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const auth = await requireAuthContext();
  const tasks = await readTasks(auth);

  return (
    <AppShell title="My Tasks" eyebrow="Assignments" user={auth?.user}>
      <TasksManager initialTasks={tasks} />
    </AppShell>
  );
}
