import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  UserCircle,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import { AppShell, MobileHeader } from "@/components/app-shell";
import { Badge, Card, Chip } from "@/components/ui";

export default function AdminPage() {
  return (
    <AppShell>
      <div className="page-shell">
        <MobileHeader
          title="Circle administration"
          subtitle="Scoped pilot tools"
          backHref="/profile"
          actions={false}
        />
        <div className="content">
          <div className="row-between">
            <div>
              <h1>Oakridge HOA</h1>
              <p className="lede">
                Membership, safety, and pilot health—not surveillance.
              </p>
            </div>
            <Chip tone="green">Pilot</Chip>
          </div>
          <div className="field-grid-2 section">
            <Card className="pad">
              <div className="eyebrow">Active members</div>
              <div style={{ fontSize: 34, fontWeight: 850, marginTop: 6 }}>
                42
              </div>
              <div className="tiny muted">8 have completed a share</div>
            </Card>
            <Card className="pad">
              <div className="eyebrow">Open incidents</div>
              <div style={{ fontSize: 34, fontWeight: 850, marginTop: 6 }}>
                0
              </div>
              <div className="tiny muted">No evidence access grants active</div>
            </Card>
          </div>
          <section className="section">
            <h2>Membership queue</h2>
            <div className="list">
              <div className="list-row">
                <UserCircle size={22} color="var(--green-700)" />
                <div className="list-content">
                  <div className="strong small">Jordan M.</div>
                  <div className="tiny muted">
                    Invited by Emily · phone verified
                  </div>
                </div>
                <Badge tone="active">Pending</Badge>
              </div>
              <div className="list-row">
                <UserCircle size={22} color="var(--green-700)" />
                <div className="list-content">
                  <div className="strong small">Casey R.</div>
                  <div className="tiny muted">
                    Shared Ask guest · email verified
                  </div>
                </div>
                <Badge tone="active">Review</Badge>
              </div>
            </div>
          </section>
          <section className="section">
            <h2>Moderation boundary</h2>
            <div className="privacy-callout">
              <ShieldCheck size={23} />
              <span>
                Circle administrators can review membership and reports. They
                cannot browse private messages, exact pickup locations, or
                evidence without a scoped, audited incident grant.
              </span>
            </div>
          </section>
          <section className="section">
            <h2>Pilot operations</h2>
            <div className="list">
              <Link href="#" className="list-row">
                <WarningCircle size={21} />
                <div className="list-content">
                  <div className="strong small">Incident queue</div>
                  <div className="tiny muted">
                    Private, evidence-aware resolution
                  </div>
                </div>
                <ArrowRight size={17} />
              </Link>
              <Link href="#" className="list-row">
                <ShieldCheck size={21} />
                <div className="list-content">
                  <div className="strong small">Safety rules</div>
                  <div className="tiny muted">
                    Allowed and prohibited categories
                  </div>
                </div>
                <ArrowRight size={17} />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
