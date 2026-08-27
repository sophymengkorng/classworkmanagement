export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://zgjjxvmroqagqfpwqoyd.supabase.co";

export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_iSu4u98w-2_SwPbS-oExHw_UTqdMiAX";

export const supabaseDocumentBucket =
  process.env.SUPABASE_DOCUMENT_BUCKET ?? "student-documents";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";

export function isSupabaseConfigured() {
  return Boolean(
    supabaseUrl &&
    supabasePublishableKey
  );
}
