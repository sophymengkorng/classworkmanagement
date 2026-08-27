import { AppShell } from "../components/app-shell";
import { DocumentsManager } from "../components/documents-manager";
import { readDocuments } from "../lib/document-store";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const documents = await readDocuments();

  return (
    <AppShell title="Document Page" eyebrow="Class Files">
      <DocumentsManager initialDocuments={documents} />
    </AppShell>
  );
}
