import { Task } from "../data";
import { DashboardNotificationsDialog } from "./dashboard-notifications-dialog";
import { DashboardSettingsDialog } from "./dashboard-settings-dialog";

export function DashboardHeaderActions({ tasks = [] }: { tasks?: Task[] }) {
  return (
    <div className="flex items-center gap-2">
      <DashboardNotificationsDialog tasks={tasks} />
      <DashboardSettingsDialog />
    </div>
  );
}
