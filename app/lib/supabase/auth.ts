import { AuthRequiredError } from "../auth-error";
import { isSupabaseConfigured } from "./config";
import { createClient as createSupabaseServerClient } from "./server";

export async function getAuthContext() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthRequiredError();
  }

  return { supabase, user };
}
