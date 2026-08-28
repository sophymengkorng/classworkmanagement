"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { courseCatalog, dueLabel, formattedDate, Task } from "../data";
import { ConfirmationDialog } from "./confirmation-dialog";

type EditableTask = Pick<Task, "title" | "subject" | "teacher" | "deadline" | "description" | "priority" | "status">;
type DraftTask = Pick<Task, "title" | "subject" | "teacher" | "deadline" | "description" | "priority">;
type PendingAction = { type: "create" } | { type: "save"; taskId: string } | { type: "delete"; taskId: string } | null;

const defaultCreateDraft: DraftTask = {
  title: "",
  subject: "NET II",
  teacher: "OUDOM",
  deadline: "2026-09-01",
  description: "",
  priority: "Medium",
};

function statusClass(status: string) {
  if (status === "Completed") return "bg-emerald-100 text-emerald-700";
  if (status === "In progress") return "bg-sky-100 text-sky-700";
  return "bg-rose-100 text-rose-700";
}

function taskToEditable(task: Task): EditableTask {
  return {
    title: task.title,
    subject: task.subject,
    teacher: task.teacher,
    deadline: task.deadline,
    description: task.description,
    priority: task.priority,
    status: task.status,
  };
}

export function TasksManager({ initialTasks }: { initialTasks: Task[] }) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [createDraft, setCreateDraft] = useState<DraftTask>(defaultCreateDraft);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditableTask | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [message, setMessage] = useState("");

  function startEdit(task: Task) {
    setEditingId(task.id);
    setDraft(taskToEditable(task));
    setMessage("");
  }

  function updateCreateSubject(subject: string) {
    const course = courseCatalog.find((item) => item.code === subject);
    setCreateDraft((current) => ({
      ...current,
      subject,
      teacher: course?.lecturer ?? current.teacher,
    }));
  }

  function updateSubject(subject: string) {
    const course = courseCatalog.find((item) => item.code === subject);
    setDraft((current) =>
      current
        ? {
            ...current,
            subject,
            teacher: course?.lecturer ?? current.teacher,
          }
        : current,
    );
  }

  function requestCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!createDraft.title.trim()) {
      setMessage("Please enter a task name before creating it.");
      return;
    }
    setMessage("");
    setPendingAction({ type: "create" });
  }

  async function createTask() {
    setCreating(true);
    setMessage("");

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createDraft),
      });
      const result = (await response.json()) as { task?: Task; message?: string };

      if (!response.ok || !result.task) {
        throw new Error(result.message ?? "Could not create task.");
      }

      setTasks((current) => [result.task as Task, ...current]);
      setCreateDraft((current) => ({ ...defaultCreateDraft, subject: current.subject, teacher: current.teacher }));
      setMessage("Task created and saved to Supabase database.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create task.");
    } finally {
      setCreating(false);
    }
  }

  function requestSaveEdit(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    if (!draft) return;
    setPendingAction({ type: "save", taskId: id });
  }

  async function saveEdit(id: string) {
    if (!draft) return;
    setSavingId(id);
    setMessage("");

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const result = (await response.json()) as { task?: Task; message?: string };

      if (!response.ok || !result.task) {
        throw new Error(result.message ?? "Could not update task.");
      }

      setTasks((current) => current.map((task) => (task.id === id ? (result.task as Task) : task)));
      setEditingId(null);
      setDraft(null);
      setMessage("Task updated and saved to server.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update task.");
    } finally {
      setSavingId(null);
    }
  }

  async function removeTask(id: string) {
    setSavingId(id);
    setMessage("");

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? "Could not delete task.");
      }

      setTasks((current) => current.filter((task) => task.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setDraft(null);
      }
      setMessage("Task deleted from server.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete task.");
    } finally {
      setSavingId(null);
    }
  }

  function confirmTitle() {
    if (pendingAction?.type === "create") return "Create this task?";
    if (pendingAction?.type === "save") return "Save task changes?";
    if (pendingAction?.type === "delete") return "Delete this task?";
    return "";
  }

  function confirmMessage() {
    if (pendingAction?.type === "create") return "Please confirm before saving this new task to the server.";
    if (pendingAction?.type === "save") return "Please confirm before updating this task on the server.";
    if (pendingAction?.type === "delete") return "This task will be removed from the server.";
    return "";
  }

  async function confirmAction() {
    const action = pendingAction;
    setPendingAction(null);

    if (action?.type === "create") await createTask();
    if (action?.type === "save") await saveEdit(action.taskId);
    if (action?.type === "delete") await removeTask(action.taskId);
  }

  return (
    <section>
      <form onSubmit={requestCreateTask} className="mb-4 rounded-lg border border-black/10 bg-white p-4 shadow-sm sm:mb-5 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-teal-700">Create Task</p>
            <h3 className="mt-1 text-xl font-bold">Add a new assignment</h3>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-6">
          <input
            className="h-11 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm outline-none ring-teal-200 focus:ring-2 lg:col-span-2"
            placeholder="Task name"
            value={createDraft.title}
            onChange={(event) => setCreateDraft((current) => ({ ...current, title: event.target.value }))}
          />
          <select
            className="h-11 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm font-semibold outline-none ring-teal-200 focus:ring-2"
            value={createDraft.subject}
            aria-label="Subject"
            onChange={(event) => updateCreateSubject(event.target.value)}
          >
            {courseCatalog.map((course) => (
              <option key={course.code}>{course.code}</option>
            ))}
          </select>
          <input
            className="h-11 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm outline-none ring-teal-200 focus:ring-2"
            type="date"
            value={createDraft.deadline}
            aria-label="Deadline"
            onChange={(event) => setCreateDraft((current) => ({ ...current, deadline: event.target.value }))}
          />
          <select
            className="h-11 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm font-semibold outline-none ring-teal-200 focus:ring-2"
            value={createDraft.priority}
            aria-label="Priority"
            onChange={(event) => setCreateDraft((current) => ({ ...current, priority: event.target.value as Task["priority"] }))}
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <button
            className="h-11 w-full rounded-md bg-[#24312f] px-4 text-sm font-bold text-white transition hover:bg-[#314540] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={creating}
          >
            {creating ? "Creating" : "Create"}
          </button>
          <textarea
            className="min-h-24 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 py-2 text-sm outline-none ring-teal-200 focus:ring-2 lg:col-span-6"
            placeholder="Description"
            value={createDraft.description}
            onChange={(event) => setCreateDraft((current) => ({ ...current, description: event.target.value }))}
          />
        </div>
      </form>

      {message && <p className="mb-4 rounded-lg border border-black/10 bg-white p-3 text-sm font-semibold text-[#4d5a56]">{message}</p>}

      {tasks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-black/15 bg-white p-5 text-center shadow-sm">
          <p className="font-bold text-[#24312f]">No tasks yet</p>
          <p className="mt-1 text-sm leading-6 text-[#68736f]">
            Create your first assignment above. It will save to Supabase and appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => (
          <article key={task.id} className="rounded-lg border border-black/10 bg-white p-4 shadow-sm sm:p-5">
            {editingId === task.id && draft ? (
              <form onSubmit={(event) => requestSaveEdit(event, task.id)} className="space-y-3">
                <input
                  className="h-11 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm outline-none ring-teal-200 focus:ring-2"
                  value={draft.title}
                  aria-label="Task title"
                  onChange={(event) => setDraft((current) => (current ? { ...current, title: event.target.value } : current))}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    className="h-11 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm font-semibold outline-none ring-teal-200 focus:ring-2"
                    value={draft.subject}
                    aria-label="Subject"
                    onChange={(event) => updateSubject(event.target.value)}
                  >
                    {courseCatalog.map((course) => (
                      <option key={course.code}>{course.code}</option>
                    ))}
                  </select>
                  <input
                    className="h-11 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm outline-none ring-teal-200 focus:ring-2"
                    value={draft.teacher}
                    aria-label="Teacher"
                    onChange={(event) => setDraft((current) => (current ? { ...current, teacher: event.target.value } : current))}
                  />
                  <input
                    className="h-11 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm outline-none ring-teal-200 focus:ring-2"
                    type="date"
                    value={draft.deadline}
                    aria-label="Deadline"
                    onChange={(event) => setDraft((current) => (current ? { ...current, deadline: event.target.value } : current))}
                  />
                  <select
                    className="h-11 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm font-semibold outline-none ring-teal-200 focus:ring-2"
                    value={draft.status}
                    aria-label="Status"
                    onChange={(event) => setDraft((current) => (current ? { ...current, status: event.target.value as Task["status"] } : current))}
                  >
                    <option>Pending</option>
                    <option>In progress</option>
                    <option>Completed</option>
                  </select>
                </div>
                <select
                  className="h-11 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm font-semibold outline-none ring-teal-200 focus:ring-2"
                  value={draft.priority}
                  aria-label="Priority"
                  onChange={(event) => setDraft((current) => (current ? { ...current, priority: event.target.value as Task["priority"] } : current))}
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
                <textarea
                  className="min-h-24 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 py-2 text-sm outline-none ring-teal-200 focus:ring-2"
                  value={draft.description}
                  aria-label="Description"
                  onChange={(event) => setDraft((current) => (current ? { ...current, description: event.target.value } : current))}
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    className="h-10 rounded-md bg-[#24312f] px-3 text-sm font-bold text-white transition hover:bg-[#314540] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={savingId === task.id}
                  >
                    {savingId === task.id ? "Saving" : "Save"}
                  </button>
                  <button
                    type="button"
                    className="h-10 rounded-md border border-black/10 px-3 text-sm font-bold hover:bg-[#f8faf7]"
                    onClick={() => {
                      setEditingId(null);
                      setDraft(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-teal-700">{task.subject}</p>
                    <h3 className="mt-1 break-words text-lg font-bold sm:text-xl">{task.title}</h3>
                  </div>
                  <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(task.status)}`}>{task.status}</span>
                </div>
                <p className="mt-4 text-sm font-semibold text-[#68736f]">Due: {formattedDate(task.deadline)}</p>
                <p className="mt-1 text-sm font-bold text-[#24312f]">{dueLabel(task.deadline)}</p>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#68736f]">{task.description}</p>
                <div className="mt-5 grid gap-2 md:grid-cols-3">
                  <Link
                    href={`/tasks/${task.id}`}
                    className="flex h-10 items-center justify-center rounded-md bg-[#24312f] px-3 text-sm font-bold text-white transition hover:bg-[#314540]"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    className="h-10 rounded-md border border-black/10 px-3 text-sm font-bold hover:bg-[#f8faf7]"
                    onClick={() => startEdit(task)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="h-10 rounded-md border border-rose-200 bg-rose-50 px-3 text-sm font-bold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={savingId === task.id}
                    onClick={() => setPendingAction({ type: "delete", taskId: task.id })}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </article>
          ))}
        </div>
      )}
      <ConfirmationDialog
        open={pendingAction !== null}
        title={confirmTitle()}
        message={confirmMessage()}
        confirmLabel={pendingAction?.type === "delete" ? "Delete" : "Confirm"}
        tone={pendingAction?.type === "delete" ? "danger" : "default"}
        busy={creating || Boolean(savingId)}
        onCancel={() => setPendingAction(null)}
        onConfirm={() => {
          void confirmAction();
        }}
      />
    </section>
  );
}
