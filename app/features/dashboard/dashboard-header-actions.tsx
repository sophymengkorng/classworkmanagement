import { Task } from "../../data";
import { DashboardNotificationsDialog } from "../notifications/notifications-dropdown";
import { DashboardSettingsDialog } from "../settings/settings-dialog";

export function DashboardHeaderActions({ tasks = [], readNotificationIds = [] }: { tasks?: Task[]; readNotificationIds?: string[] }) {
  return (
    <div className="flex items-center gap-2">
      <DashboardNotificationsDialog tasks={tasks} initialReadIds={readNotificationIds} />
      <DashboardSettingsDialog />
    </div>
  );
}
