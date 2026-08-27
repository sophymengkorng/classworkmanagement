"use client";

import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // If Supabase is not configured yet, still return to the login page.
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      className="mt-3 flex min-h-11 w-full items-center justify-center rounded-md border border-white/12 px-3 py-2 text-center text-sm font-semibold text-white/78 transition hover:bg-white/12 hover:text-white lg:justify-start lg:text-left"
      onClick={() => {
        void logout();
      }}
    >
      Logout
    </button>
  );
}

