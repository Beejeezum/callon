import type { Metadata } from "next";
import { AppShell, MobileHeader } from "@/components/app-shell";
import { PublicAsk } from "@/components/public-ask";
import { getSharedAsk } from "@/server/ask-queries";
import { getSessionContext } from "@/server/session";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const ask = await getSharedAsk(token);
  if (!ask) return { title: "Shared Ask unavailable" };
  return {
    title: ask.title,
    description: `${ask.circleName}: ${ask.needs.length} concrete needs. Can you help?`,
    openGraph: {
      title: ask.title,
      description: `${ask.needs.filter((need) => need.committed >= need.quantity).length} of ${ask.needs.length} needs covered. Can you help?`,
      images: ask.image ? [ask.image] : [],
    },
  };
}

export default async function SharedAskPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [ask, session] = await Promise.all([
    getSharedAsk(token),
    getSessionContext(),
  ]);
  if (!ask) notFound();
  return (
    <AppShell hideNav publicMode>
      <div className="page-shell">
        <MobileHeader
          title="Shared Ask"
          subtitle={ask.circleName}
          actions={false}
        />
        <PublicAsk
          ask={ask}
          shareToken={token}
          authenticated={Boolean(session.profileId)}
        />
      </div>
    </AppShell>
  );
}
