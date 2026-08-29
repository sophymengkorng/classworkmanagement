"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { daysUntil, dueLabel, Task } from "../../data";

type NotificationItem = {
  id: string;
  title: string;
  detail: string;
  category: string;
};

export function DashboardNotificationsDialog({ tasks, initialReadIds }: { tasks: Task[]; initialReadIds: string[] }) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>(initialReadIds);

  const notifications = useMemo<NotificationItem[]>(
    () =>
      tasks
        .filter((task) => task.status !== "Completed" && daysUntil(task.deadline) === 1)
        .map((task) => ({
          id: `task-${task.id}-${task.deadline}`,
          title: task.title,
          detail: dueLabel(task.deadline),
          category: "Assignment",
        })),
    [tasks],
  );

  const unreadCount = notifications.filter((notification) => !readIds.includes(notification.id)).length;

  useEffect(() => {
    if (!open) return;

    function closeDropdown(event: KeyboardEvent | MouseEvent) {
      if (event instanceof KeyboardEvent) {
        if (event.key === "Escape") setOpen(false);
        return;
      }

      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", closeDropdown);
    window.addEventListener("mousedown", closeDropdown);
    return () => {
      window.removeEventListener("keydown", closeDropdown);
      window.removeEventListener("mousedown", closeDropdown);
    };
  }, [open]);

  async function markAsRead(id: string) {
    if (readIds.includes(id)) return;

    setReadIds((current) => {
      if (current.includes(id)) return current;
      return [...current, id];
    });

    try {
      const response = await fetch("/api/notifications/read", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });

      if (!response.ok) {
        throw new Error("Could not save notification read status.");
      }
    } catch {
      setReadIds((current) => current.filter((readId) => readId !== id));
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        className="relative flex h-11 w-11 items-center justify-center rounded-md bg-white text-lg font-bold ring-1 ring-black/10 transition hover:bg-[#f8faf7]"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open notifications"
        title="Notifications"
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#f4c542] px-1.5 text-xs font-bold text-[#24312f]">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(88vw,26rem)] overflow-hidden rounded-lg border border-black/10 bg-white shadow-xl"
          role="menu"
          aria-labelledby="notification-title"
        >
          <div className="flex items-start justify-between gap-4 border-b border-black/10 px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-teal-700">Reminder Center</p>
              <h3 id="notification-title" className="text-lg font-bold">
                Notifications
              </h3>
            </div>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-black/10 text-sm font-bold hover:bg-[#f8faf7]"
              aria-label="Close notifications"
              onClick={() => setOpen(false)}
            >
              X
            </button>
          </div>

          <div className="max-h-[65vh] space-y-3 overflow-y-auto p-4">
            {notifications.length === 0 ? (
              <div className="rounded-lg border border-dashed border-black/15 bg-[#fbfbf8] p-4 text-center">
                <p className="font-bold text-[#24312f]">No deadline notification</p>
                <p className="mt-1 text-sm leading-6 text-[#68736f]">
                  Notifications will show here when a pending task has one day remaining.
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const isRead = readIds.includes(notification.id);

                return (
                  <button
                    key={notification.id}
                    type="button"
                    className={`block w-full rounded-lg border p-4 text-left transition ${
                      isRead ? "border-black/8 bg-[#fbfbf8] opacity-75" : "border-[#f4c542] bg-[#fff9eb]"
                    }`}
                    role="menuitem"
                    onClick={() => {
                      void markAsRead(notification.id);
                    }}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-bold">{notification.title}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="w-fit rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#68736f]">
                          {notification.category}
                        </span>
                        <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${isRead ? "bg-slate-100 text-slate-600" : "bg-teal-100 text-teal-700"}`}>
                          {isRead ? "Read" : "Unread"}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-[#4d5a56]">{notification.detail}</p>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
