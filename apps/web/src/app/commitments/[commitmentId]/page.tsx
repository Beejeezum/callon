import { AppShell, MobileHeader } from "@/components/app-shell";
import { CommitmentChat } from "@/components/commitment-chat";

export default function CommitmentPage() {
  return (
    <AppShell>
      <div className="page-shell">
        <MobileHeader
          title="Coordinate pickup"
          subtitle="Private conversation"
          backHref="/offers/janet-tables"
          actions={false}
        />
        <CommitmentChat />
      </div>
    </AppShell>
  );
}
