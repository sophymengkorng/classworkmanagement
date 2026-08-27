"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/schedule", label: "Schedule" },
  { href: "/tasks", label: "Tasks" },
  { href: "/documents", label: "Documents" },
  { href: "/notifications", label: "Notifications" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({ children, title, eyebrow }: { children: ReactNode; title: string; eyebrow?: string }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[#f6f4ee] text-[#1d2026]">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-black/10 bg-[#24312f] px-5 py-5 text-white lg:border-b-0 lg:border-r lg:border-white/10 lg:py-6">
          <Link href="/dashboard" className="flex items-center justify-between gap-4 lg:block" aria-label="ClassFlow dashboard">
            <div>
              <p className="text-sm font-medium text-teal-100">Student Assistant</p>
              <h1 className="mt-1 text-2xl font-semibold">ClassFlow</h1>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-lg font-bold text-[#24312f]">
              SA
            </div>
          </Link>

          <nav className="mt-6 grid grid-cols-2 gap-2 lg:grid-cols-1" aria-label="Main navigation">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href === "/tasks" && pathname.startsWith("/tasks/"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-11 items-center rounded-md px-3 text-sm font-semibold transition ${
                    active ? "bg-white text-[#24312f]" : "bg-white/5 text-white/78 hover:bg-white/12 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-lg border border-white/12 bg-white/8 p-4">
            <p className="text-sm font-semibold">Automation Status</p>
            <p className="mt-2 text-sm leading-6 text-white/72">
              Scheduler, Telegram, and Gmail are ready to connect after the backend database is added.
            </p>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="border-b border-black/10 bg-white/80 px-5 py-4 backdrop-blur md:px-8">
            <p className="text-sm font-semibold text-[#5c6a67]">{eyebrow ?? "Thursday, August 27, 2026"}</p>
            <h2 className="mt-1 text-2xl font-bold md:text-3xl">{title}</h2>
          </header>
          <div className="px-5 py-5 md:px-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
