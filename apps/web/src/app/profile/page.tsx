import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  Gear,
  HandHeart,
  LockKey,
  ShieldCheck,
  SignOut,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { AppShell, MobileHeader } from "@/components/app-shell";
import { Card, Chip } from "@/components/ui";

export default function ProfilePage() {
  return (
    <AppShell>
      <div className="page-shell">
        <MobileHeader title="Profile" subtitle="Oakridge HOA" actions={false} />
        <div className="content narrow">
          <div style={{ textAlign: "center" }}>
            <Image
              className="avatar lg"
              style={{ width: 84, height: 84, margin: "0 auto" }}
              src="/assets/avatar-lisa.png"
              alt=""
              width={84}
              height={84}
            />
            <h1 style={{ marginTop: 14, marginBottom: 4 }}>Emily</h1>
            <p className="muted small">Oakridge HOA member since May 2026</p>
          </div>
          <div className="field-grid-2 section">
            <Card className="pad" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800 }}>6</div>
              <div className="tiny muted">Completed shares</div>
            </Card>
            <Card className="pad" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800 }}>0</div>
              <div className="tiny muted">Unresolved returns</div>
            </Card>
          </div>
          <div
            className="row wrap"
            style={{ justifyContent: "center", marginTop: 12 }}
          >
            <Chip tone="green">
              <ShieldCheck size={14} /> Verified member
            </Chip>
            <Chip>
              <HandHeart size={14} /> Reliable follow-through
            </Chip>
          </div>
          <section className="section">
            <div className="list">
              <Link href="/activity" className="list-row">
                <UsersThree size={20} color="var(--green-700)" />
                <div className="list-content">
                  <div className="strong small">My activity</div>
                  <div className="tiny muted">
                    Asks, offers, loans, and saved items
                  </div>
                </div>
                <span>›</span>
              </Link>
              <Link href="/inbox" className="list-row">
                <Bell size={20} color="var(--green-700)" />
                <div className="list-content">
                  <div className="strong small">Notification preferences</div>
                  <div className="tiny muted">
                    Email, reminders, and quiet hours
                  </div>
                </div>
                <span>›</span>
              </Link>
              <div className="list-row">
                <LockKey size={20} color="var(--green-700)" />
                <div className="list-content">
                  <div className="strong small">Privacy and data</div>
                  <div className="tiny muted">
                    Contact verification and exact-location controls
                  </div>
                </div>
                <span>›</span>
              </div>
              <Link href="/admin" className="list-row">
                <Gear size={20} color="var(--green-700)" />
                <div className="list-content">
                  <div className="strong small">Circle administration</div>
                  <div className="tiny muted">Pilot-only moderator preview</div>
                </div>
                <span>›</span>
              </Link>
            </div>
          </section>
          <section className="section">
            <div className="notice">
              <strong>No public reputation score.</strong> The app uses factual
              transaction history and unresolved-issue status only where it
              helps people make a decision.
            </div>
          </section>
          <section className="section">
            <button className="button neutral full">
              <SignOut size={18} /> Sign out
            </button>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
