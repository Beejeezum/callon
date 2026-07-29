import Link from "next/link";
import {
  ArrowRight,
  Info,
  Package,
  Plus,
} from "@phosphor-icons/react/dist/ssr";
import type { Ask } from "@/lib/mock-data";
import { ButtonLink, Card } from "./ui";
import { HomeFeed } from "./home-feed";

export function DemoHome({
  displayName,
  asks,
  previewNotice = false,
  canCreate = true,
}: {
  displayName: string;
  asks: Ask[];
  previewNotice?: boolean;
  canCreate?: boolean;
}) {
  return (
    <div className="content">
      {previewNotice ? (
        <div className="notice">
          <strong>Preview mode.</strong> Explore the experience with sample
          Paseos activity. Nothing here is sent to real neighbors.
        </div>
      ) : null}
      <section className={previewNotice ? "section" : undefined}>
        <div className="eyebrow">Good morning, {displayName}</div>
        <h1 style={{ marginTop: 8 }}>
          What can your neighbors help make easier?
        </h1>
        <p className="lede">
          Make a concrete Ask, share it in WhatsApp, and keep the follow-through
          in one friendly place.
        </p>
        <div className="row wrap" style={{ marginTop: 18 }}>
          {canCreate ? (
            <ButtonLink href="/asks/new">
              <Plus size={19} weight="bold" /> Create an Ask
            </ButtonLink>
          ) : null}
          <ButtonLink href="/library" variant="secondary">
            <Package size={19} /> Browse the library
          </ButtonLink>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <h2 style={{ marginBottom: 3 }}>Around Paseos</h2>
            <p className="muted small" style={{ margin: 0 }}>
              Concrete needs, offers, and events—not a social feed.
            </p>
          </div>
          <Link
            href="/activity"
            className="row small strong"
            style={{ color: "var(--green-700)" }}
          >
            My activity <ArrowRight size={15} />
          </Link>
        </div>
        <HomeFeed asks={asks} />
      </section>

      <section className="section">
        <Card className="pad soft guide-prompt-card">
          <div className="row-start">
            <div className="choice-icon">
              <Info size={22} weight="duotone" />
            </div>
            <div>
              <h3>New to Call On?</h3>
              <p className="muted small" style={{ marginBottom: 0 }}>
                See the whole Ask → Offer → Return loop in about a minute.
              </p>
              <Link href="/guide" className="guide-prompt-link">
                Read the quick guide <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
