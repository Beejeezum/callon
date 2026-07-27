import { AppShell, MobileHeader } from "@/components/app-shell";
import { ResourceDetail } from "@/components/resource-detail";

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ resourceId: string }>;
}) {
  const { resourceId } = await params;
  return (
    <AppShell>
      <div className="page-shell">
        <MobileHeader
          title="Saved item"
          subtitle="Private by default"
          backHref="/activity"
          actions={false}
        />
        <ResourceDetail id={resourceId} />
      </div>
    </AppShell>
  );
}
