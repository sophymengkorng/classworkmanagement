import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "./supabase/config";
import { getAuthContext } from "./supabase/auth";

export async function requireAuth() {
  if (!isSupabaseConfigured()) return null;

  try {
    const auth = await getAuthContext();
    if (!auth?.user) redirect("/login");
    return auth.user;
  } catch {
    redirect("/login");
  }
}
