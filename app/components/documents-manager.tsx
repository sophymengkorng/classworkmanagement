"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { courseCatalog, DocumentRecord, formattedDate } from "../data";
import { ConfirmationDialog } from "./confirmation-dialog";

export function DocumentsManager({ initialDocuments }: { initialDocuments: DocumentRecord[] }) {
  const router = useRouter();
  const [documents, setDocuments] = useState(initialDocuments);
  const [subject, setSubject] = useState(courseCatalog[0]?.code ?? "NET II");
  const [file, setFile] = useState<File | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DocumentRecord | null>(null);
  const [replaceTarget, setReplaceTarget] = useState<DocumentRecord | null>(null);
  const [replacementSubject, setReplacementSubject] = useState(courseCatalog[0]?.code ?? "NET II");
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  function requestUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setMessage("Please choose a file first.");
      return;
    }
    setMessage("");
    setConfirmOpen(true);
  }

  async function uploadDocument() {
    if (!file) return;

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("file", file);

      const response = await fetch("/api/documents", {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      });
      const result = (await response.json()) as { document?: DocumentRecord; message?: string };

      if (!response.ok || !result.document) {
        throw new Error(result.message ?? "Could not upload document.");
      }

      setDocuments((current) => [result.document as DocumentRecord, ...current]);
      setFile(null);
      setMessage("Document uploaded and saved to server.");
      const fileInput = document.getElementById("document-file") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not upload document.");
    } finally {
      setUploading(false);
      setConfirmOpen(false);
    }
  }

  async function deleteDocument() {
    if (!deleteTarget) return;

    setDeletingId(deleteTarget.id);
    setMessage("");

    try {
      const response = await fetch(`/api/documents/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? "Could not delete document.");
      }

      setDocuments((current) => current.filter((document) => document.id !== deleteTarget.id));
      setMessage("Document deleted from server.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete document.");
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  }

  function requestReplace(document: DocumentRecord) {
    setReplaceTarget(document);
    setReplacementSubject(document.subject);
    setReplacementFile(null);
    setMessage("");
  }

  async function replaceDocument() {
    if (!replaceTarget || !replacementFile) {
      setMessage("Please choose a replacement file first.");
      return;
    }

    setReplacingId(replaceTarget.id);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("subject", replacementSubject);
      formData.append("file", replacementFile);

      const response = await fetch(`/api/documents/${replaceTarget.id}`, {
        method: "PUT",
        credentials: "same-origin",
        body: formData,
      });
      const result = (await response.json()) as { document?: DocumentRecord; message?: string };

      if (!response.ok || !result.document) {
        throw new Error(result.message ?? "Could not replace document.");
      }

      setDocuments((current) => current.map((document) => (document.id === replaceTarget.id ? result.document as DocumentRecord : document)));
      setMessage("Document replaced and saved to server.");
      setReplaceTarget(null);
      setReplacementFile(null);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not replace document.");
    } finally {
      setReplacingId(null);
    }
  }

  return (
    <section className="rounded-lg border border-black/10 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold">Class Documents</h3>
          <p className="mt-1 text-sm text-[#68736f]">Upload and save the file.</p>
        </div>
        <span className="w-fit rounded-full bg-[#fff9eb] px-3 py-1.5 text-sm font-bold text-[#8a6500]">
          {documents.length} files
        </span>
      </div>

      <form onSubmit={requestUpload} className="mt-5 grid gap-3 rounded-lg bg-[#f8faf7] p-3 sm:p-4 lg:grid-cols-[180px_minmax(0,1fr)_140px]">
        <select
          className="h-11 w-full rounded-md border border-black/10 bg-white px-3 text-sm font-semibold outline-none ring-teal-200 focus:ring-2"
          value={subject}
          aria-label="Document subject"
          onChange={(event) => setSubject(event.target.value)}
        >
          {courseCatalog.map((course) => (
            <option key={course.code}>{course.code}</option>
          ))}
        </select>
        <input
          id="document-file"
          className="min-h-11 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-[#68736f] file:mr-3 file:min-h-8 file:rounded file:border-0 file:bg-[#f4c542] file:px-3 file:text-sm file:font-bold file:text-[#24312f]"
          type="file"
          aria-label="Document file"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <button
          className="h-11 w-full rounded-md bg-[#24312f] px-4 text-sm font-bold text-white transition hover:bg-[#314540] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={uploading}
        >
          {uploading ? "Uploading" : "Upload"}
        </button>
      </form>

      {message && <p className="mt-3 text-sm font-semibold text-[#4d5a56]">{message}</p>}

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {documents.map((document) => (
          <article key={document.id} className="grid gap-3 rounded-lg border border-black/8 p-3 sm:grid-cols-[52px_minmax(0,1fr)] sm:items-center sm:p-4 xl:grid-cols-[52px_minmax(0,1fr)_auto]">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-[#e8eef8] text-xs font-bold text-[#285178]">
              {document.type}
            </span>
            <div className="min-w-0">
              <p className="break-words font-bold sm:truncate">{document.name}</p>
              <p className="text-sm text-[#68736f]">
                {document.subject} - {formattedDate(document.uploadedAt)}
              </p>
            </div>
            <div className="grid gap-2 sm:col-span-2 sm:grid-cols-3 xl:col-span-1">
              {document.url ? (
                <a
                  href={document.url}
                  download
                  className="flex h-10 items-center justify-center rounded-md border border-black/10 px-3 text-sm font-bold hover:bg-[#f8faf7]"
                >
                  Download
                </a>
              ) : (
                <p className="flex h-10 items-center justify-center rounded-md border border-black/10 px-3 text-xs font-bold text-[#68736f]">
                  No file
                </p>
              )}
              <button
                type="button"
                className="h-10 rounded-md border border-black/10 px-3 text-sm font-bold hover:bg-[#f8faf7] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={replacingId === document.id}
                onClick={() => requestReplace(document)}
              >
                Replace
              </button>
              <button
                type="button"
                className="h-10 rounded-md border border-rose-200 bg-rose-50 px-3 text-sm font-bold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={deletingId === document.id}
                onClick={() => setDeleteTarget(document)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      <ConfirmationDialog
        open={confirmOpen}
        title="Upload this document?"
        message={file ? `Please confirm before saving ${file.name} to the server.` : "Please confirm before uploading."}
        confirmLabel="Upload"
        busy={uploading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          void uploadDocument();
        }}
      />
      {replaceTarget && (
        <div className="fixed inset-0 z-50 grid min-h-dvh place-items-center bg-black/45 p-4">
          <div
            className="mx-auto my-auto w-full max-w-md rounded-lg border border-black/10 bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="replace-dialog-title"
          >
            <div className="border-b border-black/10 px-5 py-4">
              <p className="text-sm font-semibold text-teal-700">Permission Required</p>
              <h3 id="replace-dialog-title" className="mt-1 text-xl font-bold">
                Replace this document?
              </h3>
            </div>
            <div className="p-5">
              <p className="break-words text-sm leading-6 text-[#4d5a56]">
                Choose a new file to replace {replaceTarget.name}. The old uploaded file will be removed from the server.
              </p>
              <div className="mt-4 grid gap-3">
                <select
                  className="h-11 w-full rounded-md border border-black/10 bg-white px-3 text-sm font-semibold outline-none ring-teal-200 focus:ring-2"
                  value={replacementSubject}
                  aria-label="Replacement document subject"
                  onChange={(event) => setReplacementSubject(event.target.value)}
                >
                  {courseCatalog.map((course) => (
                    <option key={course.code}>{course.code}</option>
                  ))}
                </select>
                <input
                  className="min-h-11 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-[#68736f] file:mr-3 file:min-h-8 file:rounded file:border-0 file:bg-[#f4c542] file:px-3 file:text-sm file:font-bold file:text-[#24312f]"
                  type="file"
                  aria-label="Replacement document file"
                  onChange={(event) => setReplacementFile(event.target.files?.[0] ?? null)}
                />
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  className="h-11 rounded-md border border-black/10 px-4 text-sm font-bold hover:bg-[#f8faf7]"
                  disabled={Boolean(replacingId)}
                  onClick={() => setReplaceTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="h-11 rounded-md bg-[#24312f] px-4 text-sm font-bold text-white transition hover:bg-[#314540] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={Boolean(replacingId) || !replacementFile}
                  onClick={() => {
                    void replaceDocument();
                  }}
                >
                  {replacingId ? "Replacing" : "Replace"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmationDialog
        open={deleteTarget !== null}
        title="Delete this document?"
        message={deleteTarget ? `Please confirm before deleting ${deleteTarget.name} from the server.` : "Please confirm before deleting."}
        confirmLabel="Delete"
        tone="danger"
        busy={Boolean(deletingId)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          void deleteDocument();
        }}
      />
    </section>
  );
}
