"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/schedule", label: "Schedule" },
  { href: "/tasks", label: "Tasks" },
  { href: "/documents", label: "Documents" },
];

export function AppShellNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:mt-6 lg:grid-cols-1" aria-label="Main navigation">
      {navItems.map((item) => {
        const active = pathname === item.href || (item.href === "/tasks" && pathname.startsWith("/tasks/"));

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            className={`flex min-h-11 items-center justify-center rounded-md px-3 py-2 text-center text-sm font-semibold transition lg:justify-start lg:text-left ${
              active ? "bg-white text-[#24312f]" : "bg-white/5 text-white/78 hover:bg-white/12 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
