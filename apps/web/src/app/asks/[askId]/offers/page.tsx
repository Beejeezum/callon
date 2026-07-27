import { AppShell, MobileHeader } from "@/components/app-shell";
import { OffersList } from "@/components/offers-list";

export default async function OffersPage({
  params,
}: {
  params: Promise<{ askId: string }>;
}) {
  const { askId } = await params;
  return (
    <AppShell>
      <div className="page-shell">
        <MobileHeader
          title="Offers"
          subtitle="Visible only to you"
          backHref={`/asks/${askId}`}
          actions={false}
        />
        <OffersList askId={askId} />
      </div>
    </AppShell>
  );
}
