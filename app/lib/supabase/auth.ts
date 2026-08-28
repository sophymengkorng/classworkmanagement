import { AuthRequiredError } from "../auth-error";
import { isSupabaseConfigured } from "./config";
import { createClient as createSupabaseServerClient } from "./server";

type AuthenticatedUser = {
  id: string;
  email?: string | null;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
};

export async function getAuthContext() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  const userId = typeof claims?.sub === "string" ? claims.sub : "";

  if (!claimsError && claims && userId) {
    const metadata = claims.user_metadata;
    const fullName = typeof metadata === "object" && metadata && "full_name" in metadata
      ? String(metadata.full_name)
      : undefined;
    const name = typeof metadata === "object" && metadata && "name" in metadata
      ? String(metadata.name)
      : undefined;

    const user: AuthenticatedUser = {
      id: userId,
      email: typeof claims.email === "string" ? claims.email : null,
      user_metadata: {
        full_name: fullName,
        name,
      },
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
