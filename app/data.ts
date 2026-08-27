export type TaskStatus = "Pending" | "In progress" | "Completed";

export type Task = {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  deadline: string;
  description: string;
  status: TaskStatus;
  priority: "High" | "Medium" | "Low";
};

export type DocumentRecord = {
  id: string;
  name: string;
  subject: string;
  type: string;
  size: string;
  uploadedAt: string;
  storageName?: string;
  url?: string;
};

export const today = new Date("2026-08-27T00:00:00");

export const classInfo = {
  school: "SETEC",
  group: "SW35 (E-T)",
  year: "Year 2",
  semester: "Semester 2",
  termStart: "2026-07-20",
  sheetPage: "P50",
  effectiveFrom: "2026-08-31",
  changeNote: "Changes Thursday, Friday & Saturday",
};

export const schedule = [
  {
    day: "Monday",
    classes: [
      { time: "5:45 - 6:45 PM", subject: "NET II", teacher: "OUDOM", room: "3I" },
      { time: "6:45 - 7:45 PM", subject: "DSM", teacher: "ROTH", room: "4G" },
      { time: "7:45 - 8:45 PM", subject: "WD III", teacher: "PIN", room: "1D" },
    ],
  },
  {
    day: "Tuesday",
    classes: [
      { time: "5:45 - 6:45 PM", subject: "DSM", teacher: "ROTH", room: "4K" },
      { time: "6:45 - 7:45 PM", subject: "C# III", teacher: "PHARA", room: "1I" },
      { time: "7:45 - 8:45 PM", subject: "DSA II", teacher: "USA", room: "3E" },
    ],
  },
  {
    day: "Wednesday",
    classes: [
      { time: "5:45 - 6:45 PM", subject: "DSA II", teacher: "USA", room: "1H" },
      { time: "6:45 - 7:45 PM", subject: "SM I", teacher: "LONG", room: "2A" },
      { time: "7:45 - 8:45 PM", subject: "SM I", teacher: "LONG", room: "3L" },
    ],
  },
  {
    day: "Thursday",
    classes: [
      { time: "5:45 - 6:45 PM", subject: "3GD", teacher: "MENG", room: "1E" },
      { time: "6:45 - 7:45 PM", subject: "WD III", teacher: "PIN", room: "3C" },
      { time: "7:45 - 8:45 PM", subject: "C# III", teacher: "PHARA", room: "3C" },
    ],
  },
  {
    day: "Friday",
    classes: [
      { time: "5:45 - 6:45 PM", subject: "SP II", teacher: "RINA", room: "2J" },
      { time: "6:45 - 7:45 PM", subject: "ACD", teacher: "CR", room: "1I" },
      { time: "7:45 - 8:45 PM", subject: "NET II", teacher: "OUDOM", room: "2D" },
    ],
  },
  {
    day: "Saturday",
    classes: [
      { time: "5:45 - 6:45 PM", subject: "ACD", teacher: "CR", room: "5A" },
      { time: "6:45 - 7:45 PM", subject: "SP II", teacher: "RINA", room: "5A" },
      { time: "7:45 - 8:45 PM", subject: "3GD", teacher: "MENG", room: "5A" },
    ],
  },
];

export const courseCatalog = [
  { code: "NET II", unit: "1 - 1", lecturer: "OUDOM" },
  { code: "C# III", unit: "1 - 1", lecturer: "PHARA" },
  { code: "WD III", unit: "1 - 1", lecturer: "PIN" },
  { code: "DSM", unit: "0 - 2", lecturer: "ROTH" },
  { code: "DSA II", unit: "1 - 1", lecturer: "USA" },
  { code: "SP II", unit: "1 - 1", lecturer: "RINA" },
  { code: "SM I", unit: "1 - 1", lecturer: "LONG" },
  { code: "3GD", unit: "1 - 1", lecturer: "MENG" },
  { code: "ACD", unit: "1 - 1", lecturer: "CR" },
];

export const semesterEvents = [
  { label: "Mid Exams", date: "2026-10-05 to 2026-10-10" },
  { label: "Holiday", date: "2026-12-28 to 2027-01-02" },
  { label: "Final Exams", date: "2027-01-04 to 2027-01-09" },
  { label: "New Semester", date: "2027-01-11" },
];

export const tasks: Task[] = [
  {
    id: "1",
    title: "NET II Assignment",
    subject: "NET II",
    teacher: "OUDOM",
    deadline: "2026-08-28",
    description: "Review network concepts from class and submit the assigned exercise.",
    status: "Pending",
    priority: "High",
  },
  {
    id: "2",
    title: "DSM Practical Work",
    subject: "DSM",
    teacher: "ROTH",
    deadline: "2026-08-30",
    description: "Complete the practical exercise and prepare notes for the next DSM class.",
    status: "In progress",
    priority: "Medium",
  },
  {
    id: "3",
    title: "WD III Page Design",
    subject: "WD III",
    teacher: "PIN",
    deadline: "2026-09-02",
    description: "Create a responsive web page using clean HTML structure and CSS layout.",
    status: "Pending",
    priority: "Medium",
  },
  {
    id: "4",
    title: "C# III Exercise",
    subject: "C# III",
    teacher: "PHARA",
    deadline: "2026-09-05",
    description: "Complete the C# exercise and test the program before submission.",
    status: "Completed",
    priority: "Low",
  },
];

export const documents: DocumentRecord[] = [
  {
    id: "sample-1",
    name: "NET_II_Assignment.pdf",
    subject: "NET II",
    type: "PDF",
    size: "2.4 MB",
    uploadedAt: "2026-08-27",
  },
  {
    id: "sample-2",
    name: "DSM_Practical_Work.pdf",
    subject: "DSM",
    type: "PDF",
    size: "880 KB",
    uploadedAt: "2026-08-27",
  },
  {
    id: "sample-3",
    name: "WD_III_Page_Design.docx",
    subject: "WD III",
    type: "DOCX",
    size: "1.1 MB",
    uploadedAt: "2026-08-27",
  },
  {
    id: "sample-4",
    name: "CSharp_III_Exercise.zip",
    subject: "C# III",
    type: "ZIP",
    size: "3.6 MB",
    uploadedAt: "2026-08-27",
  },
];

export function daysUntil(deadline: string) {
  const due = new Date(`${deadline}T00:00:00`);
  return Math.ceil((due.getTime() - today.getTime()) / 86400000);
}

export function dueLabel(deadline: string) {
  const days = daysUntil(deadline);
  if (days < 0) return "Overdue";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

export function formattedDate(deadline: string) {
  const date = deadline.includes("T") ? new Date(deadline) : new Date(`${deadline}T00:00:00`);
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

export function getTask(id: string) {
  return tasks.find((task) => task.id === id);
}

export const todaysClasses = schedule.find((item) => item.day === "Thursday")?.classes ?? [];
export const pendingTasks = tasks.filter((task) => task.status !== "Completed");
export const dueTomorrowTasks = pendingTasks.filter((task) => daysUntil(task.deadline) === 1);
