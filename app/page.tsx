"use client";

import { FormEvent, useMemo, useState } from "react";

type Assignment = {
  id: number;
  subject: string;
  name: string;
  description: string;
  deadline: string;
  status: "Pending" | "In progress" | "Completed";
  priority: "High" | "Medium" | "Low";
};

type Channel = "Telegram" | "Gmail";

const weeklySchedule = [
  {
    day: "Monday",
    classes: [
      { time: "08:00 - 10:00", subject: "Database", room: "B-203" },
      { time: "10:00 - 12:00", subject: "Java", room: "Lab 4" },
      { time: "14:00 - 16:00", subject: "English", room: "A-105" },
    ],
  },
  {
    day: "Tuesday",
    classes: [
      { time: "08:00 - 10:00", subject: "Web Design", room: "C-302" },
      { time: "13:00 - 15:00", subject: "Networks", room: "B-101" },
    ],
  },
  {
    day: "Wednesday",
    classes: [
      { time: "09:00 - 11:00", subject: "Mathematics", room: "A-204" },
      { time: "14:00 - 16:00", subject: "Database Lab", room: "Lab 2" },
    ],
  },
  {
    day: "Thursday",
    classes: [
      { time: "08:00 - 10:00", subject: "Java", room: "Lab 4" },
      { time: "10:00 - 12:00", subject: "English", room: "A-105" },
      { time: "15:00 - 17:00", subject: "Web Design", room: "C-302" },
    ],
  },
  {
    day: "Friday",
    classes: [
      { time: "08:00 - 10:00", subject: "Database", room: "B-203" },
      { time: "13:00 - 15:00", subject: "Project Practice", room: "Lab 1" },
    ],
  },
];

const initialAssignments: Assignment[] = [
  {
    id: 1,
    subject: "Database",
    name: "Normalize library schema",
    description: "ERD, relational schema, and SQL constraints.",
    deadline: "2026-08-28",
    status: "Pending",
    priority: "High",
  },
  {
    id: 2,
    subject: "Java",
    name: "OOP mini project",
    description: "Create classes, inheritance, and file handling.",
    deadline: "2026-08-30",
    status: "In progress",
    priority: "Medium",
  },
  {
    id: 3,
    subject: "Web Design",
    name: "Responsive portfolio",
    description: "Build a mobile-friendly homepage with CSS grid.",
    deadline: "2026-09-02",
    status: "Pending",
    priority: "Medium",
  },
  {
    id: 4,
    subject: "English",
    name: "Presentation outline",
    description: "Prepare slides and speaking notes.",
    deadline: "2026-09-05",
    status: "Completed",
    priority: "Low",
  },
];

const documents = [
  { name: "Database Week 4 Notes.pdf", subject: "Database", type: "PDF", size: "2.4 MB" },
  { name: "Java OOP Exercise.docx", subject: "Java", type: "DOCX", size: "860 KB" },
  { name: "Web Design Assets.zip", subject: "Web Design", type: "ZIP", size: "12 MB" },
  { name: "English Vocabulary.xlsx", subject: "English", type: "XLSX", size: "430 KB" },
];

const automationSteps = [
  { name: "Website", detail: "Student portal and forms", status: "Ready" },
  { name: "Backend", detail: "Next.js API plan", status: "Planned" },
  { name: "Database", detail: "SQL tables for users, classes, tasks", status: "Planned" },
  { name: "Scheduler", detail: "Cron deadline checks", status: "Planned" },
  { name: "Notifications", detail: "Telegram and Gmail reminders", status: "Ready to connect" },
];

const navItems = ["Dashboard", "Schedule", "Assignments", "Documents", "Notifications", "Automation"];

