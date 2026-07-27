import type { Metadata } from "next";
import { AppShell, MobileHeader } from "@/components/app-shell";
import { OfferDetail } from "@/components/offer-detail";
import { getOffer } from "@/lib/mock-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ offerId: string }>;
}): Promise<Metadata> {
  const { offerId } = await params;
  return { title: `Offer from ${getOffer(offerId).name}` };
}

export default async function OfferPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  const offer = getOffer(offerId);
  return (
    <AppShell hideNav>
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
