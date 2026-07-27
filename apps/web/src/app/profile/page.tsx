import { AppShell, MobileHeader } from "@/components/app-shell";
import { ProfileView } from "@/components/profile-view";
import { getSessionContext } from "@/server/session";
import { getProfileView } from "@/server/user-queries";

export default async function ProfilePage() {
  const session = await getSessionContext();
  const profile = await getProfileView(session.profileId);
  const membership = session.activeMembership;
  return (
    <AppShell
      circleName={membership?.circleName}
      canCreate={!session.configured || membership?.status === "active"}
    >
      <div className="page-shell">
        <MobileHeader
          title="Profile"
          subtitle={membership?.circleName ?? "Private Circle"}
          actions={false}
        />
        <ProfileView
          profile={profile}
          circleName={membership?.circleName ?? "Private Circle"}
          canAdmin={Boolean(
            membership &&
            ["moderator", "circle_admin"].includes(membership.role),
          )}
        />
      </div>
    </AppShell>
  );
}
