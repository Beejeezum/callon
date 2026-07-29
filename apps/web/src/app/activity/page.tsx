import { AppShell, MobileHeader } from "@/components/app-shell";
import { ActivityView } from "@/components/activity-view";
import { getSessionContext } from "@/server/session";
import { getMyActivity } from "@/server/user-queries";

export default async function ActivityPage() {
  const session = await getSessionContext();
  const data = await getMyActivity(session.profileId);
  return (
    <AppShell
      circleName={session.activeMembership?.circleName}
      canCreate={
        !session.configured || session.activeMembership?.status === "active"
      }
    >
      <div className="page-shell">
        <MobileHeader
          title="My activity"
          subtitle={session.activeMembership?.circleName ?? "Private Circle"}
        />
        <ActivityView data={data} />
      </div>
    </AppShell>
  );
}
