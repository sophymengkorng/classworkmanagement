import { NextResponse } from "next/server";
import { responseStatus } from "../../../lib/auth-error";
import { markNotificationRead } from "../../../lib/stores/notification-store";
import { getAuthContext } from "../../../lib/supabase/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { notificationId?: unknown };
    const notificationId = typeof body.notificationId === "string" ? body.notificationId : "";
    const auth = await getAuthContext();

    await markNotificationRead(notificationId, auth);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not mark notification as read." },
      { status: responseStatus(error, 400) },
    );
  }
}
