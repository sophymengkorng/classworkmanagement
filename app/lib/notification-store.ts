import { AuthRequiredError } from "./auth-error";
import { AuthContext, getAuthContext } from "./supabase/auth";

type NotificationReadRow = {
  notification_id: string;
};

export async function readNotificationReadIds(authContext?: AuthContext | null) {
  const auth = authContext ?? await getAuthContext();
  if (!auth) return [];

  const { data, error } = await auth.supabase
    .from("notification_reads")
    .select("notification_id")
    .eq("user_id", auth.user.id);

  if (error) {
    console.warn(`Could not read notification status from Supabase: ${error.message}`);
    return [];
  }

  return (data ?? []).map((row) => (row as NotificationReadRow).notification_id);
}

export async function markNotificationRead(notificationId: string, authContext?: AuthContext | null) {
  const normalizedId = notificationId.trim();
  if (!normalizedId) {
    throw new Error("Notification ID is required.");
  }

  const auth = authContext ?? await getAuthContext();
  if (!auth) {
    throw new AuthRequiredError();
  }

  const { error } = await auth.supabase
    .from("notification_reads")
    .upsert(
      {
        user_id: auth.user.id,
        notification_id: normalizedId,
        read_at: new Date().toISOString(),
      },
      { onConflict: "user_id,notification_id" },
    );

  if (error) {
    throw new Error(`Could not save notification status to Supabase. Run supabase/notification-reads-permissions.sql, then try again. Original error: ${error.message}`);
  }
}
