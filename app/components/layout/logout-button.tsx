"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { ConfirmationDialog } from "../ui/confirmation-dialog";

export function LogoutButton() {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);

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
    <>
      <button
        type="button"
        className="mt-3 flex min-h-11 w-full items-center justify-center rounded-md border border-white/12 px-3 py-2 text-center text-sm font-semibold text-white/78 transition hover:bg-white/12 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 lg:justify-start lg:text-left"
        disabled={loggingOut}
        onClick={() => setConfirmOpen(true)}
      >
        {loggingOut ? "Logging out" : "Logout"}
      </button>
      <ConfirmationDialog
        open={confirmOpen}
        title="Log out?"
        message="Please confirm before leaving your student account."
        confirmLabel="Logout"
        cancelLabel="Cancel"
        tone="danger"
        busy={loggingOut}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          void logout();
        }}
      />
    </>
  );
}
