export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://zgjjxvmroqagqfpwqoyd.supabase.co";

export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_iSu4u98w-2_SwPbS-oExHw_UTqdMiAX";

export const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const supabaseDocumentBucket =
  process.env.SUPABASE_DOCUMENT_BUCKET ?? "student-documents";

export const supabaseAvatarBucket =
  process.env.SUPABASE_AVATAR_BUCKET ?? "student-avatars";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";

export const cronSecret =
  process.env.CRON_SECRET ?? "";

export const telegramBotToken =
  process.env.TELEGRAM_BOT_TOKEN ?? "";

export const gmailClientId =
  process.env.GMAIL_CLIENT_ID ?? "";

export const gmailClientSecret =
  process.env.GMAIL_CLIENT_SECRET ?? "";

export const gmailRefreshToken =
  process.env.GMAIL_REFRESH_TOKEN ?? "";

export const gmailFromEmail =
  process.env.GMAIL_FROM_EMAIL ?? "";

export function isSupabaseConfigured() {
  return Boolean(
    supabaseUrl &&
    supabasePublishableKey
  );
}
