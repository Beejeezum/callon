import { AppShell, MobileHeader } from "@/components/app-shell";
import { OffersList } from "@/components/offers-list";
import { getOffersForAsk } from "@/server/transaction-queries";
import { getMemberAsk } from "@/server/ask-queries";
import { getSessionContext } from "@/server/session";
import { notFound } from "next/navigation";

export default async function OffersPage({
  params,
}: {
  params: Promise<{ askId: string }>;
}) {
  const { askId } = await params;
  const [ask, offers, session] = await Promise.all([
    getMemberAsk(askId),
    getOffersForAsk(askId),
    getSessionContext(),
  ]);
  if (!ask) notFound();
  return (
    <AppShell circleName={session.activeMembership?.circleName}>
      <div className="page-shell">
        <MobileHeader
          title="Offers"
          subtitle="Visible only to you"
          backHref={`/asks/${askId}`}
          actions={false}
        />
        <OffersList askId={askId} offers={offers} needs={ask.needs} />
      </div>
    </AppShell>
  );
}
