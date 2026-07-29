import { notFound } from "next/navigation";
import { AdminView } from "@/components/admin-view";
import { AppShell, MobileHeader } from "@/components/app-shell";
import { getAdminOverview } from "@/server/admin-queries";
import { getSessionContext } from "@/server/session";

export default async function AdminPage() {
  const session = await getSessionContext();
  const membership = session.activeMembership;
  if (!membership || !session.profileId) notFound();
  const data = await getAdminOverview(membership.circleId, session.profileId);
  if (!data) notFound();

  return (
    <AppShell circleName={membership.circleName}>
      <div className="page-shell">
        <MobileHeader
          title="Circle administration"
          subtitle="Scoped pilot tools"
          backHref="/profile"
          actions={false}
        />
        <AdminView data={data} currentProfileId={session.profileId} />
      </div>
    </AppShell>
  );
}
