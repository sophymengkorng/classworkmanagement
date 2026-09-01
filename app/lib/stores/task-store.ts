import { currentDateString, Task, TaskStatus } from "../../data";
import { AuthRequiredError } from "../auth-error";
import { AuthContext, getAuthContext } from "../supabase/auth";

export type TaskInput = {
  title: string;
  subject: string;
  teacher: string;
  deadline: string;
  description: string;
  priority: Task["priority"];
};

type SupabaseTaskRow = {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  deadline: string;
  description: string | null;
  status: TaskStatus;
  priority: Task["priority"];
};

const taskFields = "id,title,subject,teacher,deadline,description,status,priority";

function rowToTask(row: SupabaseTaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    teacher: row.teacher,
    deadline: row.deadline,
    description: row.description ?? "No description added yet.",
    status: row.status,
    priority: row.priority,
  };
}

function normalizeTaskInput(input: Partial<TaskInput>): TaskInput {
  return {
    title: input.title?.trim() ?? "",
    subject: input.subject?.trim() ?? "",
    teacher: input.teacher?.trim() ?? "",
    deadline: input.deadline?.trim() ?? "",
    description: input.description?.trim() || "No description added yet.",
    priority: input.priority === "High" || input.priority === "Low" ? input.priority : "Medium",
  };
}

function ensureCurrentOrUpcomingDeadline(deadline: string) {
  if (deadline < currentDateString()) {
    throw new Error("Deadline must be today or an upcoming date.");
  }
}

function tomorrowDate() {
  const tomorrow = new Date(`${currentDateString()}T00:00:00`);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

function todayDate() {
  return currentDateString();
}

async function requireTaskAuth(authContext?: AuthContext | null) {
  const auth = authContext ?? await getAuthContext();
  if (!auth) throw new AuthRequiredError();
  return auth;
}

export async function readDashboardTasks(authContext?: AuthContext | null) {
  const auth = await requireTaskAuth(authContext);
  const today = todayDate();
  const tomorrow = tomorrowDate();
  const [recentTasksResult, pendingResult, dueTomorrowResult, notificationTasksResult] = await Promise.all([
    auth.supabase
      .from("tasks")
      .select(taskFields)
      .eq("user_id", auth.user.id)
      .neq("status", "Completed")
      .gte("deadline", today)
      .order("deadline", { ascending: true })
      .limit(3),
    auth.supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", auth.user.id)
      .neq("status", "Completed")
      .gte("deadline", today),
    auth.supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", auth.user.id)
      .neq("status", "Completed")
      .eq("deadline", tomorrow),
    auth.supabase
      .from("tasks")
      .select(taskFields)
      .eq("user_id", auth.user.id)
      .neq("status", "Completed")
      .eq("deadline", tomorrow)
      .order("deadline", { ascending: true })
      .limit(10),
  ]);

  if (recentTasksResult.error) {
    throw new Error(`Could not read recent tasks from Supabase: ${recentTasksResult.error.message}`);
  }

  if (pendingResult.error) {
    throw new Error(`Could not count pending tasks from Supabase: ${pendingResult.error.message}`);
  }

  if (dueTomorrowResult.error) {
    throw new Error(`Could not count due-tomorrow tasks from Supabase: ${dueTomorrowResult.error.message}`);
  }

  if (notificationTasksResult.error) {
    throw new Error(`Could not read notification tasks from Supabase: ${notificationTasksResult.error.message}`);
  }

  return {
    recentTasks: (recentTasksResult.data ?? []).map((row) => rowToTask(row as SupabaseTaskRow)),
    notificationTasks: (notificationTasksResult.data ?? []).map((row) => rowToTask(row as SupabaseTaskRow)),
    pendingCount: pendingResult.count ?? 0,
    dueTomorrowCount: dueTomorrowResult.count ?? 0,
  };
}

export async function readTasks(authContext?: AuthContext | null) {
  const auth = await requireTaskAuth(authContext);
  const { data, error } = await auth.supabase
    .from("tasks")
    .select(taskFields)
    .eq("user_id", auth.user.id)
    .gte("deadline", todayDate())
    .order("deadline", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Could not read tasks from Supabase: ${error.message}`);
  }

  return (data ?? []).map((row) => rowToTask(row as SupabaseTaskRow));
}

export async function readTask(id: string, authContext?: AuthContext | null) {
  const auth = await requireTaskAuth(authContext);
  const { data, error } = await auth.supabase
    .from("tasks")
    .select(taskFields)
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not read task from Supabase: ${error.message}`);
  }

  return data ? rowToTask(data as SupabaseTaskRow) : undefined;
}

export async function createTask(input: Partial<TaskInput>, authContext?: AuthContext | null) {
  const normalized = normalizeTaskInput(input);

  if (!normalized.title || !normalized.subject || !normalized.teacher || !normalized.deadline) {
    throw new Error("Task title, subject, teacher, and deadline are required.");
  }

  ensureCurrentOrUpcomingDeadline(normalized.deadline);

  const auth = await requireTaskAuth(authContext);
  const { data, error } = await auth.supabase
    .from("tasks")
    .insert({
      user_id: auth.user.id,
      title: normalized.title,
      subject: normalized.subject,
      teacher: normalized.teacher,
      deadline: normalized.deadline,
      description: normalized.description,
      status: "Pending",
      priority: normalized.priority,
    })
    .select(taskFields)
    .single();

  if (error) {
    throw new Error(`Could not save task to Supabase: ${error.message}`);
  }

  return rowToTask(data as SupabaseTaskRow);
}

export async function updateTaskStatus(id: string, status: TaskStatus, authContext?: AuthContext | null) {
  const auth = await requireTaskAuth(authContext);
  const { data, error } = await auth.supabase
    .from("tasks")
    .update({ status })
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .select(taskFields)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not update task in Supabase: ${error.message}`);
  }

  if (!data) {
    throw new Error("Task not found.");
  }

  return rowToTask(data as SupabaseTaskRow);
}

export async function updateTask(id: string, input: Partial<TaskInput> & { status?: TaskStatus }, authContext?: AuthContext | null) {
  const auth = await requireTaskAuth(authContext);
  const existingTask = await readTask(id, auth);

  if (!existingTask) {
    throw new Error("Task not found.");
  }

  const normalized = normalizeTaskInput({
    title: input.title ?? existingTask.title,
    subject: input.subject ?? existingTask.subject,
    teacher: input.teacher ?? existingTask.teacher,
    deadline: input.deadline ?? existingTask.deadline,
    description: input.description ?? existingTask.description,
    priority: input.priority ?? existingTask.priority,
  });

  if (!normalized.title || !normalized.subject || !normalized.teacher || !normalized.deadline) {
    throw new Error("Task title, subject, teacher, and deadline are required.");
  }

  ensureCurrentOrUpcomingDeadline(normalized.deadline);

  const { data, error } = await auth.supabase
    .from("tasks")
    .update({
      ...normalized,
      status: input.status ?? existingTask.status,
    })
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .select(taskFields)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not update task in Supabase: ${error.message}`);
  }

  if (!data) {
    throw new Error("Task not found.");
  }

  return rowToTask(data as SupabaseTaskRow);
}

export async function deleteTask(id: string, authContext?: AuthContext | null) {
  const auth = await requireTaskAuth(authContext);
  const { data, error } = await auth.supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .select("id");

  if (error) {
    throw new Error(`Could not delete task from Supabase: ${error.message}`);
  }

  if (!data?.length) {
    throw new Error("Task not found.");
  }
}
