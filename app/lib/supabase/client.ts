"use client";

import { createBrowserClient } from "@supabase/ssr";

import {
  supabaseUrl,
  supabasePublishableKey,
} from "./config";

export function createClient() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Supabase is not configured."
    );
  }

  return createBrowserClient(
    supabaseUrl,
    supabasePublishableKey
  );
}