import { AppShell } from "../components/layout/app-shell";
import { DashboardHeaderActions } from "../features/dashboard/dashboard-header-actions";
import { DocumentsManager } from "../features/documents/documents-manager";
import { readNotificationReadIds } from "../lib/stores/notification-store";
import { readProfile } from "../lib/stores/profile-store";
import { readDashboardTasks } from "../lib/stores/task-store";
import { readDocuments } from "../lib/stores/document-store";
import { requireAuthContext } from "../lib/require-auth";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const auth = await requireAuthContext();
  const [documents, taskData, readNotificationIds, profile] = await Promise.all([
    readDocuments(auth),
    readDashboardTasks(auth),
    readNotificationReadIds(auth),
    readProfile(auth),
  ]);

  return (
    <AppShell title="Document Page" eyebrow="Class Files" action={<DashboardHeaderActions tasks={taskData.notificationTasks} readNotificationIds={readNotificationIds} />} user={auth?.user} profile={profile}>
      <DocumentsManager initialDocuments={documents} />
    </AppShell>
  );
}
