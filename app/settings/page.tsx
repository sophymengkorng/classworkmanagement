import { AppShell } from "../components/app-shell";

export default function SettingsPage() {
  return (
    <AppShell title="Settings" eyebrow="Automation Preferences">
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold">Notification Channels</h3>
          <div className="mt-5 space-y-3">
            {["Telegram reminders", "Gmail reminders", "Class start alerts"].map((item) => (
              <label key={item} className="flex items-center justify-between gap-4 rounded-lg border border-black/8 p-4">
                <span className="font-semibold">{item}</span>
                <input className="h-5 w-5 accent-[#24312f]" type="checkbox" defaultChecked />
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold">Backend Connections</h3>
          <div className="mt-5 space-y-3">
            {[
              ["Database", "MySQL or SQL Server"],
              ["Scheduler", "Daily deadline checks"],
              ["Telegram Bot", "Bot API token"],
              ["Email", "Gmail or email service"],
            ].map(([name, detail]) => (
              <div key={name} className="rounded-lg border border-black/8 p-4">
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
    </AppShell>
  );
}
