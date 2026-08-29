import { AuthRequiredError } from "../auth-error";
import { AuthContext, getAuthContext } from "../supabase/auth";
import { supabaseAvatarBucket } from "../supabase/config";

const maxAvatarSize = 2 * 1024 * 1024;

type ProfileInput = {
  fullName: string;
  nickname: string;
  email: string;
  studentId: string;
  phone: string;
  avatar?: File | null;
};

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  studentId: string;
  phone: string;
  className: string;
  year: string;
  semester: string;
  avatarUrl: string;
  avatarPath: string;
};

type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  student_id: string | null;
  phone: string | null;
  class_name: string | null;
  year: string | null;
  semester: string | null;
  avatar_url: string | null;
  avatar_path: string | null;
};

function rowToProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    email: row.email ?? "",
    displayName: row.display_name ?? "",
    studentId: row.student_id ?? "",
    phone: row.phone ?? "",
    className: row.class_name ?? "",
    year: row.year ?? "",
    semester: row.semester ?? "",
    avatarUrl: row.avatar_url ?? "",
    avatarPath: row.avatar_path ?? "",
  };
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function validateAvatar(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Profile image must be an image file.");
  }

  if (file.size > maxAvatarSize) {
    throw new Error("Profile image must be 2 MB or smaller.");
  }
}

function avatarStoragePath(userId: string, fileName: string) {
  return `${userId}/avatar-${Date.now()}-${sanitizeFileName(fileName)}`;
}

function avatarUploadErrorMessage(message: string) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("bucket not found")) {
    return `Could not upload profile image to Supabase Storage: bucket "${supabaseAvatarBucket}" was not found. Run supabase/avatar-storage-policies.sql in Supabase SQL Editor.`;
  }

  if (lowerMessage.includes("row-level security") || lowerMessage.includes("permission")) {
    return `Could not upload profile image to Supabase Storage: permission is missing. Run supabase/avatar-storage-policies.sql in Supabase SQL Editor.`;
  }

  return `Could not upload profile image to Supabase Storage: ${message}`;
}

export async function readProfile(authContext?: AuthContext | null) {
  const auth = authContext ?? await getAuthContext();
  if (!auth) return null;

  const { data, error } = await auth.supabase
    .from("profiles")
    .select("id,email,display_name,student_id,phone,class_name,year,semester,avatar_url,avatar_path")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not read profile from Supabase: ${error.message}`);
  }

  if (data) {
    return rowToProfile(data as ProfileRow);
  }

  const metadata = auth.user.user_metadata ?? {};
  return {
    id: auth.user.id,
    email: auth.user.email ?? "",
    displayName: String(metadata.nickname ?? metadata.full_name ?? metadata.name ?? ""),
    studentId: String(metadata.student_id ?? ""),
    phone: String(metadata.phone ?? ""),
    className: "",
    year: "",
    semester: "",
    avatarUrl: String(metadata.avatar_url ?? ""),
    avatarPath: String(metadata.avatar_path ?? ""),
  };
}

export async function updateProfile(input: ProfileInput, authContext?: AuthContext | null) {
  const auth = authContext ?? await getAuthContext();
  if (!auth) {
    throw new AuthRequiredError();
  }

  const fullName = input.fullName.trim();
  const nickname = input.nickname.trim();
  const email = input.email.trim();
  const studentId = input.studentId.trim();
  const phone = input.phone.trim();

  if (!fullName && !nickname) {
    throw new Error("Please enter a name or nickname.");
  }

  if (!email) {
    throw new Error("Please enter an email.");
  }

  const metadata = auth.user.user_metadata ?? {};
  const previousProfile = await readProfile(auth);
  let avatarUrl = previousProfile?.avatarUrl || String(metadata.avatar_url ?? "");
  let avatarPath = previousProfile?.avatarPath || String(metadata.avatar_path ?? "");

  if (input.avatar && input.avatar.size > 0) {
    validateAvatar(input.avatar);

    const nextAvatarPath = avatarStoragePath(auth.user.id, input.avatar.name);
    const buffer = await input.avatar.arrayBuffer();

    const { error: uploadError } = await auth.supabase.storage.from(supabaseAvatarBucket).upload(nextAvatarPath, buffer, {
      contentType: input.avatar.type || "image/png",
      upsert: false,
    });

    if (uploadError) {
      throw new Error(avatarUploadErrorMessage(uploadError.message));
    }

    const { data } = auth.supabase.storage.from(supabaseAvatarBucket).getPublicUrl(nextAvatarPath);
    avatarUrl = data.publicUrl;

    if (avatarPath) {
      await auth.supabase.storage.from(supabaseAvatarBucket).remove([avatarPath]);
    }

    avatarPath = nextAvatarPath;
  }

  const { data: profileData, error: profileError } = await auth.supabase
    .from("profiles")
    .upsert(
      {
        id: auth.user.id,
        email,
        display_name: nickname || fullName,
        student_id: studentId,
        phone,
        class_name: "SW35 (E-T)",
        year: "Year 2",
        semester: "Semester 2",
        avatar_url: avatarUrl,
        avatar_path: avatarPath,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )
    .select("id,email,display_name,student_id,phone,class_name,year,semester,avatar_url,avatar_path")
    .single();

  if (profileError) {
    throw new Error(`Could not save profile to Supabase database: ${profileError.message}`);
  }

  const savedProfile = rowToProfile(profileData as ProfileRow);

  const { error: metadataError } = await auth.supabase.auth.updateUser({
    data: {
      ...metadata,
      full_name: fullName,
      name: fullName,
      nickname,
      student_id: studentId,
      phone,
      avatar_url: avatarUrl,
      avatar_path: avatarPath,
    },
  });

  if (metadataError) {
    console.warn(`Profile database save succeeded, but auth metadata did not update: ${metadataError.message}`);
  }

  return {
    fullName,
    nickname: savedProfile.displayName,
    studentId: savedProfile.studentId,
    phone: savedProfile.phone,
    avatarUrl: savedProfile.avatarUrl,
    email: savedProfile.email || auth.user.email || "",
  };
}
