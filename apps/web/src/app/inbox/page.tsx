import { AppShell, MobileHeader } from "@/components/app-shell";
import { InboxView } from "@/components/inbox-view";

export default function InboxPage() {
  return (
    <AppShell>
      <div className="page-shell">
        <MobileHeader
          title="Inbox"
          subtitle="Private messages"
          actions={false}
        />
        <InboxView />
      </div>
    </AppShell>
  );
}
