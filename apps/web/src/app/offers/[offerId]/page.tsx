import type { Metadata } from "next";
import { AppShell, MobileHeader } from "@/components/app-shell";
import { OfferDetail } from "@/components/offer-detail";
import { getOfferDetail } from "@/server/transaction-queries";
import { getSessionContext } from "@/server/session";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ offerId: string }>;
}): Promise<Metadata> {
  const { offerId } = await params;
  const offer = await getOfferDetail(offerId);
  return { title: offer ? `Offer from ${offer.name}` : "Offer" };
}

export default async function OfferPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  const [offer, session] = await Promise.all([
    getOfferDetail(offerId),
    getSessionContext(),
  ]);
  if (!offer) notFound();
  return (
    <AppShell hideNav circleName={session.activeMembership?.circleName}>
      <div className="page-shell">
        <MobileHeader
          title="Offer details"
          subtitle="Private to you and the contributor"
          backHref={`/asks/${offer.askId}/offers`}
          actions={false}
        />
        <OfferDetail offer={offer} />
      </div>
    </AppShell>
  );
}
