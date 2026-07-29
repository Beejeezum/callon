import { AppShell, MobileHeader } from "@/components/app-shell";
import { ResourceDetail } from "@/components/resource-detail";
import { getResource } from "@/server/user-queries";
import { getSessionContext } from "@/server/session";
import { notFound } from "next/navigation";

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ resourceId: string }>;
}) {
  const { resourceId } = await params;
  const session = await getSessionContext();
  const resource = await getResource(resourceId, session.profileId);
  if (!resource) notFound();
  return (
    <AppShell circleName={session.activeMembership?.circleName}>
      <div className="page-shell">
        <MobileHeader
          title={resource.isOwner ? "My shared item" : "Paseos library"}
          subtitle={
            resource.isOwner ? "You stay in control" : "Ask before you borrow"
          }
          backHref={resource.isOwner ? "/activity" : "/library"}
          actions={false}
        />
        <ResourceDetail resource={resource} />
      </div>
    </AppShell>
  );
}
