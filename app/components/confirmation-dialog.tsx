"use client";

type ConfirmationDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid min-h-dvh place-items-center bg-black/45 p-4">
      <div
        className="mx-auto my-auto w-full max-w-md rounded-lg border border-black/10 bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="border-b border-black/10 px-5 py-4">
          <p className="text-sm font-semibold text-teal-700">Permission Required</p>
          <h3 id="confirm-dialog-title" className="mt-1 text-xl font-bold">
            {title}
          </h3>
        </div>
        <div className="p-5">
          <p className="text-sm leading-6 text-[#4d5a56]">{message}</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              className="h-11 rounded-md border border-black/10 px-4 text-sm font-bold hover:bg-[#f8faf7]"
              disabled={busy}
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`h-11 rounded-md px-4 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                tone === "danger" ? "bg-rose-700 hover:bg-rose-800" : "bg-[#24312f] hover:bg-[#314540]"
              }`}
              disabled={busy}
              onClick={onConfirm}
            >
              {busy ? "Working" : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
