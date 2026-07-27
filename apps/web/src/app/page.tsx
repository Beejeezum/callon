import Link from "next/link";
import { ArrowRight, HandHeart, Plus } from "@phosphor-icons/react/dist/ssr";
import { AppShell, MobileHeader } from "@/components/app-shell";
import { HomeFeed } from "@/components/home-feed";
import { ButtonLink, Card } from "@/components/ui";
import { currentCircle } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <AppShell>
      <div className="page-shell">
        <MobileHeader title={currentCircle.name} subtitle="Private community" />
        <div className="content">
          <section>
            <div className="eyebrow">
              Good morning, {currentCircle.memberName}
            </div>
            <h1 style={{ marginTop: 8 }}>
              What can your neighbors help make easier?
            </h1>
            <p className="lede">
              Post a concrete need, share it where your community already talks,
              and keep the follow-through in one place.
            </p>
            <div className="row wrap" style={{ marginTop: 18 }}>
              <ButtonLink href="/asks/new">
                <Plus size={19} weight="bold" /> Create an Ask
              </ButtonLink>
              <ButtonLink href="/activity" variant="secondary">
                <HandHeart size={19} /> See my activity
              </ButtonLink>
            </div>
          </section>

          <section className="section">
            <div className="section-heading">
              <div>
                <h2 style={{ marginBottom: 3 }}>What’s happening</h2>
                <p className="muted small" style={{ margin: 0 }}>
                  Concrete needs, offers, and events in {currentCircle.name}.
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
            <HomeFeed />
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
