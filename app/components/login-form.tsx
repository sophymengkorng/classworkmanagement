"use client";

import { FormEvent } from "react";
import { useState } from "react";
import { createClient } from "../lib/supabase/client";

type AuthMode = "login" | "signup";

export function LoginForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setSuccess("");
  }

  function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (isSignup && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    void handleAuth();
  }

  function openSystemPage() {
    window.location.assign(new URL("/dashboard", window.location.origin).toString());
  }

  async function handleAuth() {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createClient();

      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          },
        });

        if (error) {
          setError(error.message);
          return;
        }

        if (data.session) {
          openSystemPage();
          return;
        }

        setSuccess("Account created. Please check your email to confirm your account, then log in.");
        setMode("login");
        setPassword("");
        setConfirmPassword("");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message);
        return;
      }

      if (!data.session) {
        setError("Login did not create a session. Please confirm your email, then try again.");
        return;
      }

      openSystemPage();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not continue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submitAuth} className="w-full max-w-md rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:p-6">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-[#24312f] text-lg font-bold text-white">
            SA
          </div>
          <h1 className="mt-4 text-2xl font-bold">Student Assistant</h1>
          <p className="mt-2 text-sm text-[#68736f]">
            {isSignup ? "Create an account to start managing classwork." : "Sign in to manage classes, tasks, documents, and reminders."}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-1 rounded-lg bg-[#f8faf7] p-1">
          <button
            type="button"
            className={`h-10 rounded-md px-3 text-sm font-bold transition ${
              mode === "login" ? "bg-[#24312f] text-white shadow-sm" : "text-[#4d5a56] hover:bg-white"
            }`}
            aria-pressed={mode === "login"}
            onClick={() => switchMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`h-10 rounded-md px-3 text-sm font-bold transition ${
              mode === "signup" ? "bg-[#24312f] text-white shadow-sm" : "text-[#4d5a56] hover:bg-white"
            }`}
            aria-pressed={mode === "signup"}
            onClick={() => switchMode("signup")}
          >
            Create Account
          </button>
        </div>

        <label className="mt-6 block text-sm font-semibold text-[#4d5a56]" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="mt-2 h-12 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm outline-none ring-teal-200 transition focus:ring-2"
          type="email"
          value={email}
          required
          onChange={(event) => setEmail(event.target.value)}
        />

        <label className="mt-4 block text-sm font-semibold text-[#4d5a56]" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          className="mt-2 h-12 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm outline-none ring-teal-200 transition focus:ring-2"
          type="password"
          value={password}
          required
          onChange={(event) => setPassword(event.target.value)}
        />

        {isSignup && (
          <>
            <label className="mt-4 block text-sm font-semibold text-[#4d5a56]" htmlFor="confirm-password">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              className="mt-2 h-12 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm outline-none ring-teal-200 transition focus:ring-2"
              type="password"
              value={confirmPassword}
              required
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </>
        )}

        {error && <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>}
        {success && <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{success}</p>}

        <button
          type="submit"
          className="mt-6 h-12 w-full rounded-md bg-[#24312f] px-4 text-sm font-bold text-white transition hover:bg-[#314540] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
        >
          {loading ? (isSignup ? "Creating account..." : "Logging in...") : isSignup ? "Create Account" : "Login"}
        </button>
    </form>
  );
}
