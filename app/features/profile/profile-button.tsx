"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { classInfo } from "../../data";
import { UserProfile } from "../../lib/stores/profile-store";

type ProfileUser = {
  email?: string | null;
  user_metadata?: {
    full_name?: string;
    name?: string;
    nickname?: string;
    student_id?: string;
    phone?: string;
    avatar_url?: string;
  };
};

type ProfileResponse = {
  profile?: {
    fullName: string;
    nickname: string;
    studentId: string;
    phone: string;
    avatarUrl: string;
    email: string;
  };
  message?: string;
};

const avatarMaxDimension = 512;
const avatarQuality = 0.82;

function initialsFromName(name: string) {
  return name
    .split(/[.\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "SA";
}

function imageFromObjectUrl(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not prepare profile image."));
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", avatarQuality);
  });
}

async function resizeAvatarFile(file: File) {
  if (!file.type.startsWith("image/")) return file;

  const sourceUrl = URL.createObjectURL(file);

  try {
    const image = await imageFromObjectUrl(sourceUrl);
    const longestSide = Math.max(image.width, image.height);

    if (longestSide <= avatarMaxDimension && file.size <= 350 * 1024) {
      return file;
    }

    const scale = Math.min(1, avatarMaxDimension / longestSide);
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return file;

    context.drawImage(image, 0, 0, width, height);
    const blob = await canvasToBlob(canvas);
    if (!blob) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "avatar";
    return new File([blob], `${baseName}.webp`, { type: "image/webp" });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

export function ProfileButton({
  user,
  profile,
  displayName,
  initials,
}: {
  user?: ProfileUser | null;
  profile?: UserProfile | null;
  displayName: string;
  initials: string;
}) {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [displayNameValue, setDisplayNameValue] = useState(profile?.displayName || user?.user_metadata?.nickname || user?.user_metadata?.full_name || user?.user_metadata?.name || "");
  const [email, setEmail] = useState(profile?.email || user?.email || "");
  const [studentId, setStudentId] = useState(profile?.studentId || user?.user_metadata?.student_id || "");
  const [phone, setPhone] = useState(profile?.phone || user?.user_metadata?.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || user?.user_metadata?.avatar_url || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const currentName = displayNameValue || displayName;
  const currentInitials = useMemo(() => initialsFromName(currentName || initials), [currentName, initials]);
  const previewUrl = useMemo(() => (avatarFile ? URL.createObjectURL(avatarFile) : avatarUrl), [avatarFile, avatarUrl]);

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  useEffect(() => {
    if (!avatarFile) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [avatarFile, previewUrl]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("fullName", displayNameValue);
      formData.append("nickname", displayNameValue);
      formData.append("email", email);
      formData.append("studentId", studentId);
      formData.append("phone", phone);
      if (avatarFile) {
        setMessage("Preparing profile image...");
        formData.append("avatar", await resizeAvatarFile(avatarFile));
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        credentials: "same-origin",
        body: formData,
      });
      const result = (await response.json()) as ProfileResponse;

      if (!response.ok || !result.profile) {
        throw new Error(result.message ?? "Could not update profile.");
      }

      setDisplayNameValue(result.profile.nickname || result.profile.fullName);
      setEmail(result.profile.email);
      setStudentId(result.profile.studentId);
      setPhone(result.profile.phone);
      setAvatarUrl(result.profile.avatarUrl);
      setAvatarFile(null);
      setMessage("Profile updated and saved to Supabase.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button type="button" className="flex w-full items-center gap-3 text-left" aria-label="Open profile" onClick={() => setOpen(true)}>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white bg-cover bg-center text-sm font-bold text-[#24312f] ring-2 ring-white/20"
          style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
        >
          {avatarUrl ? null : currentInitials}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-teal-100">Student Assistant</p>
          <h1 className="mt-0.5 truncate text-base font-semibold leading-tight">{currentName}</h1>
          {email && <p className="mt-0.5 truncate text-[11px] font-medium text-white/62">{email}</p>}
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid min-h-dvh place-items-center bg-black/45 p-4">
          <form
            onSubmit={saveProfile}
            className="mx-auto my-auto w-full max-w-md rounded-lg border border-black/10 bg-white text-[#1d2026] shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-dialog-title"
          >
            <div className="flex items-center justify-between gap-4 border-b border-black/10 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-teal-700">Student Profile</p>
                <h3 id="profile-dialog-title" className="text-xl font-bold">
                  View and edit profile
                </h3>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-black/10 text-sm font-bold hover:bg-[#f8faf7]"
                aria-label="Close profile"
                onClick={() => setOpen(false)}
              >
                X
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="group relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#24312f] bg-cover bg-center text-lg font-bold text-white ring-2 ring-black/10 transition hover:ring-[#f4c542]"
                  style={previewUrl ? { backgroundImage: `url(${previewUrl})` } : undefined}
                  aria-label="Change profile image"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {previewUrl ? null : currentInitials}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100">
                    Change
                  </span>
                </button>
                <input
                  ref={avatarInputRef}
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0] ?? null;
                    setAvatarFile(nextFile);
                    if (nextFile) setMessage("Profile image selected. Click Save Profile to save it.");
                  }}
                />
                <div className="min-w-0">
                  <p className="truncate font-bold">{currentName}</p>
                  <p className="truncate text-sm text-[#68736f]">{email || "No email"}</p>
                </div>
              </div>

              <label className="block">
                <span className="text-sm font-bold text-[#4d5a56]">Display name</span>
                <input
                  className="mt-2 h-11 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm outline-none ring-teal-200 focus:ring-2"
                  value={displayNameValue}
                  onChange={(event) => setDisplayNameValue(event.target.value)}
                  placeholder="Enter your name or nickname"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-[#4d5a56]">Email</span>
                <input
                  className="mt-2 h-11 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm outline-none ring-teal-200 focus:ring-2"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter email"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-[#4d5a56]">Student ID</span>
                <input
                  className="mt-2 h-11 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm outline-none ring-teal-200 focus:ring-2"
                  value={studentId}
                  onChange={(event) => setStudentId(event.target.value)}
                  placeholder="Enter student ID"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-[#4d5a56]">Phone</span>
                <input
                  className="mt-2 h-11 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm outline-none ring-teal-200 focus:ring-2"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Enter phone"
                />
              </label>

              <div className="space-y-3 rounded-lg border border-black/8 bg-[#fbfbf8] p-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-bold text-[#4d5a56]">Class</p>
                  <p className="text-right text-[#68736f]">{profile?.className || classInfo.group}</p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <p className="font-bold text-[#4d5a56]">Year</p>
                  <p className="text-right text-[#68736f]">{profile?.year || classInfo.year}</p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <p className="font-bold text-[#4d5a56]">Semester</p>
                  <p className="text-right text-[#68736f]">{profile?.semester || classInfo.semester}</p>
                </div>
              </div>

              {message && <p className="rounded-md bg-[#f8faf7] px-3 py-2 text-sm font-semibold text-[#4d5a56]">{message}</p>}

              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  className="h-11 rounded-md border border-black/10 px-4 text-sm font-bold hover:bg-[#f8faf7]"
                  disabled={saving}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="h-11 rounded-md bg-[#24312f] px-4 text-sm font-bold text-white transition hover:bg-[#314540] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? "Saving" : "Save Profile"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
