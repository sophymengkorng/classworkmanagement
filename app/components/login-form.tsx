"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmationDialog } from "./confirmation-dialog";

export function LoginForm() {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConfirmOpen(true);
  }

  return (
    <>
      <form onSubmit={login} className="w-full max-w-md rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:p-6">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-[#24312f] text-lg font-bold text-white">
            SA
          </div>
          <h1 className="mt-4 text-2xl font-bold">Student Assistant</h1>
          <p className="mt-2 text-sm text-[#68736f]">Sign in to manage classes, tasks, documents, and reminders.</p>
        </div>

        <label className="mt-6 block text-sm font-semibold text-[#4d5a56]" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="mt-2 h-12 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm outline-none ring-teal-200 transition focus:ring-2"
          defaultValue="sophymengkorng@gmail.com"
          type="email"
        />

        <label className="mt-4 block text-sm font-semibold text-[#4d5a56]" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          className="mt-2 h-12 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm outline-none ring-teal-200 transition focus:ring-2"
          defaultValue="Aa168168"
          type="password"
        />

        <button className="mt-6 h-12 w-full rounded-md bg-[#24312f] px-4 text-sm font-bold text-white transition hover:bg-[#314540]">
          Login
        </button>
      </form>
      <ConfirmationDialog
        open={confirmOpen}
        title="Continue to dashboard?"
        message="Please confirm that you want to log in and open your student dashboard."
        confirmLabel="Login"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => router.push("/dashboard")}
      />
    </>
  );
}
