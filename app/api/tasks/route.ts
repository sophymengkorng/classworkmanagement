import { NextResponse } from "next/server";
import { responseStatus } from "../../lib/auth-error";
import { getAuthContext } from "../../lib/supabase/auth";
import { createTask, readTasks } from "../../lib/stores/task-store";

export async function GET() {
  try {
    const auth = await getAuthContext();
    const tasks = await readTasks(auth);
    return NextResponse.json({ tasks });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not read tasks." },
      { status: responseStatus(error, 400) },
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext();
    const task = await createTask(await request.json(), auth);
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not create task." },
      { status: responseStatus(error, 400) },
    );
  }
}
