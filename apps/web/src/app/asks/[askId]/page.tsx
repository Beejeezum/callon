import type { Metadata } from "next";
import { AppShell, MobileHeader } from "@/components/app-shell";
import { AskDetail } from "@/components/ask-detail";
import { getMemberAsk } from "@/server/ask-queries";
import { getSessionContext } from "@/server/session";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ askId: string }>;
}): Promise<Metadata> {
  const { askId } = await params;
  const ask = await getMemberAsk(askId);
  return { title: ask?.title ?? "Ask" };
}

export default async function AskPage({
  params,
}: {
  params: Promise<{ askId: string }>;
}) {
  const { askId } = await params;
  const [ask, session] = await Promise.all([
    getMemberAsk(askId),
    getSessionContext(),
  ]);
  if (!ask) notFound();
  return (
    <AppShell
      circleName={session.activeMembership?.circleName}
      canCreate={
        !session.configured || session.activeMembership?.status === "active"
      }
    >
      <div className="page-shell">
        <MobileHeader
          title="Ask details"
          subtitle={`Visible to ${session.activeMembership?.circleName ?? "your private Circle"}`}
          backHref="/"
          actions={false}
        />
        <AskDetail
          ask={ask}
          viewerIsOwner={
            !session.configured || ask.createdById === session.profileId
          }
          canOffer={session.activeMembership?.status === "active"}
        />
      </div>
    </AppShell>
  );
}
