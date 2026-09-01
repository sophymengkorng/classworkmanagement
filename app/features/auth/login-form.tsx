"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { siteUrl } from "../../lib/supabase/config";

type AuthMode = "login" | "signup";

function PasswordVisibilityIcon({ visible }: { visible: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {visible ? (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.9 5.2A9.8 9.8 0 0 1 12 5c5 0 8.5 4.2 10 7a16.8 16.8 0 0 1-3.1 4" />
          <path d="M6.6 6.6A16 16 0 0 0 2 12c1.5 2.8 5 7 10 7a9.7 9.7 0 0 0 4.1-.9" />
        </>
      ) : (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  function openDashboard() {
    router.push("/dashboard");
    router.refresh();
  }

  function authCallbackUrl() {
    const origin = siteUrl || window.location.origin;

    return `${origin}/auth/callback?next=/dashboard`;
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
            emailRedirectTo: authCallbackUrl(),
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
            ? "Create an account to manage your classes, Tasks, Documents, And reminders."
            : "Sign in to manage classes, Tasks, Documents, And reminders."}
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

      <div className="relative mt-2">
        <input
          id="password"
          className="h-12 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 pr-12 text-sm outline-none ring-teal-200 transition focus:ring-2"
          type={showPassword ? "text" : "password"}
          value={password}
          placeholder="Enter your password"
          required
          autoComplete={
            isSignup ? "new-password" : "current-password"
          }
          onChange={(event) => setPassword(event.target.value)}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[#4d5a56] hover:bg-black/5"
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((current) => !current)}
        >
          <PasswordVisibilityIcon visible={showPassword} />
        </button>
      </div>

      {/* Confirm Password */}
      {isSignup && (
        <>
          <label
            className="mt-4 block text-sm font-semibold text-[#4d5a56]"
            htmlFor="confirm-password"
          >
            Confirm Password
          </label>

          <div className="relative mt-2">
            <input
              id="confirm-password"
              className="h-12 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 pr-12 text-sm outline-none ring-teal-200 transition focus:ring-2"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              placeholder="Confirm your password"
              required
              autoComplete="new-password"
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[#4d5a56] hover:bg-black/5"
              aria-label={showPassword ? "Hide confirm password" : "Show confirm password"}
              onClick={() => setShowPassword((current) => !current)}
            >
              <PasswordVisibilityIcon visible={showPassword} />
            </button>
          </div>
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
