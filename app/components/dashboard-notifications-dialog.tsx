"use client";

import { useEffect, useMemo, useState } from "react";
import { dueLabel, getTodaysClasses, Task } from "../data";

export function DashboardNotificationsDialog({ tasks }: { tasks: Task[] }) {
  const [open, setOpen] = useState(false);

  const notifications = useMemo(
    () => {
      const todaysClasses = getTodaysClasses();

      return [
        ...tasks
        .filter((task) => task.status !== "Completed")
        .map((task) => ({
          title: task.title,
          detail: dueLabel(task.deadline),
          category: "Assignment",
        })),
      {
        title: `${todaysClasses[0]?.subject ?? "Class"} class`,
        detail: "Starts at 5:45 PM",
        category: "Schedule",
      },
      ];
    },
    [tasks],
  );

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="relative flex h-11 w-11 items-center justify-center rounded-md bg-white text-lg font-bold text-[#1f1f1d] ring-1 ring-black/10 transition hover:bg-[#f8faf7]"
        aria-label="Open notifications"
        title="Notifications"
        onClick={() => setOpen(true)}
      >
        <span aria-hidden="true">🔔</span>
        <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#f4c542] px-1.5 text-xs font-bold text-[#24312f]">
          {notifications.length}
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid min-h-dvh place-items-center bg-black/45 p-4">
          <div
            className="mx-auto my-auto w-full max-w-lg rounded-lg border border-black/10 bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-title"
          >
            <div className="flex items-center justify-between gap-4 border-b border-black/10 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-teal-700">Reminder Center</p>
                <h3 id="notification-title" className="text-xl font-bold">
                  Notifications
                </h3>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-black/10 text-sm font-bold hover:bg-[#f8faf7]"
                aria-label="Close notifications"
                onClick={() => setOpen(false)}
              >
                X
              </button>
            </div>

            <div className="max-h-[70vh] space-y-3 overflow-y-auto p-5">
              {notifications.map((notification) => (
                <article key={`${notification.title}-${notification.detail}`} className="rounded-lg border border-black/8 bg-[#fbfbf8] p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-bold">{notification.title}</p>
                    <span className="w-fit rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#68736f]">
                      {notification.category}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-[#4d5a56]">{notification.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
