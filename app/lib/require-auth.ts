import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "./supabase/config";
import { createClient as createSupabaseServerClient } from "./supabase/server";

export async function requireAuth() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };

  if (!user) redirect("/login");

  return user;
}

