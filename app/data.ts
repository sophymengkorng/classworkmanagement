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

const appTimeZone = "Asia/Phnom_Penh";

export function currentDate() {
  return new Date();
}

export function currentDateString() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: appTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(currentDate());
}

export function currentDayName() {
  return new Intl.DateTimeFormat("en", {
    timeZone: appTimeZone,
    weekday: "long",
  }).format(currentDate());
}

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

export function daysUntil(deadline: string) {
  const due = new Date(`${deadline}T00:00:00`);
  const today = new Date(`${currentDateString()}T00:00:00`);
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

export function getTodaysClasses() {
  return schedule.find((item) => item.day === currentDayName())?.classes ?? [];
}
