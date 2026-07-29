import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { pilotCommunity } from "@/lib/pilot";
import { ButtonLink } from "./ui";

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
        <div className="eyebrow">A private sharing space for Paseos</div>
        <h2 className="paseos-display">Ask before you buy.</h2>
        <p className="lede">
          Borrow useful things, offer a hand, and keep the pickup and return
          details out of the group-chat shuffle.
        </p>

        <div className="stack-sm paseos-entry-actions">
          <ButtonLink href="/guide" full>
            See how it works <ArrowRight size={18} />
          </ButtonLink>
          {previewMode ? (
            <ButtonLink href="/demo" full variant="secondary">
              Try the interactive preview
            </ButtonLink>
          ) : null}
          <ButtonLink href="/login" full variant="neutral">
            Member sign in
          </ButtonLink>
        </div>
        <p className="help-text paseos-invite-note">
          Joining for the first time? Use Bruce’s private Paseos link from
          WhatsApp. It takes your name, email, and about a minute.
        </p>

        <footer className="paseos-footer">
          <strong>{pilotCommunity.attribution}</strong>
          <span>
            This is an independent neighborhood project, not an official HOA
            service.
          </span>
          <span className="row centered wrap">
            <Link href="/guide">How it works</Link>
            <span aria-hidden>·</span>
            <Link href="/login">Member sign in</Link>
          </span>
        </footer>
      </div>
    </div>
  );
}
