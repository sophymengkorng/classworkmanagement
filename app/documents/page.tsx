import { AppShell } from "../components/app-shell";
import { DocumentsManager } from "../components/documents-manager";
import { readDocuments } from "../lib/document-store";
import { requireAuthContext } from "../lib/require-auth";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const auth = await requireAuthContext();
  const documents = await readDocuments(auth);

  return (
    <AppShell title="Document Page" eyebrow="Class Files" user={auth?.user}>
      <DocumentsManager initialDocuments={documents} />
    </AppShell>
  );
}
