"use client";

import { useState } from "react";
import { TaskStatus } from "../data";

export function TaskCompleteButton({ initialStatus }: { initialStatus: TaskStatus }) {
  const [status, setStatus] = useState(initialStatus);
  const completed = status === "Completed";

  return (
    <div className="rounded-lg border border-black/10 bg-white p-4">
      <p className="text-sm font-semibold text-[#68736f]">Current Status</p>
      <p className={`mt-1 text-lg font-bold ${completed ? "text-emerald-700" : "text-rose-700"}`}>{status}</p>
      <button
        type="button"
        className="mt-4 h-11 w-full rounded-md bg-[#24312f] px-4 text-sm font-bold text-white transition hover:bg-[#314540]"
        onClick={() => setStatus((current) => (current === "Completed" ? "Pending" : "Completed"))}
      >
        {completed ? "Mark as Pending" : "Mark as Complete"}
      </button>
    </div>
  );
}
