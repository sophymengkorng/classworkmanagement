import Link from "next/link";
import { AppShell } from "../components/app-shell";
import { dueLabel, formattedDate, tasks } from "../data";

function statusClass(status: string) {
  if (status === "Completed") return "bg-emerald-100 text-emerald-700";
  if (status === "In progress") return "bg-sky-100 text-sky-700";
  return "bg-rose-100 text-rose-700";
}

export default function TasksPage() {
  return (
    <AppShell title="My Tasks" eyebrow="Assignments">
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {tasks.map((task) => (
          <article key={task.id} className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-teal-700">{task.subject}</p>
                <h3 className="mt-1 text-xl font-bold">{task.title}</h3>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(task.status)}`}>{task.status}</span>
            </div>
            <p className="mt-4 text-sm font-semibold text-[#68736f]">Due: {formattedDate(task.deadline)}</p>
            <p className="mt-1 text-sm font-bold text-[#24312f]">{dueLabel(task.deadline)}</p>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#68736f]">{task.description}</p>
            <Link
              href={`/tasks/${task.id}`}
              className="mt-5 flex h-11 items-center justify-center rounded-md bg-[#24312f] px-4 text-sm font-bold text-white transition hover:bg-[#314540]"
            >
              View Task
            </Link>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
