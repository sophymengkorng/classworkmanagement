import { AppShell } from "../components/app-shell";
import { documents } from "../data";

export default function DocumentsPage() {
  return (
    <AppShell title="Document Page" eyebrow="Class Files">
      <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold">Class Documents</h3>
            <p className="mt-1 text-sm text-[#68736f]">Files for assignments, exercises, and class notes.</p>
          </div>
          <button className="h-11 rounded-md bg-[#f4c542] px-4 text-sm font-bold text-[#24312f]">Upload File</button>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {documents.map((document) => (
            <article key={document.name} className="grid grid-cols-[52px_1fr_auto] items-center gap-3 rounded-lg border border-black/8 p-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-md bg-[#e8eef8] text-xs font-bold text-[#285178]">
                {document.type}
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold">{document.name}</p>
                <p className="text-sm text-[#68736f]">{document.subject}</p>
              </div>
              <p className="text-xs font-bold text-[#68736f]">{document.size}</p>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
