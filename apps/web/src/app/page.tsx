import Link from "next/link";
import { ArrowRight, HandHeart, Plus } from "@phosphor-icons/react/dist/ssr";
import { AppShell, MobileHeader } from "@/components/app-shell";
import { HomeFeed } from "@/components/home-feed";
import { ButtonLink, Card } from "@/components/ui";
import { currentCircle } from "@/lib/mock-data";
import { getSessionContext } from "@/server/session";
import { CircleOnboarding } from "@/components/circle-onboarding";
import { getCircleAsks } from "@/server/ask-queries";

export default async function HomePage() {
  const session = await getSessionContext();
  if (session.configured && !session.activeMembership) {
    return (
      <AppShell hideNav>
        <div className="page-shell">
          <CircleOnboarding displayName={session.displayName} />
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
        <div className="content">
          <section>
            <div className="eyebrow">Good morning, {displayName}</div>
            <h1 style={{ marginTop: 8 }}>
              What can your neighbors help make easier?
            </h1>
            <p className="lede">
              Post a concrete need, share it where your community already talks,
              and keep the follow-through in one place.
            </p>
            <div className="row wrap" style={{ marginTop: 18 }}>
              {!session.configured ||
              session.activeMembership?.status === "active" ? (
                <ButtonLink href="/asks/new">
                  <Plus size={19} weight="bold" /> Create an Ask
                </ButtonLink>
              ) : null}
              <ButtonLink href="/activity" variant="secondary">
                <HandHeart size={19} /> See my activity
              </ButtonLink>
            </div>
            {session.activeMembership?.status === "restricted" ? (
              <div className="notice" style={{ marginTop: 18 }}>
                <strong>New activity is paused.</strong> You can still view the
                Circle and finish existing commitments.
              </div>
            ) : null}
          </section>

          <section className="section">
            <div className="section-heading">
              <div>
                <h2 style={{ marginBottom: 3 }}>What’s happening</h2>
                <p className="muted small" style={{ margin: 0 }}>
                  Concrete needs, offers, and events in {circleName}.
                </p>
              </div>
              <Link
                href="/activity"
                className="row small strong"
                style={{ color: "var(--green-700)" }}
              >
                View all <ArrowRight size={15} />
              </Link>
            </div>
            <HomeFeed asks={circleAsks} />
          </section>

          <section className="section">
            <Card className="pad soft">
              <div className="row-start">
                <div className="choice-icon">
                  <HandHeart size={22} weight="duotone" />
                </div>
                <div>
                  <h3>Inventory is optional</h3>
                  <p className="muted small" style={{ marginBottom: 0 }}>
                    You can lend an unlisted item when someone asks. Save it
                    afterward only when that makes future sharing easier.
                  </p>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
