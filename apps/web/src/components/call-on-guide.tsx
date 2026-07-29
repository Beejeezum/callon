import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChatCircleDots,
  CheckCircle,
  HandHeart,
  LockKey,
  Megaphone,
  Package,
  SignIn,
  WhatsappLogo,
} from "@phosphor-icons/react/dist/ssr";
import { pilotCommunity } from "@/lib/pilot";
import { ButtonLink, Card } from "./ui";
import { GuideShareButton } from "./guide-share-button";

const guideSteps = [
  {
    icon: SignIn,
    title: "Join privately",
    copy: "Open Bruce’s Paseos link, add your name and email, then enter the one-time code. No app download, address, or item list.",
  },
  {
    icon: Megaphone,
    title: "Make a concrete Ask",
    copy: "Say what you’re doing and what would help—an item, advice, a volunteer, or an alternative.",
  },
  {
    icon: WhatsappLogo,
    title: "Share it in WhatsApp",
    copy: "Call On creates one tidy link. The group chat stays the meeting place; the app keeps the checklist.",
  },
  {
    icon: HandHeart,
    title: "Neighbors offer privately",
    copy: "People can lend, give, help, or advise. Offers go only to the requester, and saying no stays easy.",
  },
  {
    icon: Package,
    title: "Keep the handoff easy",
    copy: "Accepted neighbors coordinate pickup, due dates, reminders, and returns in one private thread.",
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
          <h1>Borrow a thing. Meet a neighbor.</h1>
          <p>
            Call On turns “Does anyone have…?” into a simple Ask, a private
            offer, and a handoff everyone can remember.
          </p>
        </div>
      </header>

      <div className="content narrow guide-content">
        <section className="guide-intro" aria-labelledby="guide-start">
          <div>
            <div className="eyebrow">The short version</div>
            <h2 id="guide-start">Ask first. List later—if ever.</h2>
            <p className="lede">
              You do not need to inventory your garage. Start with a real need,
              and save an item only after sharing it proves useful.
            </p>
          </div>
          <GuideShareButton url={guideUrl} />
        </section>

        <section className="section" aria-labelledby="guide-steps">
          <div className="section-heading guide-section-heading">
            <div>
              <div className="eyebrow">One friendly loop</div>
              <h2 id="guide-steps">How it works</h2>
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
              <h3>No garage inventory</h3>
              <p>
                Add an item only when you want to. Every loan still needs a yes.
              </p>
            </Card>
          </div>
        </section>

        <section className="guide-cta" aria-labelledby="guide-ready">
          <div>
            <div className="eyebrow">That’s the whole idea</div>
            <h2 id="guide-ready">
              Useful things. Easier asks. More neighbors.
            </h2>
            <p>
              Join through the private Paseos link in WhatsApp. Already in? Pick
              the next small thing you could use a hand with.
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
