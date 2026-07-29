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
        <h2 className="paseos-display">A neighborly way to ask for a hand.</h2>
        <p className="lede">
          Borrow something useful, share what you have, or lend a little
          know-how—without losing pickup and return details in the group chat.
        </p>

        <div className="stack-sm paseos-entry-actions">
          <ButtonLink href="/guide" full>
            See one Ask in action <ArrowRight size={18} />
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
            <Link href="/guide">Follow one Ask</Link>
            <span aria-hidden>·</span>
            <Link href="/login">Member sign in</Link>
          </span>
        </footer>
      </div>
    </div>
  );
}
