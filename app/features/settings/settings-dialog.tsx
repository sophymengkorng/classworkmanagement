"use client";

import { useEffect, useState } from "react";

export function DashboardSettingsDialog() {
  const [open, setOpen] = useState(false);

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
        className="flex h-11 w-11 items-center justify-center rounded-md bg-white text-[#1f1f1d] ring-1 ring-black/10 transition hover:bg-[#f8faf7]"
        aria-label="Open settings"
        title="Settings"
        onClick={() => setOpen(true)}
      >
        <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.72 2.28c-.38-.2-.83-.28-1.28-.28h-.88c-.45 0-.9.08-1.28.28-.39.21-.7.53-.9.94l-.82 1.7c-.5.19-.98.45-1.43.75l-1.87-.13a2.2 2.2 0 0 0-1.3.28c-.39.23-.69.58-.9.99l-.44.76c-.22.39-.32.84-.28 1.27.04.45.22.86.51 1.19l1.23 1.41a8.4 8.4 0 0 0 0 1.68l-1.23 1.41c-.29.33-.47.74-.51 1.19-.04.43.06.88.28 1.27l.44.76c.21.41.51.76.9.99.39.22.84.32 1.3.28l1.87-.13c.45.3.93.56 1.43.75l.82 1.7c.2.41.51.73.9.94.38.2.83.28 1.28.28h.88c.45 0 .9-.08 1.28-.28.39-.21.7-.53.9-.94l.82-1.7c.5-.19.98-.45 1.43-.75l1.87.13c.46.04.91-.06 1.3-.28.39-.23.69-.58.9-.99l.44-.76c.22-.39.32-.84.28-1.27a2.18 2.18 0 0 0-.51-1.19l-1.23-1.41a8.4 8.4 0 0 0 0-1.68l1.23-1.41c.29-.33.47-.74.51-1.19.04-.43-.06-.88-.28-1.27l-.44-.76a2.22 2.22 0 0 0-.9-.99 2.2 2.2 0 0 0-1.3-.28l-1.87.13a8.05 8.05 0 0 0-1.43-.75l-.82-1.7c-.2-.41-.51-.73-.9-.94ZM12 16.25a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Z"
          />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid min-h-dvh place-items-center bg-black/45 p-4">
          <div
            className="mx-auto my-auto w-full max-w-2xl rounded-lg border border-black/10 bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-dialog-title"
          >
            <div className="flex items-center justify-between gap-4 border-b border-black/10 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-teal-700">Automation Preferences</p>
                <h3 id="settings-dialog-title" className="text-xl font-bold">
                  Settings
                </h3>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-black/10 text-sm font-bold hover:bg-[#f8faf7]"
                aria-label="Close settings"
                onClick={() => setOpen(false)}
              >
                X
              </button>
            </div>

            <div className="grid max-h-[70vh] gap-4 overflow-y-auto p-5 md:grid-cols-2">
              <section className="rounded-lg border border-black/10 p-4">
                <h4 className="font-bold">Notification Channels</h4>
                <div className="mt-4 space-y-3">
                  {["Telegram reminders", "Gmail reminders", "Class start alerts"].map((item) => (
                    <label key={item} className="flex items-center justify-between gap-4 rounded-lg border border-black/8 p-3">
                      <span className="min-w-0 break-words text-sm font-semibold">{item}</span>
                      <input className="h-5 w-5 accent-[#24312f]" type="checkbox" defaultChecked />
                    </label>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-black/10 p-4">
                <h4 className="font-bold">Backend Connections</h4>
                <div className="mt-4 space-y-3">
                  {[
                    ["Database", "Supabase"],
                    ["Scheduler", "Daily deadline checks"],
                    ["Telegram Bot", "Bot API token"],
                    ["Email", "Gmail or email service"],
                  ].map(([name, detail]) => (
                    <div key={name} className="rounded-lg border border-black/8 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-bold">{name}</p>
                        <span className="rounded-full bg-[#fff9eb] px-2.5 py-1 text-xs font-bold text-[#8a6500]">Later</span>
                      </div>
                      <p className="mt-1 text-sm text-[#68736f]">{detail}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
