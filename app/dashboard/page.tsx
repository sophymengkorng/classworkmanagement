import Link from "next/link";
import { AppShell } from "../components/layout/app-shell";
import { DashboardHeaderActions } from "../features/dashboard/dashboard-header-actions";
import { currentDayName, getTodaysClasses } from "../data";
import { readRecentDocuments } from "../lib/stores/document-store";
import { readNotificationReadIds } from "../lib/stores/notification-store";
import { readProfile } from "../lib/stores/profile-store";
import { requireAuthContext } from "../lib/require-auth";
import { readDashboardTasks } from "../lib/stores/task-store";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const auth = await requireAuthContext();
  const [taskData, documents, readNotificationIds, profile] = await Promise.all([
    readDashboardTasks(auth),
    readRecentDocuments(auth),
    readNotificationReadIds(auth),
    readProfile(auth),
  ]);
  const todaysClasses = getTodaysClasses();
  const todayLabel = currentDayName();

  const stats = [
    { label: "Today's Classes", value: todaysClasses.length },
    { label: "Pending Tasks", value: taskData.pendingCount },
    { label: "Due Tomorrow", value: taskData.dueTomorrowCount },
  ];
  const headerAction = <DashboardHeaderActions tasks={taskData.notificationTasks} readNotificationIds={readNotificationIds} />;

  return (
    <AppShell title="Welcome back" eyebrow="Dashboard" action={headerAction} user={auth?.user} profile={profile}>
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
          <p className="text-sm font-semibold text-teal-700">Today&apos;s Classes - {todayLabel}</p>
          <div className="mt-4 space-y-3">
            {todaysClasses.length === 0 ? (
              <div className="rounded-lg border border-dashed border-black/15 bg-[#fbfbf8] p-4 text-sm font-semibold text-[#68736f]">
                No classes scheduled for {todayLabel}.
              </div>
            ) : (
              todaysClasses.map((item) => (
                <div key={`${item.time}-${item.subject}`} className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 rounded-lg bg-[#fbfbf8] p-3 sm:grid-cols-[110px_1fr]">
                  <span className="text-sm font-bold text-[#4d5a56]">{item.time}</span>
                  <div>
                    <p className="font-bold">{item.subject}</p>
                    <p className="text-sm text-[#68736f]">Room {item.room} - {item.teacher}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 sm:mt-5 lg:grid-cols-2 lg:gap-5">
        <section className="rounded-lg border border-black/10 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-teal-700">Upcoming Tasks</p>
            <Link href="/tasks" className="text-sm font-bold text-[#24312f] hover:text-teal-700">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {taskData.recentTasks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-black/15 bg-[#fbfbf8] p-4 text-sm font-semibold text-[#68736f]">
                No tasks yet. Create your first task from the Tasks page.
              </div>
            ) : (
              taskData.recentTasks.map((task) => (
                <Link key={task.id} href={`/tasks/${task.id}`} className="block rounded-lg border border-black/8 p-4 transition hover:bg-[#fbfbf8]">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <p className="min-w-0 break-words font-bold">{task.title}</p>
                    <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">{task.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-[#68736f]">{task.subject}</p>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-teal-700">Recent Documents</p>
            <Link href="/documents" className="text-sm font-bold text-[#24312f] hover:text-teal-700">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {documents.length === 0 ? (
              <div className="rounded-lg border border-dashed border-black/15 bg-[#fbfbf8] p-4 text-sm font-semibold text-[#68736f]">
                No documents yet. Upload class files from the Documents page.
              </div>
            ) : (
              documents.map((document) => (
                <div key={document.name} className="grid grid-cols-[44px_1fr] gap-3 rounded-lg border border-black/8 p-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[#e8eef8] text-xs font-bold text-[#285178]">
                    {document.type}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{document.name}</p>
                    <p className="text-sm text-[#68736f]">{document.subject}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
