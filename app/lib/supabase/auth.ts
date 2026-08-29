import { AuthRequiredError } from "../auth-error";
import { isSupabaseConfigured } from "./config";
import { createClient as createSupabaseServerClient } from "./server";

type AuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

export async function getAuthContext() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;

  if (!claimsError && typeof claims?.sub === "string") {
    const user: AuthUser = {
      id: claims.sub,
      email: typeof claims.email === "string" ? claims.email : null,
      user_metadata: typeof claims.user_metadata === "object" && claims.user_metadata ? claims.user_metadata as Record<string, unknown> : {},
    };

    return { supabase, user };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthRequiredError();
  }

  return { supabase, user };
}

export type AuthContext = NonNullable<Awaited<ReturnType<typeof getAuthContext>>>;
