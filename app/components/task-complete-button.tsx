"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TaskStatus } from "../data";
import { ConfirmationDialog } from "./confirmation-dialog";

export function TaskCompleteButton({ taskId, initialStatus }: { taskId: string; initialStatus: TaskStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState("");
  const completed = status === "Completed";

  async function toggleStatus() {
    const nextStatus = completed ? "Pending" : "Completed";

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = (await response.json()) as { task?: { status: TaskStatus }; message?: string };

      if (!response.ok || !result.task) {
        throw new Error(result.message ?? "Could not update task.");
      }

      setStatus(result.task.status);
      setMessage("Status saved to server.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update task.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-black/10 bg-white p-4">
      <p className="text-sm font-semibold text-[#68736f]">Current Status</p>
      <p className={`mt-1 text-lg font-bold ${completed ? "text-emerald-700" : "text-rose-700"}`}>{status}</p>
      <button
        type="button"
        className="mt-4 h-11 w-full rounded-md bg-[#24312f] px-4 text-sm font-bold text-white transition hover:bg-[#314540] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={saving}
        onClick={() => setConfirmOpen(true)}
      >
        {saving ? "Saving" : completed ? "Mark as Pending" : "Mark as Complete"}
      </button>
      {message && <p className="mt-3 text-sm font-semibold text-[#4d5a56]">{message}</p>}
      <ConfirmationDialog
        open={confirmOpen}
        title={completed ? "Mark task as pending?" : "Mark task as complete?"}
        message="Please confirm before changing this task status on the server."
        confirmLabel="Confirm"
        busy={saving}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          void toggleStatus();
        }}
      />
    </div>
  );
}
