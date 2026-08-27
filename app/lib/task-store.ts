import { promises as fs } from "fs";
import path from "path";
import { Task, TaskStatus, tasks as seedTasks } from "../data";

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

export async function readTasks() {
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

export async function readTask(id: string) {
  const currentTasks = await readTasks();
  return currentTasks.find((task) => task.id === id);
}

export async function createTask(input: Partial<TaskInput>) {
  const normalized = normalizeTaskInput(input);

  if (!normalized.title || !normalized.subject || !normalized.teacher || !normalized.deadline) {
    throw new Error("Task title, subject, teacher, and deadline are required.");
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

export async function updateTaskStatus(id: string, status: TaskStatus) {
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

export async function updateTask(id: string, input: Partial<TaskInput> & { status?: TaskStatus }) {
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

export async function deleteTask(id: string) {
  const currentTasks = await readTasks();
  const nextTasks = currentTasks.filter((task) => task.id !== id);

  if (nextTasks.length === currentTasks.length) {
    throw new Error("Task not found.");
  }

  await fs.writeFile(storePath, JSON.stringify(nextTasks, null, 2));
}