function priorityClass(priority: Assignment["priority"]) {
  if (priority === "High") return "border-red-200 bg-red-50 text-red-700";
  if (priority === "Medium") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function statusClass(status: Assignment["status"]) {
  if (status === "Completed") return "bg-emerald-100 text-emerald-700";
  if (status === "In progress") return "bg-sky-100 text-sky-700";
  return "bg-rose-100 text-rose-700";
}

function daysUntil(deadline: string) {
  const today = new Date("2026-08-27T00:00:00");
  const due = new Date(`${deadline}T00:00:00`);
  return Math.ceil((due.getTime() - today.getTime()) / 86400000);
}

function deadlineLabel(deadline: string) {
  const days = daysUntil(deadline);
  if (days < 0) return "Overdue";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

export default function Home() {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [assignments, setAssignments] = useState(initialAssignments);
  const [channels, setChannels] = useState<Record<Channel, boolean>>({
    Telegram: true,
    Gmail: true,
  });
  const [form, setForm] = useState({
    subject: "Database",
    name: "",
    description: "",
    deadline: "2026-09-01",
    priority: "Medium" as Assignment["priority"],
  });

  const pendingAssignments = assignments.filter((assignment) => assignment.status !== "Completed");
  const dueTomorrow = assignments.filter(
    (assignment) => assignment.status !== "Completed" && daysUntil(assignment.deadline) === 1,
  );
  const completed = assignments.filter((assignment) => assignment.status === "Completed");
  const todaysClasses = weeklySchedule.find((item) => item.day === "Thursday")?.classes ?? [];

  const notifications = useMemo(
    () => [
      ...pendingAssignments
        .filter((assignment) => daysUntil(assignment.deadline) <= 3)
        .map((assignment) => ({
          title: `${assignment.subject} assignment ${deadlineLabel(assignment.deadline).toLowerCase()}`,
          detail: assignment.name,
          tone: daysUntil(assignment.deadline) <= 1 ? "Urgent" : "Soon",
        })),
      { title: "Java class starts in 30 minutes", detail: "Lab 4 at 08:00", tone: "Class" },
    ],
    [pendingAssignments],
  );

  function addAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) return;

    setAssignments((current) => [
      {
        id: Date.now(),
        subject: form.subject,
        name: form.name.trim(),
        description: form.description.trim() || "No description added.",
        deadline: form.deadline,
        status: "Pending",
        priority: form.priority,
      },
      ...current,
    ]);
    setForm((current) => ({ ...current, name: "", description: "" }));
    setActiveSection("Assignments");
  }

  function showSection(section: string) {
    setActiveSection(section);
    document.getElementById(section.toLowerCase())?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleComplete(id: number) {
    setAssignments((current) =>
      current.map((assignment) =>
        assignment.id === id
          ? {
              ...assignment,
              status: assignment.status === "Completed" ? "Pending" : "Completed",
            }
          : assignment,
      ),
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f4ee] text-[#1d2026]">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-black/10 bg-[#24312f] px-5 py-5 text-white lg:border-b-0 lg:border-r lg:border-white/10 lg:py-6">
          <div className="flex items-center justify-between gap-4 lg:block">
            <div>
              <p className="text-sm font-medium text-teal-100">Student Automation</p>
              <h1 className="mt-1 text-2xl font-semibold">ClassFlow</h1>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-lg font-bold text-[#24312f]">
              SA
            </div>
          </div>

          <form
            className="mt-6 rounded-lg border border-white/12 bg-white/8 p-4"
            aria-label="Login form"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Login</h2>
              <span className="rounded-full bg-emerald-300 px-2 py-1 text-xs font-bold text-emerald-950">Demo</span>
            </div>
            <label className="mt-4 block text-sm text-white/75" htmlFor="email">
              Username / Email
            </label>
            <input
              id="email"
              className="mt-2 h-11 w-full rounded-md border border-white/15 bg-white px-3 text-sm text-[#1d2026] outline-none ring-teal-200 transition focus:ring-2"
              defaultValue="sophy@student.edu"
              type="email"
            />
            <label className="mt-3 block text-sm text-white/75" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="mt-2 h-11 w-full rounded-md border border-white/15 bg-white px-3 text-sm text-[#1d2026] outline-none ring-teal-200 transition focus:ring-2"
              defaultValue="classwork"
              type="password"
            />
            <button className="mt-4 h-11 w-full rounded-md bg-[#f4c542] px-4 text-sm font-bold text-[#24312f] transition hover:bg-[#ffd95f]">
              Login
            </button>
          </form>

          <nav className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-1" aria-label="Main navigation">
            {navItems.map((item) => (
              <button
                key={item}
                type="button"
                className={`h-11 rounded-md px-3 text-left text-sm font-semibold transition ${
                  activeSection === item
                    ? "bg-white text-[#24312f]"
                    : "bg-white/5 text-white/78 hover:bg-white/12 hover:text-white"
                }`}
                onClick={() => showSection(item)}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <section className="overflow-hidden">
          <header className="border-b border-black/10 bg-white/80 px-5 py-4 backdrop-blur md:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#5c6a67]">Thursday, August 27, 2026</p>
                <h2 className="mt-1 text-2xl font-bold md:text-3xl">Good Morning, Sophy</h2>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  ["Classes Today", todaysClasses.length],
                  ["Pending", pendingAssignments.length],
                  ["Due Tomorrow", dueTomorrow.length],
                  ["Completed", completed.length],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-black/8 bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-[#68736f]">{label}</p>
                    <p className="mt-1 text-2xl font-bold text-[#24312f]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </header>

          <div className="grid gap-5 px-5 py-5 md:px-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm" id="dashboard">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-teal-700">Dashboard</p>
                    <h3 className="mt-1 text-xl font-bold">Today&apos;s priority board</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#24312f] px-3 py-1.5 text-sm font-semibold text-white">
                      {todaysClasses.length} classes
                    </span>
                    <span className="rounded-full bg-rose-100 px-3 py-1.5 text-sm font-semibold text-rose-700">
                      {dueTomorrow.length} urgent
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-2">
                  <div className="rounded-lg bg-[#f8faf7] p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold">Today&apos;s Classes</h4>
                      <button
                        type="button"
                        className="h-9 rounded-md border border-black/10 px-3 text-sm font-semibold hover:bg-white"
                        onClick={() => showSection("Schedule")}
                      >
                        View Schedule
                      </button>
                    </div>
                    <div className="mt-4 space-y-3">
                      {todaysClasses.map((item) => (
                        <div key={`${item.time}-${item.subject}`} className="grid grid-cols-[92px_1fr_auto] items-center gap-3">
                          <span className="text-sm font-bold text-[#4d5a56]">{item.time.slice(0, 5)}</span>
                          <span className="min-w-0 truncate font-semibold">{item.subject}</span>
                          <span className="rounded bg-white px-2 py-1 text-xs font-semibold text-[#68736f]">{item.room}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg bg-[#fff9eb] p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold">Upcoming Assignments</h4>
                      <button
                        type="button"
                        className="h-9 rounded-md border border-black/10 px-3 text-sm font-semibold hover:bg-white"
                        onClick={() => showSection("Assignments")}
                      >
                        Add Task
                      </button>
                    </div>
                    <div className="mt-4 space-y-3">
                      {pendingAssignments.slice(0, 3).map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{assignment.subject}</p>
                            <p className="truncate text-sm text-[#68736f]">{assignment.name}</p>
                          </div>
                          <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${priorityClass(assignment.priority)}`}>
                            {deadlineLabel(assignment.deadline)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm" id="assignments">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-teal-700">Assignments</p>
                    <h3 className="mt-1 text-xl font-bold">Add and track deadline work</h3>
                  </div>
                  <span className="w-fit rounded-full bg-[#e8eef8] px-3 py-1.5 text-sm font-semibold text-[#285178]">
                    {pendingAssignments.length} active
                  </span>
                </div>

                <form onSubmit={addAssignment} className="mt-5 grid gap-3 rounded-lg bg-[#f8faf7] p-4 lg:grid-cols-5">
                  <select
                    className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm font-semibold outline-none ring-teal-200 focus:ring-2"
                    value={form.subject}
                    aria-label="Subject"
                    onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                  >
                    {["Database", "Java", "Web Design", "English", "Networks"].map((subject) => (
                      <option key={subject}>{subject}</option>
                    ))}
                  </select>
                  <input
                    className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none ring-teal-200 focus:ring-2 lg:col-span-2"
                    placeholder="Assignment name"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  />
                  <input
                    className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none ring-teal-200 focus:ring-2"
                    type="date"
                    value={form.deadline}
                    onChange={(event) => setForm((current) => ({ ...current, deadline: event.target.value }))}
                  />
                  <button className="h-11 rounded-md bg-[#24312f] px-4 text-sm font-bold text-white transition hover:bg-[#314540]">
                    Add
                  </button>
                  <input
                    className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm outline-none ring-teal-200 focus:ring-2 lg:col-span-3"
                    placeholder="Description"
                    value={form.description}
                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  />
                  <select
                    className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm font-semibold outline-none ring-teal-200 focus:ring-2"
                    value={form.priority}
                    aria-label="Priority"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, priority: event.target.value as Assignment["priority"] }))
                    }
                  >
                    {["High", "Medium", "Low"].map((priority) => (
                      <option key={priority}>{priority}</option>
                    ))}
                  </select>
                  <input
                    className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm text-[#68736f] file:mr-3 file:h-8 file:rounded file:border-0 file:bg-[#f4c542] file:px-3 file:text-sm file:font-bold file:text-[#24312f]"
                    type="file"
                    aria-label="Assignment file"
                  />
                </form>

                <div className="mt-5 overflow-hidden rounded-lg border border-black/10">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="grid gap-3 border-b border-black/8 bg-white p-4 last:border-b-0 md:grid-cols-[1fr_auto_auto] md:items-center"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold">{assignment.subject}</p>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(assignment.status)}`}>
                            {assignment.status}
                          </span>
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${priorityClass(assignment.priority)}`}>
                            {assignment.priority}
                          </span>
                        </div>
                        <p className="mt-1 font-semibold text-[#343a40]">{assignment.name}</p>
                        <p className="mt-1 text-sm text-[#68736f]">{assignment.description}</p>
                      </div>
                      <div className="text-sm font-bold text-[#4d5a56]">{deadlineLabel(assignment.deadline)}</div>
                      <button
                        type="button"
                        className="h-10 rounded-md border border-black/10 px-3 text-sm font-bold hover:bg-[#f8faf7]"
                        onClick={() => toggleComplete(assignment.id)}
                      >
                        {assignment.status === "Completed" ? "Reopen" : "Complete"}
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm" id="schedule">
                <div>
                  <p className="text-sm font-semibold text-teal-700">Class Schedule</p>
                  <h3 className="mt-1 text-xl font-bold">Weekly class plan</h3>
                </div>
                <div className="mt-5 grid gap-3 xl:grid-cols-2">
                  {weeklySchedule.map((day) => (
                    <div key={day.day} className="rounded-lg border border-black/10 bg-[#fbfbf8] p-4">
                      <h4 className="font-bold">{day.day}</h4>
                      <div className="mt-3 space-y-3">
                        {day.classes.map((item) => (
                          <div key={`${day.day}-${item.time}`} className="grid grid-cols-[120px_1fr_auto] items-center gap-3 text-sm">
                            <span className="font-semibold text-[#68736f]">{item.time}</span>
                            <span className="min-w-0 truncate font-bold">{item.subject}</span>
                            <span className="rounded bg-white px-2 py-1 text-xs font-semibold text-[#68736f]">{item.room}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-5">
              <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm" id="notifications">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-teal-700">Notifications</p>
                    <h3 className="mt-1 text-xl font-bold">Reminder center</h3>
                  </div>
                  <span className="flex h-9 min-w-9 items-center justify-center rounded-md bg-[#24312f] px-2 text-sm font-bold text-white">
                    {notifications.length}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  {(Object.keys(channels) as Channel[]).map((channel) => (
                    <button
                      key={channel}
                      type="button"
                      className={`h-10 flex-1 rounded-md border px-3 text-sm font-bold transition ${
                        channels[channel]
                          ? "border-teal-200 bg-teal-50 text-teal-800"
                          : "border-black/10 bg-white text-[#68736f]"
                      }`}
                      onClick={() => setChannels((current) => ({ ...current, [channel]: !current[channel] }))}
                    >
                      {channel}
                    </button>
                  ))}
                </div>
                <div className="mt-4 space-y-3">
                  {notifications.map((notification) => (
                    <div key={`${notification.title}-${notification.detail}`} className="rounded-lg border border-black/8 bg-[#fbfbf8] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold">{notification.title}</p>
                        <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-[#68736f]">
                          {notification.tone}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[#68736f]">{notification.detail}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm" id="documents">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-teal-700">Documents</p>
                    <h3 className="mt-1 text-xl font-bold">Class files</h3>
                  </div>
                  <button className="h-10 rounded-md bg-[#f4c542] px-3 text-sm font-bold text-[#24312f]">Upload</button>
                </div>
                <div className="mt-4 space-y-3">
                  {documents.map((document) => (
                    <div key={document.name} className="grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-lg border border-black/8 p-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#e8eef8] text-xs font-bold text-[#285178]">
                        {document.type}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{document.name}</p>
                        <p className="text-sm text-[#68736f]">{document.subject}</p>
                      </div>
                      <p className="text-xs font-bold text-[#68736f]">{document.size}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm" id="automation">
                <div>
                  <p className="text-sm font-semibold text-teal-700">Automation</p>
                  <h3 className="mt-1 text-xl font-bold">Deadline processing flow</h3>
                </div>
                <div className="mt-5 space-y-3">
                  {automationSteps.map((step, index) => (
                    <div key={step.name} className="grid grid-cols-[36px_1fr] gap-3">
                      <div className="flex flex-col items-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#24312f] text-sm font-bold text-white">
                          {index + 1}
                        </div>
                        {index < automationSteps.length - 1 && <div className="h-8 w-px bg-black/12" />}
                      </div>
                      <div className="pb-2">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-bold">{step.name}</p>
                          <span className="rounded-full bg-[#f8faf7] px-2 py-1 text-xs font-bold text-[#68736f]">
                            {step.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-[#68736f]">{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
