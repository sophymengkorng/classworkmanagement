"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { courseCatalog, formattedDate, Task } from "../data";
import { ConfirmationDialog } from "./confirmation-dialog";

type DraftTask = {
  title: string;
  subject: string;
  teacher: string;
  deadline: string;
  description: string;
  priority: Task["priority"];
};

type EditableTask = DraftTask & {
  status: Task["status"];
};

type PendingAction =
  | { type: "create" }
  | { type: "save"; taskId: string }
  | { type: "delete"; taskId: string }
  | null;

const defaultDraft: DraftTask = {
  title: "",
  subject: "NET II",
  teacher: "OUDOM",
  deadline: "2026-09-01",
  description: "",
  priority: "Medium",
};

export function DashboardTaskCreator({ initialTasks }: { initialTasks: Task[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftTask>(defaultDraft);
  const [savedTasks, setSavedTasks] = useState<Task[]>(initialTasks);
  const [saving, setSaving] = useState(false);
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditableTask | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [message, setMessage] = useState("");

  const visibleTasks = useMemo(() => savedTasks.slice(0, 5), [savedTasks]);

  function updateSubject(subject: string) {
    const course = courseCatalog.find((item) => item.code === subject);
    setDraft((current) => ({
      ...current,
      subject,
      teacher: course?.lecturer ?? current.teacher,
    }));
  }

  function updateEditSubject(subject: string) {
    const course = courseCatalog.find((item) => item.code === subject);
    setEditDraft((current) =>
      current
        ? {
            ...current,
            subject,
            teacher: course?.lecturer ?? current.teacher,
          }
        : current,
    );
  }

  function startEdit(task: Task) {
    setEditingTaskId(task.id);
    setEditDraft({
      title: task.title,
      subject: task.subject,
      teacher: task.teacher,
      deadline: task.deadline,
      description: task.description,
      priority: task.priority,
      status: task.status,
    });
    setMessage("");
  }

  function requestCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim()) return;
    setPendingAction({ type: "create" });
  }

  async function createTask() {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const result = (await response.json()) as { task?: Task; message?: string };

      if (!response.ok || !result.task) {
        throw new Error(result.message ?? "Could not save task.");
      }

      setSavedTasks((current) => [result.task as Task, ...current]);
      setDraft((current) => ({ ...defaultDraft, subject: current.subject, teacher: current.teacher }));
      setMessage("Task saved to server.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save task.");
    } finally {
      setSaving(false);
    }
  }

  function requestSaveEdit(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    if (!editDraft) return;
    setPendingAction({ type: "save", taskId: id });
  }

  async function saveEdit(id: string) {
    if (!editDraft) return;
    setSavingTaskId(id);
    setMessage("");

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editDraft),
      });
      const result = (await response.json()) as { task?: Task; message?: string };

      if (!response.ok || !result.task) {
        throw new Error(result.message ?? "Could not update task.");
      }

      setSavedTasks((current) => current.map((task) => (task.id === id ? (result.task as Task) : task)));
      setEditingTaskId(null);
      setEditDraft(null);
      setMessage("Task updated and saved to server.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update task.");
    } finally {
      setSavingTaskId(null);
    }
  }

  async function deleteTask(id: string) {
    setSavingTaskId(id);
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

      setSavedTasks((current) => current.filter((task) => task.id !== id));
      if (editingTaskId === id) {
        setEditingTaskId(null);
        setEditDraft(null);
      }
      setMessage("Task deleted from server.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete task.");
    } finally {
      setSavingTaskId(null);
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
    if (action?.type === "delete") await deleteTask(action.taskId);
  }

  return (
    <section className="rounded-lg border border-black/10 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-teal-700">Create Task</p>
          <h3 className="mt-1 text-xl font-bold">Add homework from dashboard</h3>
        </div>
        <span className="w-fit rounded-full bg-[#fff9eb] px-3 py-1.5 text-sm font-bold text-[#8a6500]">
          Server saved
        </span>
      </div>

      <form onSubmit={requestCreateTask} className="mt-5 grid gap-3 rounded-lg bg-[#f8faf7] p-3 sm:p-4 lg:grid-cols-6">
        <input
          className="h-11 w-full rounded-md border border-black/10 bg-white px-3 text-sm outline-none ring-teal-200 focus:ring-2 lg:col-span-2"
          placeholder="Task name"
          value={draft.title}
          onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
        />

        <select
          className="h-11 w-full rounded-md border border-black/10 bg-white px-3 text-sm font-semibold outline-none ring-teal-200 focus:ring-2"
          value={draft.subject}
          aria-label="Subject"
          onChange={(event) => updateSubject(event.target.value)}
        >
          {courseCatalog.map((course) => (
            <option key={course.code}>{course.code}</option>
          ))}
        </select>

        <input
          className="h-11 w-full rounded-md border border-black/10 bg-white px-3 text-sm outline-none ring-teal-200 focus:ring-2"
          type="date"
          value={draft.deadline}
          aria-label="Deadline"
          onChange={(event) => setDraft((current) => ({ ...current, deadline: event.target.value }))}
        />

        <select
          className="h-11 w-full rounded-md border border-black/10 bg-white px-3 text-sm font-semibold outline-none ring-teal-200 focus:ring-2"
          value={draft.priority}
          aria-label="Priority"
          onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value as Task["priority"] }))}
        >
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <button
          className="h-11 w-full rounded-md bg-[#24312f] px-4 text-sm font-bold text-white transition hover:bg-[#314540] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={saving}
        >
          {saving ? "Saving" : "Create"}
        </button>

        <textarea
          className="min-h-24 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-teal-200 focus:ring-2 lg:col-span-6"
          placeholder="Description"
          value={draft.description}
          onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
        />
      </form>

      {message && <p className="mt-3 text-sm font-semibold text-[#4d5a56]">{message}</p>}

      <div className="mt-5 space-y-3">
        {visibleTasks.map((task) => (
          <div key={task.id} className="rounded-lg border border-black/8 p-3 sm:p-4">
            {editingTaskId === task.id && editDraft ? (
              <form onSubmit={(event) => requestSaveEdit(event, task.id)} className="space-y-3">
                <input
                  className="h-11 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm outline-none ring-teal-200 focus:ring-2"
                  value={editDraft.title}
                  aria-label="Task title"
                  onChange={(event) =>
                    setEditDraft((current) => (current ? { ...current, title: event.target.value } : current))
                  }
                />
                <div className="grid gap-3 md:grid-cols-4">
                  <select
                    className="h-11 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm font-semibold outline-none ring-teal-200 focus:ring-2"
                    value={editDraft.subject}
                    aria-label="Subject"
                    onChange={(event) => updateEditSubject(event.target.value)}
                  >
                    {courseCatalog.map((course) => (
                      <option key={course.code}>{course.code}</option>
                    ))}
                  </select>
                  <input
                    className="h-11 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm outline-none ring-teal-200 focus:ring-2"
                    value={editDraft.teacher}
                    aria-label="Teacher"
                    onChange={(event) =>
                      setEditDraft((current) => (current ? { ...current, teacher: event.target.value } : current))
                    }
                  />
                  <input
                    className="h-11 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm outline-none ring-teal-200 focus:ring-2"
                    type="date"
                    value={editDraft.deadline}
                    aria-label="Deadline"
                    onChange={(event) =>
                      setEditDraft((current) => (current ? { ...current, deadline: event.target.value } : current))
                    }
                  />
                  <select
                    className="h-11 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm font-semibold outline-none ring-teal-200 focus:ring-2"
                    value={editDraft.status}
                    aria-label="Status"
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, status: event.target.value as Task["status"] } : current,
                      )
                    }
                  >
                    <option>Pending</option>
                    <option>In progress</option>
                    <option>Completed</option>
                  </select>
                </div>
                <div className="grid gap-3 md:grid-cols-[1fr_180px]">
                  <textarea
                    className="min-h-20 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 py-2 text-sm outline-none ring-teal-200 focus:ring-2"
                    value={editDraft.description}
                    aria-label="Description"
                    onChange={(event) =>
                      setEditDraft((current) => (current ? { ...current, description: event.target.value } : current))
                    }
                  />
                  <select
                    className="h-11 w-full rounded-md border border-black/10 bg-[#fbfbf8] px-3 text-sm font-semibold outline-none ring-teal-200 focus:ring-2"
                    value={editDraft.priority}
                    aria-label="Priority"
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, priority: event.target.value as Task["priority"] } : current,
                      )
                    }
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    className="h-10 rounded-md bg-[#24312f] px-3 text-sm font-bold text-white transition hover:bg-[#314540] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={savingTaskId === task.id}
                  >
                    {savingTaskId === task.id ? "Saving" : "Save"}
                  </button>
                  <button
                    type="button"
                    className="h-10 rounded-md border border-black/10 px-3 text-sm font-bold hover:bg-[#f8faf7]"
                    onClick={() => {
                      setEditingTaskId(null);
                      setEditDraft(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="break-words font-bold">{task.title}</p>
                    <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">{task.status}</span>
                    <span className="rounded-full bg-[#e8eef8] px-2.5 py-1 text-xs font-bold text-[#285178]">{task.subject}</span>
                  </div>
                  <p className="mt-1 text-sm text-[#68736f]">
                    Lecturer: {task.teacher} - Due: {formattedDate(task.deadline)}
                  </p>
                </div>
                <div className="grid gap-2 md:grid-cols-3">
                  <Link
                    href={`/tasks/${task.id}`}
                    className="flex h-10 items-center justify-center rounded-md border border-black/10 px-3 text-sm font-bold hover:bg-[#f8faf7]"
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
                    disabled={savingTaskId === task.id}
                    onClick={() => setPendingAction({ type: "delete", taskId: task.id })}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <ConfirmationDialog
        open={pendingAction !== null}
        title={confirmTitle()}
        message={confirmMessage()}
        confirmLabel={pendingAction?.type === "delete" ? "Delete" : "Confirm"}
        tone={pendingAction?.type === "delete" ? "danger" : "default"}
        busy={saving || Boolean(savingTaskId)}
        onCancel={() => setPendingAction(null)}
        onConfirm={() => {
          void confirmAction();
        }}
      />
    </section>
  );
}
