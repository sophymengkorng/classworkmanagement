"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/schedule", label: "Schedule" },
  { href: "/tasks", label: "Tasks" },
  { href: "/documents", label: "Documents" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({
  children,
  title,
  eyebrow,
  action,
}: {
  children: ReactNode;
  title: string;
  eyebrow?: string;
  action?: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6f4ee] text-[#1d2026]">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-black/10 bg-[#24312f] px-4 py-4 text-white sm:px-5 lg:border-b-0 lg:border-r lg:border-white/10 lg:py-6">
          <Link href="/dashboard" className="flex items-center justify-between gap-4 lg:block" aria-label="Class Student Automation dashboard">
            <div>
              <p className="text-sm font-medium text-teal-100">Student Assistant</p>
              <h1 className="mt-1 text-2xl font-semibold">Class</h1>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-lg font-bold text-[#24312f]">
              SA
            </div>
          </Link>

          <nav className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:mt-6 lg:grid-cols-1" aria-label="Main navigation">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href === "/tasks" && pathname.startsWith("/tasks/"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-11 items-center justify-center rounded-md px-3 py-2 text-center text-sm font-semibold transition lg:justify-start lg:text-left ${
                    active ? "bg-white text-[#24312f]" : "bg-white/5 text-white/78 hover:bg-white/12 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 hidden rounded-lg border border-white/12 bg-white/8 p-4 lg:block">
            <p className="text-sm font-semibold">Automation Status</p>
            <p className="mt-2 text-sm leading-6 text-white/72">
              Scheduler, Telegram, and Gmail are ready to connect after the backend database is added.
            </p>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="border-b border-black/10 bg-white/80 px-4 py-4 backdrop-blur sm:px-5 md:px-8">
            <div className="flex items-start justify-between gap-3 sm:items-center sm:gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#5c6a67]">{eyebrow ?? "Thursday, August 27, 2026"}</p>
                <h2 className="mt-1 break-words text-xl font-bold leading-tight sm:text-2xl md:truncate md:text-3xl">{title}</h2>
              </div>
              {action && <div className="shrink-0">{action}</div>}
            </div>
          </header>
          <div className="px-3 py-4 sm:px-5 sm:py-5 md:px-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
