import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  HandHeart,
  LockKey,
  Package,
  Sparkle,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { pilotCommunity } from "@/lib/pilot";
import { ButtonLink, Card } from "./ui";

const steps = [
  {
    icon: HandHeart,
    title: "Ask",
    copy: "Post one useful thing—a ladder, party table, advice, or a little help.",
  },
  {
    icon: UsersThree,
    title: "A neighbor offers",
    copy: "Offers stay private, and it is always okay to pass this time.",
  },
  {
    icon: Package,
    title: "Keep track",
    copy: "Pickup, return, and the little details live in one calm place.",
  },
];

export function PaseosLanding({ previewMode }: { previewMode: boolean }) {
  return (
    <div className="paseos-landing">
      <section className="paseos-hero">
        <Image
          className="paseos-hero-image"
          src="/assets/paseos-entrance.png"
          alt="The Paseos neighborhood entrance surrounded by palms and flowers"
          fill
          priority
          sizes="(max-width: 760px) 100vw, 760px"
        />
        <div className="paseos-hero-scrim" aria-hidden />
        <div className="paseos-hero-copy">
          <span className="pilot-pill">
            <Sparkle size={15} weight="fill" /> Neighbor-built experiment
          </span>
          <h1>{pilotCommunity.name}</h1>
          <p>{pilotCommunity.generalArea}</p>
        </div>
      </section>

      <div className="content narrow paseos-welcome">
        <div className="eyebrow">Welcome, neighbors</div>
        <h2 className="paseos-display">Borrow a thing. Meet a neighbor.</h2>
        <p className="lede">{pilotCommunity.welcomeMessage}</p>

        <div className="stack-sm" style={{ marginTop: 22 }}>
          <ButtonLink href="/login" full>
            I’m already a member <ArrowRight size={18} />
          </ButtonLink>
          {previewMode ? (
            <ButtonLink href="/demo" full variant="secondary">
              Preview the Paseos app
            </ButtonLink>
          ) : null}
        </div>
        <p className="help-text" style={{ textAlign: "center", marginTop: 12 }}>
          New here? Open the private Paseos invitation shared in WhatsApp. It
          verifies your email and joins you right away.
        </p>

        <section className="section">
          <h2>How it works</h2>
          <div className="paseos-step-list">
            {steps.map(({ icon: Icon, title, copy }, index) => (
              <div className="paseos-step" key={title}>
                <span className="paseos-step-number">{index + 1}</span>
                <span className="choice-icon">
                  <Icon size={21} weight="duotone" />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p className="muted small">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Card className="pad soft section">
          <div className="row-start">
            <LockKey size={23} weight="duotone" color="var(--green-700)" />
            <div>
              <h3>Private to Paseos</h3>
              <p className="muted small" style={{ marginBottom: 0 }}>
                Your email is never shown to neighbors. Street addresses are
                requested only after an Offer is accepted and pickup details
                actually matter.
              </p>
            </div>
          </div>
        </Card>

        <footer className="paseos-footer">
          <strong>{pilotCommunity.attribution}</strong>
          <span>
            This is an independent neighborhood project, not an official HOA
            service.
          </span>
          <Link href="/login">Member sign in</Link>
        </footer>
      </div>
    </div>
  );
}
