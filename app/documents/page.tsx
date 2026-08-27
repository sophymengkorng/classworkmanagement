import { AppShell } from "../components/app-shell";
import { DocumentsManager } from "../components/documents-manager";
import { readDocuments } from "../lib/document-store";
import { requireAuth } from "../lib/require-auth";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const user = await requireAuth();
  const documents = await readDocuments();

  return (
    <AppShell title="Document Page" eyebrow="Class Files" user={user}>
      <DocumentsManager initialDocuments={documents} />
    </AppShell>
  );
}
