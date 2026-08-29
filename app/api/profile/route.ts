import { NextResponse } from "next/server";
import { responseStatus } from "../../lib/auth-error";
import { updateProfile } from "../../lib/stores/profile-store";
import { getAuthContext } from "../../lib/supabase/auth";

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const fullName = String(formData.get("fullName") ?? "");
    const nickname = String(formData.get("nickname") ?? "");
    const email = String(formData.get("email") ?? "");
    const studentId = String(formData.get("studentId") ?? "");
    const phone = String(formData.get("phone") ?? "");
    const avatarValue = formData.get("avatar");
    const avatar = avatarValue instanceof File ? avatarValue : null;
    const auth = await getAuthContext();

    const profile = await updateProfile({ fullName, nickname, email, studentId, phone, avatar }, auth);

    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not update profile." },
      { status: responseStatus(error, 400) },
    );
  }
}
