import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "./supabase/config";
import { getAuthContext } from "./supabase/auth";

export async function requireAuthContext() {
  if (!isSupabaseConfigured()) return null;

  try {
    const auth = await getAuthContext();
    if (!auth?.user) redirect("/login");
    return auth;
  } catch {
    redirect("/login");
  }
}

export async function requireAuth() {
  const auth = await requireAuthContext();
  return auth?.user ?? null;
}
