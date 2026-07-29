import { AppShell, MobileHeader } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { currentCircle } from "@/lib/mock-data";
import { getSessionContext } from "@/server/session";
import { CircleOnboarding } from "@/components/circle-onboarding";
import { getCircleAsks } from "@/server/ask-queries";
import { PaseosLanding } from "@/components/paseos-landing";
import { DemoHome } from "@/components/demo-home";
import { getPilotBootstrapEligibility } from "@/server/pilot-actions";

export default async function HomePage() {
  const session = await getSessionContext();
  if (!session.configured || !session.profileId) {
    return (
      <AppShell hideNav publicMode>
        <div className="page-shell public-landing-shell">
          <PaseosLanding previewMode={!session.configured} />
        </div>
      </AppShell>
    );
  }
  if (session.configured && !session.activeMembership) {
    const canBootstrapPaseos = await getPilotBootstrapEligibility();
    return (
      <AppShell hideNav>
        <div className="page-shell">
          <CircleOnboarding
            displayName={session.displayName}
            canBootstrapPaseos={canBootstrapPaseos}
          />
        </div>
      </AppShell>
    );
  }
  if (session.configured && session.activeMembership?.status === "suspended") {
    return (
      <AppShell
        circleName={session.activeMembership.circleName}
        canCreate={false}
      >
        <div className="page-shell">
          <MobileHeader
            title={session.activeMembership.circleName}
            subtitle="Membership suspended"
            actions={false}
          />
          <div className="content narrow">
            <Card className="pad">
              <div className="eyebrow">Circle access paused</div>
              <h1 style={{ marginTop: 8 }}>
                Your membership is currently suspended
              </h1>
              <p className="lede">
                You cannot view Circle activity or create new Asks and Offers
                right now. Existing private records remain protected.
              </p>
              <p className="muted small" style={{ marginBottom: 0 }}>
                Contact a Circle administrator outside Call On if you believe
                this is a mistake.
              </p>
            </Card>
          </div>
        </div>
      </AppShell>
    );
  }
  const circleName = session.activeMembership?.circleName ?? currentCircle.name;
  const displayName = session.displayName || currentCircle.memberName;
  const circleAsks = await getCircleAsks(
    session.activeMembership?.circleId ?? null,
  );
  return (
    <AppShell
      circleName={circleName}
      canCreate={
        !session.configured || session.activeMembership?.status === "active"
      }
    >
      <div className="page-shell">
        <MobileHeader title={circleName} subtitle="Private community" />
        <DemoHome
          displayName={displayName}
          asks={circleAsks}
          canCreate={
            !session.configured || session.activeMembership?.status === "active"
          }
        />
        {session.activeMembership?.status === "restricted" ? (
          <div className="content" style={{ paddingTop: 0 }}>
            <div className="notice">
              <strong>New activity is paused.</strong> You can still view the
              Circle and finish existing commitments.
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
