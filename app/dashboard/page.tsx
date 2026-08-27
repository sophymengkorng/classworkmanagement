import Link from "next/link";
import { AppShell } from "../components/app-shell";
import { DashboardNotificationsDialog } from "../components/dashboard-notifications-dialog";
import { DashboardTaskCreator } from "../components/dashboard-task-creator";
import { daysUntil, todaysClasses } from "../data";
import { readDocuments } from "../lib/document-store";
import { requireAuth } from "../lib/require-auth";
import { readTasks } from "../lib/task-store";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requireAuth();
  const serverTasks = await readTasks();
  const documents = await readDocuments();
  const pendingTasks = serverTasks.filter((task) => task.status !== "Completed");
  const dueTomorrowTasks = pendingTasks.filter((task) => daysUntil(task.deadline) === 1);

  const stats = [
    { label: "Today's Classes", value: todaysClasses.length },
    { label: "Pending Tasks", value: pendingTasks.length },
    { label: "Due Tomorrow", value: dueTomorrowTasks.length },
  ];

  return (
    <AppShell title="Welcome back" eyebrow="Dashboard" action={<DashboardNotificationsDialog tasks={serverTasks} />}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-5">
        <section className="rounded-lg border border-black/10 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg bg-[#f8faf7] p-4">
                <p className="text-sm font-semibold text-[#68736f]">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-[#24312f]">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Link className="flex h-12 items-center justify-center rounded-md bg-[#24312f] px-4 text-sm font-bold text-white" href="/schedule">
              View Schedule
            </Link>
            <Link className="flex h-12 items-center justify-center rounded-md bg-[#f4c542] px-4 text-sm font-bold text-[#24312f]" href="/tasks">
              View Tasks
            </Link>
            <Link className="flex h-12 items-center justify-center rounded-md border border-black/10 bg-white px-4 text-sm font-bold" href="/documents">
              View Documents
            </Link>
          </div>
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm font-semibold text-teal-700">Today&apos;s Classes</p>
          <div className="mt-4 space-y-3">
            {todaysClasses.map((item) => (
              <div key={`${item.time}-${item.subject}`} className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 rounded-lg bg-[#fbfbf8] p-3 sm:grid-cols-[110px_1fr]">
                <span className="text-sm font-bold text-[#4d5a56]">{item.time}</span>
                <div>
                  <p className="font-bold">{item.subject}</p>
                  <p className="text-sm text-[#68736f]">{item.room}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-4 sm:mt-5">
        <DashboardTaskCreator initialTasks={serverTasks} />
      </div>

      <div className="mt-4 grid gap-4 sm:mt-5 lg:grid-cols-2 lg:gap-5">
        <section className="rounded-lg border border-black/10 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm font-semibold text-teal-700">Upcoming Tasks</p>
          <div className="mt-4 space-y-3">
            {serverTasks.slice(0, 3).map((task) => (
              <Link key={task.id} href={`/tasks/${task.id}`} className="block rounded-lg border border-black/8 p-4 transition hover:bg-[#fbfbf8]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <p className="min-w-0 break-words font-bold">{task.title}</p>
                  <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">{task.status}</span>
                </div>
                <p className="mt-1 text-sm text-[#68736f]">{task.subject}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm font-semibold text-teal-700">Recent Documents</p>
          <div className="mt-4 space-y-3">
            {documents.slice(0, 3).map((document) => (
              <div key={document.name} className="grid grid-cols-[44px_1fr] gap-3 rounded-lg border border-black/8 p-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[#e8eef8] text-xs font-bold text-[#285178]">
                  {document.type}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{document.name}</p>
                  <p className="text-sm text-[#68736f]">{document.subject}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
