import { promises as fs } from "fs";
import path from "path";
import { Task, TaskStatus, tasks as seedTasks, today } from "../data";
import { AuthContext, getAuthContext } from "./supabase/auth";

export type TaskInput = {
  title: string;
  subject: string;
  teacher: string;
  deadline: string;
  description: string;
  priority: Task["priority"];
};

const storeDirectory = path.join(process.cwd(), "data");
const storePath = path.join(storeDirectory, "tasks.json");

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

async function ensureStore() {
  await fs.mkdir(storeDirectory, { recursive: true });

  try {
    await fs.access(storePath);
  } catch {
    await fs.writeFile(storePath, JSON.stringify(seedTasks, null, 2));
  }
}

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== "object") return false;
  const task = value as Partial<Task>;
  return Boolean(task.id && task.title && task.subject && task.teacher && task.deadline && task.status);
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

function tomorrowDate() {
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return tomorrow.toISOString().slice(0, 10);
}

export async function readDashboardTasks(authContext?: AuthContext | null) {
  const auth = authContext ?? await getAuthContext();

  if (auth) {
    const fields = "id,title,subject,teacher,deadline,description,status,priority";
    const tomorrow = tomorrowDate();
    const [recentTasksResult, pendingResult, dueTomorrowResult, notificationTasksResult] = await Promise.all([
      auth.supabase
        .from("tasks")
        .select(fields)
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false })
        .limit(3),
      auth.supabase
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .eq("user_id", auth.user.id)
        .neq("status", "Completed"),
      auth.supabase
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .eq("user_id", auth.user.id)
        .neq("status", "Completed")
        .eq("deadline", tomorrow),
      auth.supabase
        .from("tasks")
        .select(fields)
        .eq("user_id", auth.user.id)
        .neq("status", "Completed")
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

  const currentTasks = await readTasks(auth);
  const pendingTasks = currentTasks.filter((task) => task.status !== "Completed");

  return {
    recentTasks: currentTasks.slice(0, 3),
    notificationTasks: pendingTasks.slice(0, 10),
    pendingCount: pendingTasks.length,
    dueTomorrowCount: pendingTasks.filter((task) => task.deadline === tomorrowDate()).length,
  };
}

export async function readTasks(authContext?: AuthContext | null) {
  const auth = authContext ?? await getAuthContext();

  if (auth) {
    const { data, error } = await auth.supabase
      .from("tasks")
      .select("id,title,subject,teacher,deadline,description,status,priority")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Could not read tasks from Supabase: ${error.message}`);
    }

    return (data ?? []).map((row) => rowToTask(row as SupabaseTaskRow));
  }

  await ensureStore();

  try {
    const content = await fs.readFile(storePath, "utf8");
    const parsed = JSON.parse(content) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter(isTask);
    }
  } catch {
    await fs.writeFile(storePath, JSON.stringify(seedTasks, null, 2));
  }

  return seedTasks;
}

export async function readTask(id: string, authContext?: AuthContext | null) {
  const auth = authContext ?? await getAuthContext();

  if (auth) {
    const { data, error } = await auth.supabase
      .from("tasks")
      .select("id,title,subject,teacher,deadline,description,status,priority")
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .maybeSingle();

    if (error) {
      throw new Error(`Could not read task from Supabase: ${error.message}`);
    }

    return data ? rowToTask(data as SupabaseTaskRow) : undefined;
  }

  const currentTasks = await readTasks();
  return currentTasks.find((task) => task.id === id);
}

export async function createTask(input: Partial<TaskInput>, authContext?: AuthContext | null) {
  const normalized = normalizeTaskInput(input);

  if (!normalized.title || !normalized.subject || !normalized.teacher || !normalized.deadline) {
    throw new Error("Task title, subject, teacher, and deadline are required.");
  }

  const auth = authContext ?? await getAuthContext();

  if (auth) {
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
      .select("id,title,subject,teacher,deadline,description,status,priority")
      .single();

    if (error) {
      throw new Error(`Could not save task to Supabase: ${error.message}`);
    }

    return rowToTask(data as SupabaseTaskRow);
  }

  const currentTasks = await readTasks();
  const task: Task = {
    id: Date.now().toString(),
    title: normalized.title,
    subject: normalized.subject,
    teacher: normalized.teacher,
    deadline: normalized.deadline,
    description: normalized.description,
    status: "Pending",
    priority: normalized.priority,
  };

  await fs.writeFile(storePath, JSON.stringify([task, ...currentTasks], null, 2));
  return task;
}

export async function updateTaskStatus(id: string, status: TaskStatus, authContext?: AuthContext | null) {
  const auth = authContext ?? await getAuthContext();

  if (auth) {
    const { data, error } = await auth.supabase
      .from("tasks")
      .update({ status })
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .select("id,title,subject,teacher,deadline,description,status,priority")
      .maybeSingle();

    if (error) {
      throw new Error(`Could not update task in Supabase: ${error.message}`);
    }

    if (!data) {
      throw new Error("Task not found.");
    }

    return rowToTask(data as SupabaseTaskRow);
  }

  const currentTasks = await readTasks();
  let updatedTask: Task | undefined;

  const nextTasks = currentTasks.map((task) => {
    if (task.id !== id) return task;
    updatedTask = { ...task, status };
    return updatedTask;
  });

  if (!updatedTask) {
    throw new Error("Task not found.");
  }

  await fs.writeFile(storePath, JSON.stringify(nextTasks, null, 2));
  return updatedTask;
}

export async function updateTask(id: string, input: Partial<TaskInput> & { status?: TaskStatus }, authContext?: AuthContext | null) {
  const auth = authContext ?? await getAuthContext();

  if (auth) {
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

    const { data, error } = await auth.supabase
      .from("tasks")
      .update({
        ...normalized,
        status: input.status ?? existingTask.status,
      })
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .select("id,title,subject,teacher,deadline,description,status,priority")
      .maybeSingle();

    if (error) {
      throw new Error(`Could not update task in Supabase: ${error.message}`);
    }

    if (!data) {
      throw new Error("Task not found.");
    }

    return rowToTask(data as SupabaseTaskRow);
  }

  const currentTasks = await readTasks();
  let updatedTask: Task | undefined;

  const nextTasks = currentTasks.map((task) => {
    if (task.id !== id) return task;

    const normalized = normalizeTaskInput({
      title: input.title ?? task.title,
      subject: input.subject ?? task.subject,
      teacher: input.teacher ?? task.teacher,
      deadline: input.deadline ?? task.deadline,
      description: input.description ?? task.description,
      priority: input.priority ?? task.priority,
    });

    if (!normalized.title || !normalized.subject || !normalized.teacher || !normalized.deadline) {
      throw new Error("Task title, subject, teacher, and deadline are required.");
    }

    updatedTask = {
      ...task,
      ...normalized,
      status: input.status ?? task.status,
    };
    return updatedTask;
  });

  if (!updatedTask) {
    throw new Error("Task not found.");
  }

  await fs.writeFile(storePath, JSON.stringify(nextTasks, null, 2));
  return updatedTask;
}

export async function deleteTask(id: string, authContext?: AuthContext | null) {
  const auth = authContext ?? await getAuthContext();

  if (auth) {
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

    return;
  }

  const currentTasks = await readTasks();
  const nextTasks = currentTasks.filter((task) => task.id !== id);

  if (nextTasks.length === currentTasks.length) {
    throw new Error("Task not found.");
  }

  await fs.writeFile(storePath, JSON.stringify(nextTasks, null, 2));
}
