import { AppShell } from "../components/app-shell";
import { DashboardHeaderActions } from "../components/dashboard-header-actions";
import { DocumentsManager } from "../components/documents-manager";
import { readDashboardTasks } from "../lib/task-store";
import { readDocuments } from "../lib/document-store";
import { requireAuthContext } from "../lib/require-auth";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const auth = await requireAuthContext();
  const [documents, taskData] = await Promise.all([readDocuments(auth), readDashboardTasks(auth)]);

  return (
    <AppShell title="Document Page" eyebrow="Class Files" action={<DashboardHeaderActions tasks={taskData.notificationTasks} />} user={auth?.user}>
      <DocumentsManager initialDocuments={documents} />
    </AppShell>
  );
}
