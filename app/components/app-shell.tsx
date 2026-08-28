import Link from "next/link";
import { ReactNode } from "react";
import { currentDayName } from "../data";
import { AppShellNav } from "./app-shell-nav";
import { LogoutButton } from "./logout-button";

type ShellUser = {
  email?: string | null;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
};

function userDisplayName(user?: ShellUser | null) {
  const metadataName = user?.user_metadata?.full_name || user?.user_metadata?.name;
  const emailName = user?.email?.split("@")[0];

  return metadataName || emailName || "Student";
}

function userInitials(name: string) {
  return name
    .split(/[.\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "SA";
}

export function AppShell({
  children,
  title,
  eyebrow,
  action,
  user,
}: {
  children: ReactNode;
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  user?: ShellUser | null;
}) {
  const displayName = userDisplayName(user);
  const initials = userInitials(displayName);
  const defaultEyebrow = currentDayName();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6f4ee] text-[#1d2026]">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-black/10 bg-[#24312f] px-4 py-4 text-white sm:px-5 lg:border-b-0 lg:border-r lg:border-white/10 lg:py-6">
          <Link href="/dashboard" className="flex items-center gap-3" aria-label="Student profile dashboard">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-[#24312f] ring-2 ring-white/20">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-teal-100">Student Assistant</p>
              <h1 className="mt-0.5 truncate text-base font-semibold leading-tight">{displayName}</h1>
              {user?.email && <p className="mt-0.5 truncate text-[11px] font-medium text-white/62">{user.email}</p>}
            </div>
          </Link>

          <AppShellNav />

          <LogoutButton />

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
                <p className="text-sm font-semibold text-[#5c6a67]">{eyebrow ?? defaultEyebrow}</p>
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
