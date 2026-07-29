import { notFound, redirect } from "next/navigation";
import { AppShell, MobileHeader } from "@/components/app-shell";
import { ResourceWizard } from "@/components/resource-wizard";
import { getResourceCategories } from "@/server/resource-queries";
import { getSessionContext } from "@/server/session";

export default async function NewResourcePage() {
  const session = await getSessionContext();
  const membership = session.activeMembership;
  if (session.configured && !membership) notFound();
  if (membership && membership.status !== "active") redirect("/library");
  const categories = await getResourceCategories();
  return (
    <AppShell circleName={membership?.circleName ?? "Paseos Community Sharing"}>
      <div className="page-shell">
        <MobileHeader
          title="Add an item"
          subtitle="Fast now, details later"
          backHref="/library"
          actions={false}
        />
        <ResourceWizard
          circleId={
            membership?.circleId ?? "b0b08438-1234-4a2d-9ea2-2a88f3f47001"
          }
          categories={categories}
        />
      </div>
    </AppShell>
  );
}
