import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "../../components/app-shell";
import { TaskCompleteButton } from "../../components/task-complete-button";
import { dueLabel, formattedDate } from "../../data";
import { requireAuthContext } from "../../lib/require-auth";
import { readTask } from "../../lib/task-store";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const auth = await requireAuthContext();
  const { id } = await params;
  const task = await readTask(id, auth);

  if (!task) {
    return {
      title: "Task not found | ClassFlow",
      description: "The requested classwork task could not be found.",
      openGraph: { title: "Task not found | ClassFlow", description: "The requested classwork task could not be found.", images: [] },
      twitter: { title: "Task not found | ClassFlow", description: "The requested classwork task could not be found.", images: [] },
    };
  }

  const description = `${task.subject} task due ${formattedDate(task.deadline)}. Status: ${task.status}.`;

  return {
    title: `${task.title} | ClassFlow`,
    description,
    openGraph: { title: `${task.title} | ClassFlow`, description, images: [] },
    twitter: { title: `${task.title} | ClassFlow`, description, images: [] },
  };
}

export default async function TaskDetailPage({ params }: Props) {
  const auth = await requireAuthContext();
  const { id } = await params;
  const task = await readTask(id, auth);

  if (!task) notFound();

  return (
    <AppShell title={task.title} eyebrow="Task Detail" user={auth?.user}>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-lg border border-black/10 bg-white p-4 shadow-sm sm:p-5">
          <Link href="/tasks" className="text-sm font-bold text-teal-700 hover:text-teal-900">
            Back to tasks
          </Link>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="rounded-lg bg-[#f8faf7] p-4">
              <p className="text-sm font-semibold text-[#68736f]">Subject</p>
              <p className="mt-1 text-lg font-bold">{task.subject}</p>
            </div>
            <div className="rounded-lg bg-[#f8faf7] p-4">
              <p className="text-sm font-semibold text-[#68736f]">Teacher</p>
              <p className="mt-1 text-lg font-bold">{task.teacher}</p>
            </div>
            <div className="rounded-lg bg-[#fff9eb] p-4">
              <p className="text-sm font-semibold text-[#68736f]">Deadline</p>
              <p className="mt-1 text-lg font-bold">{formattedDate(task.deadline)}</p>
            </div>
            <div className="rounded-lg bg-[#fff9eb] p-4">
              <p className="text-sm font-semibold text-[#68736f]">Reminder</p>
              <p className="mt-1 text-lg font-bold">{dueLabel(task.deadline)}</p>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-black/10 p-4">
            <p className="text-sm font-semibold text-[#68736f]">Description</p>
            <p className="mt-2 leading-7 text-[#343a40]">{task.description}</p>
          </div>
        </section>

        <aside className="space-y-4 sm:space-y-5">
          <TaskCompleteButton taskId={task.id} initialStatus={task.status} />
          <section className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-[#68736f]">Notification Plan</p>
            <div className="mt-3 space-y-2 text-sm text-[#4d5a56]">
              <p>Telegram reminder: enabled</p>
              <p>Gmail reminder: enabled</p>
              <p>Deadline check: daily at 07:00</p>
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
