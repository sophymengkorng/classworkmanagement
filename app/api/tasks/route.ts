import { NextResponse } from "next/server";
import { responseStatus } from "../../lib/auth-error";
import { createTask, readTasks } from "../../lib/task-store";

export async function GET() {
  try {
    const tasks = await readTasks();
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
    const task = await createTask(await request.json());
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not create task." },
      { status: responseStatus(error, 400) },
    );
  }
}
