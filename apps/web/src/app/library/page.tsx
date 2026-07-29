import { AppShell, MobileHeader } from "@/components/app-shell";
import { LibraryView } from "@/components/library-view";
import {
  getCircleLibrary,
  getResourceCategories,
} from "@/server/resource-queries";
import { getSessionContext } from "@/server/session";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ added?: string }>;
}) {
  const session = await getSessionContext();
  const membership = session.activeMembership;
  const [resources, categories, params] = await Promise.all([
    getCircleLibrary(membership?.circleId ?? null, session.profileId),
    getResourceCategories(),
    searchParams,
  ]);
  return (
    <AppShell
      circleName={membership?.circleName ?? "Paseos Community Sharing"}
      canCreate={!session.configured || membership?.status === "active"}
    >
      <div className="page-shell">
        <MobileHeader
          title="Paseos library"
          subtitle="Browseable, never auto-booked"
        />
        <LibraryView
          resources={resources}
          categories={categories}
          canAdd={!session.configured || membership?.status === "active"}
          added={params.added === "1"}
        />
      </div>
    </AppShell>
  );
}
