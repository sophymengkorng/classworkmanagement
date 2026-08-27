import { NextResponse } from "next/server";
import { createTask, readTasks } from "../../lib/task-store";

export async function GET() {
  const tasks = await readTasks();
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  try {
    const task = await createTask(await request.json());
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not create task." },
      { status: 400 },
    );
  }
}
