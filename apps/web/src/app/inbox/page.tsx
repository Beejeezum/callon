import { AppShell, MobileHeader } from "@/components/app-shell";
import { InboxView } from "@/components/inbox-view";
import { getSessionContext } from "@/server/session";
import { getInbox } from "@/server/user-queries";

export default async function InboxPage() {
  const session = await getSessionContext();
  const data = await getInbox(session.profileId);
  return (
    <AppShell
      circleName={session.activeMembership?.circleName}
      canCreate={
        !session.configured || session.activeMembership?.status === "active"
      }
    >
      <div className="page-shell">
        <MobileHeader
          title="Inbox"
          subtitle="Private messages"
          actions={false}
        />
        <InboxView data={data} />
      </div>
    </AppShell>
  );
}
