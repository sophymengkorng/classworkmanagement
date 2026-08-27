import { AppShell } from "../components/app-shell";
import { TasksManager } from "../components/tasks-manager";
import { readTasks } from "../lib/task-store";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = await readTasks();

  return (
    <AppShell title="My Tasks" eyebrow="Assignments">
      <TasksManager initialTasks={tasks} />
    </AppShell>
  );
}
