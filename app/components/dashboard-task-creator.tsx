"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { courseCatalog, formattedDate, tasks, Task } from "../data";

type DraftTask = {
  title: string;
  subject: string;
  teacher: string;
  deadline: string;
  description: string;
  priority: Task["priority"];
};

const defaultDraft: DraftTask = {
  title: "",
  subject: "NET II",
  teacher: "OUDOM",
  deadline: "2026-09-01",
  description: "",
  priority: "Medium",
};

export function DashboardTaskCreator() {
  const [draft, setDraft] = useState<DraftTask>(defaultDraft);
  const [createdTasks, setCreatedTasks] = useState<Task[]>([]);

  const visibleTasks = useMemo(() => [...createdTasks, ...tasks.slice(0, 3)], [createdTasks]);

  function updateSubject(subject: string) {
    const course = courseCatalog.find((item) => item.code === subject);
    setDraft((current) => ({
      ...current,
      subject,
      teacher: course?.lecturer ?? current.teacher,
    }));
  }

  function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim()) return;

    const nextTask: Task = {
      id: `new-${Date.now()}`,
      title: draft.title.trim(),
      subject: draft.subject,
      teacher: draft.teacher,
      deadline: draft.deadline,
      description: draft.description.trim() || "No description added yet.",
      status: "Pending",
      priority: draft.priority,
    };

    setCreatedTasks((current) => [nextTask, ...current]);
    setDraft((current) => ({ ...defaultDraft, subject: current.subject, teacher: current.teacher }));
  }

  return (
    <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-teal-700">Create Task</p>
          <h3 className="mt-1 text-xl font-bold">Add homework from dashboard</h3>
        </div>
        <span className="w-fit rounded-full bg-[#fff9eb] px-3 py-1.5 text-sm font-bold text-[#8a6500]">
          {createdTasks.length} new
        </span>
      </div>

      <form onSubmit={createTask} className="mt-5 grid gap-3 rounded-lg bg-[#f8faf7] p-4 lg:grid-cols-6">
        <input
          className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none ring-teal-200 focus:ring-2 lg:col-span-2"
          placeholder="Task name"
          value={draft.title}
          onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
        />

        <select
          className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm font-semibold outline-none ring-teal-200 focus:ring-2"
          value={draft.subject}
          aria-label="Subject"
          onChange={(event) => updateSubject(event.target.value)}
        >
          {courseCatalog.map((course) => (
            <option key={course.code}>{course.code}</option>
          ))}
        </select>

        <input
          className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none ring-teal-200 focus:ring-2"
          type="date"
          value={draft.deadline}
          aria-label="Deadline"
          onChange={(event) => setDraft((current) => ({ ...current, deadline: event.target.value }))}
        />

        <select
          className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm font-semibold outline-none ring-teal-200 focus:ring-2"
          value={draft.priority}
          aria-label="Priority"
          onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value as Task["priority"] }))}
        >
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <button className="h-11 rounded-md bg-[#24312f] px-4 text-sm font-bold text-white transition hover:bg-[#314540]">
          Create
        </button>

        <textarea
          className="min-h-24 rounded-md border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-teal-200 focus:ring-2 lg:col-span-6"
          placeholder="Description"
          value={draft.description}
          onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
        />
      </form>

      <div className="mt-5 space-y-3">
        {visibleTasks.map((task) => (
          <div key={task.id} className="grid gap-3 rounded-lg border border-black/8 p-4 md:grid-cols-[1fr_auto] md:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold">{task.title}</p>
                <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">{task.status}</span>
                <span className="rounded-full bg-[#e8eef8] px-2.5 py-1 text-xs font-bold text-[#285178]">{task.subject}</span>
              </div>
              <p className="mt-1 text-sm text-[#68736f]">
                Lecturer: {task.teacher} - Due: {formattedDate(task.deadline)}
              </p>
            </div>
            {task.id.startsWith("new-") ? (
              <span className="text-sm font-bold text-[#68736f]">Saved for this session</span>
            ) : (
              <Link
                href={`/tasks/${task.id}`}
                className="flex h-10 items-center justify-center rounded-md border border-black/10 px-3 text-sm font-bold hover:bg-[#f8faf7]"
              >
                View Task
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
