import { AppShell, MobileHeader } from "@/components/app-shell";
import { ActivityView } from "@/components/activity-view";

export default function ActivityPage() {
  return (
    <AppShell>
      <div className="page-shell">
        <MobileHeader title="My activity" subtitle="Oakridge HOA" />
        <ActivityView />
      </div>
    </AppShell>
  );
}
