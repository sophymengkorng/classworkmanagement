import { NextResponse } from "next/server";
import { deleteTask, readTask, updateTask } from "../../../lib/task-store";
import { TaskStatus } from "../../../data";

type Params = {
  params: Promise<{ id: string }>;
};

function isTaskStatus(value: unknown): value is TaskStatus {
  return value === "Pending" || value === "In progress" || value === "Completed";
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const task = await readTask(id);

  if (!task) {
    return NextResponse.json({ message: "Task not found." }, { status: 404 });
  }

  return NextResponse.json({ task });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json()) as { status?: unknown };

  if (body.status !== undefined && !isTaskStatus(body.status)) {
    return NextResponse.json({ message: "Valid status is required." }, { status: 400 });
  }

  try {
    const task = await updateTask(id, body as Parameters<typeof updateTask>[1]);
    return NextResponse.json({ task });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not update task." },
      { status: 404 },
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  try {
    await deleteTask(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not delete task." },
      { status: 404 },
    );
  }
}
