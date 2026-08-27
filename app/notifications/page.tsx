import Link from "next/link";
import { AppShell } from "../components/app-shell";
import { dueLabel, pendingTasks, todaysClasses } from "../data";

export default function NotificationsPage() {
  const notifications = [
    ...pendingTasks.map((task) => ({
      title: task.title,
      detail: dueLabel(task.deadline),
      category: "Assignment",
    })),
    {
      title: `${todaysClasses[0]?.subject ?? "Class"} class`,
      detail: "Starts in 30 minutes",
      category: "Schedule",
    },
  ];

  return (
    <AppShell title="Notifications" eyebrow="Reminder Center">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold">Deadline and class reminders</h3>
          <div className="mt-5 space-y-3">
            {notifications.map((notification) => (
              <article key={`${notification.title}-${notification.detail}`} className="rounded-lg border border-black/8 bg-[#fbfbf8] p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-bold">{notification.title}</p>
                  <span className="w-fit rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#68736f]">{notification.category}</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-[#4d5a56]">{notification.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-teal-700">Next Step</p>
          <h3 className="mt-1 text-xl font-bold">Notification Settings</h3>
          <p className="mt-2 text-sm leading-6 text-[#68736f]">
            Choose Telegram and Gmail settings before connecting the real automation backend.
          </p>
          <Link href="/settings" className="mt-5 flex h-11 items-center justify-center rounded-md bg-[#24312f] px-4 text-sm font-bold text-white">
            Open Settings
          </Link>
        </aside>
      </div>
    </AppShell>
  );
}
