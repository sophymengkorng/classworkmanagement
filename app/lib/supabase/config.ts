export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseAnonKey = supabasePublishableKey;
export const supabaseDocumentBucket = process.env.SUPABASE_DOCUMENT_BUCKET ?? "student-documents";

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}
