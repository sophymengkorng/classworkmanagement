import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import {
  supabasePublishableKey,
  supabaseUrl,
} from "./config";

export async function createClient() {
  const cookieStore = await cookies();

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase is not configured.");
  }

  return createServerClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({ name, value, options }) => {
                cookieStore.set(
                  name,
                  value,
                  options
                );
              }
            );
          } catch {
            // Server Components cannot always write cookies.
          }
        },
      },
    }
  );
}