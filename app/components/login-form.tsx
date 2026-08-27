"use client";

import { FormEvent, useState } from "react";
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

  function openDashboard() {
    window.location.assign("/dashboard");
  }

  async function handleAuth(authMode: AuthMode) {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!email.trim()) {
        setError("Please enter your email.");
        return;
      }

      if (!password) {
        setError("Please enter your password.");
        return;
      }

      const supabase = createClient();

      // =========================
      // CREATE ACCOUNT
      // =========================
      if (authMode === "signup") {
        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          return;
        }

        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          },
        });

        if (error) {
          setError(error.message);
          return;
        }

        // If email confirmation is disabled,
        // Supabase may immediately create a session.
        if (data.session) {
          openDashboard();
          return;
        }

        // If email confirmation is enabled,
        // the user must click the confirmation email.
        setSuccess(
          "Account created. Please check your email and click the confirmation link. After confirmation, you will be redirected to your dashboard."
        );

        setPassword("");
        setConfirmPassword("");

        return;
      }

      // =========================
      // LOGIN
      // =========================

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (!data.session) {
        setError(
          "Login failed to create a session. Please confirm your email first."
        );
        return;
      }

      openDashboard();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void handleAuth(mode);
  }

  function switchMode(newMode: AuthMode) {
    setMode(newMode);

    setError("");
    setSuccess("");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <form
      onSubmit={submitAuth}
      className="w-full max-w-md rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:p-6"
    >
      {/* Logo + Title */}
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-[#24312f] text-lg font-bold text-white">
          SA
        </div>

        <h1 className="mt-4 text-2xl font-bold">
          Student Assistant
        </h1>

        <p className="mt-2 text-sm text-[#68736f]">
          {isSignup
            ? "Create an account to manage your classes, tasks, documents, and reminders."
            : "Sign in to manage classes, tasks, documents, and reminders."}
        </p>
      </div>

      {/* Login / Create Account Tabs */}
      <div className="mt-6 grid grid-cols-2 rounded-lg bg-[#f5f6f3] p-1">
        <button
          type="button"
          onClick={() => switchMode("login")}
          className={`h-10 rounded-md text-sm transition ${
            mode === "login"
              ? "bg-[#24312f] font-semibold text-white"
              : "text-[#4d5a56]"
          }`}
        >
          Login
        </button>

        <button
          type="button"
          onClick={() => switchMode("signup")}
          className={`h-10 rounded-md text-sm transition ${
            mode === "signup"
              ? "bg-[#24312f] font-semibold text-white"
              : "text-[#4d5a56]"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Email */}
      <label
        className="mt-6 block text-sm font-semibold text-[#4d5a56]"
        htmlFor="email"
      >
        Email
      </label>

      <input
        id="email"
        className="mt-2 h-12 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm outline-none ring-teal-200 transition focus:ring-2"
        type="email"
        value={email}
        placeholder="Enter your email"
        required
        autoComplete="email"
        onChange={(event) => setEmail(event.target.value)}
      />

      {/* Password */}
      <label
        className="mt-4 block text-sm font-semibold text-[#4d5a56]"
        htmlFor="password"
      >
        Password
      </label>

      <input
        id="password"
        className="mt-2 h-12 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm outline-none ring-teal-200 transition focus:ring-2"
        type="password"
        value={password}
        placeholder="Enter your password"
        required
        autoComplete={
          isSignup ? "new-password" : "current-password"
        }
        onChange={(event) => setPassword(event.target.value)}
      />

      {/* Confirm Password */}
      {isSignup && (
        <>
          <label
            className="mt-4 block text-sm font-semibold text-[#4d5a56]"
            htmlFor="confirm-password"
          >
            Confirm Password
          </label>

          <input
            id="confirm-password"
            className="mt-2 h-12 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm outline-none ring-teal-200 transition focus:ring-2"
            type="password"
            value={confirmPassword}
            placeholder="Confirm your password"
            required
            autoComplete="new-password"
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
          />
        </>
      )}

      {/* Error */}
      {error && (
        <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
          {error}
        </p>
      )}

      {/* Success */}
      {success && (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
          {success}
        </p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="mt-6 h-12 w-full rounded-md bg-[#24312f] px-4 text-sm font-bold text-white transition hover:bg-[#314540] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Working..."
          : isSignup
            ? "Create Account"
            : "Login"}
      </button>
    </form>
  );
}