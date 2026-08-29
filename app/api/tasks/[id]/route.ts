import { NextResponse } from "next/server";
import { responseStatus } from "../../../lib/auth-error";
import { deleteTask, readTask, updateTask } from "../../../lib/stores/task-store";
import { TaskStatus } from "../../../data";
import { getAuthContext } from "../../../lib/supabase/auth";

type Params = {
  params: Promise<{ id: string }>;
};

function isTaskStatus(value: unknown): value is TaskStatus {
  return value === "Pending" || value === "In progress" || value === "Completed";
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const auth = await getAuthContext();
    const task = await readTask(id, auth);

    if (!task) {
      return NextResponse.json({ message: "Task not found." }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not read task." },
      { status: responseStatus(error, 404) },
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json()) as { status?: unknown };

  if (body.status !== undefined && !isTaskStatus(body.status)) {
    return NextResponse.json({ message: "Valid status is required." }, { status: 400 });
  }

  try {
    const auth = await getAuthContext();
    const task = await updateTask(id, body as Parameters<typeof updateTask>[1], auth);
    return NextResponse.json({ task });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not update task." },
      { status: responseStatus(error, 404) },
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const auth = await getAuthContext();
    await deleteTask(id, auth);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not delete task." },
      { status: responseStatus(error, 404) },
    );
  }
}
