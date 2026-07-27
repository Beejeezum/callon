import {
  Bell,
  HandHeart,
  House,
  Package,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";
import { AppShell, MobileHeader } from "@/components/app-shell";
import { Badge, ButtonLink, Card, Chip, Progress } from "@/components/ui";

export default function DesignSystemPage() {
  return (
    <AppShell>
      <div className="page-shell">
        <MobileHeader
          title="Design system"
          subtitle="Internal reference"
          backHref="/profile"
          actions={false}
        />
        <div className="content">
          <div className="eyebrow">Canonical visual direction</div>
          <h1 style={{ marginTop: 7 }}>Warm, private, and action-oriented</h1>
          <p className="lede">
            The system should feel friendlier than enterprise SaaS and more
            accountable than an open social feed.
          </p>
          <section className="section">
            <h2>Tokens</h2>
            <div className="row wrap">
              {[
                { n: "Primary", c: "#16843f" },
                { n: "Need", c: "#7c53ed" },
                { n: "Event", c: "#ffb020" },
                { n: "Ink", c: "#0f172a" },
                { n: "Canvas", c: "#f8f6f0" },
              ].map((token) => (
                <div key={token.n}>
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 14,
                      background: token.c,
                      border: "1px solid var(--line)",
                    }}
                  />
                  <div className="tiny muted" style={{ marginTop: 5 }}>
                    {token.n}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="section">
            <h2>Actions</h2>
            <div className="row wrap">
              <ButtonLink href="#">Primary button</ButtonLink>
              <ButtonLink href="#" variant="secondary">
                Secondary
              </ButtonLink>
              <ButtonLink href="#" variant="neutral">
                Neutral
              </ButtonLink>
              <Chip tone="violet">Need</Chip>
              <Chip tone="amber">Event</Chip>
            </div>
          </section>
          <section className="section">
            <h2>Cards and status</h2>
            <Card className="pad">
              <div className="row-between">
                <Badge tone="need">Need help</Badge>
                <Chip tone="green">3 of 4 covered</Chip>
              </div>
              <h3 style={{ marginTop: 12 }}>Hosting a birthday party</h3>
              <p className="muted small">
                Clear title, concrete timing, general area only.
              </p>
              <Progress value={75} />
            </Card>
          </section>
          <section className="section">
            <h2>Icon language</h2>
            <div className="row wrap">
              <House size={24} />
              <HandHeart size={24} />
              <Package size={24} />
              <ShieldCheck size={24} />
              <Bell size={24} />
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
