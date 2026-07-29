import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChatCircleDots,
  CheckCircle,
  HandHeart,
  ListChecks,
  LockKey,
  Megaphone,
  Package,
  WhatsappLogo,
} from "@phosphor-icons/react/dist/ssr";
import { pilotCommunity } from "@/lib/pilot";
import { ButtonLink, Card } from "./ui";
import { GuideShareButton } from "./guide-share-button";

const guideSteps = [
  {
    icon: Megaphone,
    title: "Create one Ask",
    copy: "Say what you’re doing, when you need help, and what would make it easier.",
  },
  {
    icon: ListChecks,
    title: "Add what would help",
    copy: "Make a short checklist—an item, advice, extra hands, or an alternative. Add more than one need when the job calls for it.",
  },
  {
    icon: WhatsappLogo,
    title: "Share one tidy link",
    copy: "Drop it into WhatsApp. The chat stays friendly and familiar while the Ask always shows what is covered and what is still needed.",
  },
  {
    icon: HandHeart,
    title: "Choose the help that fits",
    copy: "Neighbors offer privately. You see who can help with what, then accept the Offers that work for your Ask.",
  },
  {
    icon: Package,
    title: "Let Call On keep track",
    copy: "Accepted help becomes a clear commitment with private pickup details, due dates, extensions, reminders, and return confirmation.",
  },
] as const;

const exampleNeeds = [
  { label: "2 folding tables", state: "Covered" },
  { label: "Large cooler", state: "Covered" },
  { label: "Pop-up canopy", state: "Still needed" },
  { label: "30 minutes of setup help", state: "Covered" },
] as const;

export function CallOnGuide({
  previewMode,
  guideUrl,
}: {
  previewMode: boolean;
  guideUrl: string;
}) {
  return (
    <div className="call-on-guide">
      <header className="guide-hero">
        <Image
          className="guide-hero-image"
          src="/assets/paseos-entrance.png"
          alt="The Paseos neighborhood entrance surrounded by palms and flowers"
          fill
          priority
          sizes="(max-width: 760px) 100vw, 760px"
        />
        <div className="guide-hero-scrim" aria-hidden />
        <div className="guide-hero-copy">
          <Link href="/" className="guide-back-link">
            Paseos Community Sharing
          </Link>
          <div className="eyebrow guide-eyebrow">The 60-second guide</div>
          <h1>Make the Ask. We’ll keep it straight.</h1>
          <p>
            Tell Paseos what you need. Call On turns neighbor Offers into a
            clear checklist, private handoffs, and return reminders.
          </p>
        </div>
      </header>

      <div className="content narrow guide-content">
        <section className="guide-intro" aria-labelledby="guide-start">
          <div>
            <div className="eyebrow">The whole idea</div>
            <h2 id="guide-start">One Ask. One place to keep track.</h2>
            <p className="lede">
              Create your Ask, share it in WhatsApp, and see exactly who offered
              what, what you accepted, and when borrowed things are due back.
            </p>
            <p className="muted small">
              First time here? Bruce’s private Paseos link gets you in with your
              name, email, and a one-time code. No address is required to join.
            </p>
          </div>
          <GuideShareButton url={guideUrl} />
        </section>

        <section className="section" aria-labelledby="guide-steps">
          <div className="section-heading guide-section-heading">
            <div>
              <div className="eyebrow">Follow one request</div>
              <h2 id="guide-steps">From “could anyone?” to all set</h2>
            </div>
            <span className="guide-time">About 1 minute to join</span>
          </div>
          <ol className="guide-step-list">
            {guideSteps.map(({ icon: Icon, title, copy }, index) => (
              <li className="guide-step" key={title}>
                <span className="guide-step-number">{index + 1}</span>
                <span className="guide-step-icon" aria-hidden>
                  <Icon size={23} weight="duotone" />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="section" aria-labelledby="guide-example">
          <div className="eyebrow">A real-life example</div>
          <h2 id="guide-example">Hosting a backyard birthday</h2>
          <Card className="guide-example-card">
            <Image
              src="/assets/birthday-party.jpg"
              alt="An outdoor birthday table decorated for a neighborhood party"
              width={680}
              height={360}
            />
            <div className="guide-example-copy">
              <p>
                Instead of four separate chat messages, one Ask shows what is
                covered and what still needs a neighbor.
              </p>
              <ul className="guide-need-list">
                {exampleNeeds.map(({ label, state }) => (
                  <li key={label}>
                    <CheckCircle
                      size={20}
                      weight={state === "Covered" ? "fill" : "duotone"}
                      aria-hidden
                    />
                    <span>{label}</span>
                    <strong data-open={state === "Still needed"}>
                      {state}
                    </strong>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </section>

        <section
          className="section guide-reassurance"
          aria-labelledby="guide-private"
        >
          <div className="eyebrow">Built for normal neighbor boundaries</div>
          <h2 id="guide-private">Helpful without feeling exposed</h2>
          <div className="guide-reassurance-grid">
            <Card className="pad">
              <LockKey size={24} weight="duotone" aria-hidden />
              <h3>Private by default</h3>
              <p>
                Email and exact pickup details never appear on community pages.
              </p>
            </Card>
            <Card className="pad">
              <ChatCircleDots size={24} weight="duotone" aria-hidden />
              <h3>No public rejection</h3>
              <p>
                Offers are private, and nobody is scored or shamed for passing.
              </p>
            </Card>
            <Card className="pad">
              <Package size={24} weight="duotone" aria-hidden />
              <h3>A clean record</h3>
              <p>
                See who committed to what, confirm returns, and close the Ask
                when everything is settled.
              </p>
            </Card>
          </div>
        </section>

        <section className="guide-cta" aria-labelledby="guide-ready">
          <div>
            <div className="eyebrow">That’s the whole idea</div>
            <h2 id="guide-ready">Make the Ask. Let Call On keep track.</h2>
            <p>
              Join through the private Paseos link in WhatsApp. Already in?
              Start with the next small thing you could use a hand with.
            </p>
          </div>
          <div className="stack-sm">
            {previewMode ? (
              <ButtonLink href="/demo" full>
                Try the interactive preview <ArrowRight size={18} />
              </ButtonLink>
            ) : (
              <ButtonLink href="/login" full>
                Member sign in <ArrowRight size={18} />
              </ButtonLink>
            )}
            <ButtonLink href="/" full variant="neutral">
              Back to Paseos welcome
            </ButtonLink>
          </div>
        </section>

        <footer className="paseos-footer guide-footer">
          <strong>{pilotCommunity.attribution}</strong>
          <span>
            Independent neighborhood experiment · Not an official HOA service
          </span>
        </footer>
      </div>
    </div>
  );
}
