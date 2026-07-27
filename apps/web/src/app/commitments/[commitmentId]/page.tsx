import { AppShell, MobileHeader } from "@/components/app-shell";
import { CommitmentChat } from "@/components/commitment-chat";
import { getCommitmentDetail } from "@/server/transaction-queries";
import { getSessionContext } from "@/server/session";
import { notFound } from "next/navigation";

export default async function CommitmentPage({
  params,
}: {
  params: Promise<{ commitmentId: string }>;
}) {
  const { commitmentId } = await params;
  const session = await getSessionContext();
  const commitment = await getCommitmentDetail(commitmentId, session.profileId);
  if (!commitment) notFound();
  return (
    <AppShell circleName={session.activeMembership?.circleName}>
      <div className="page-shell">
        <MobileHeader
          title="Private coordination"
          subtitle="Private conversation"
          backHref="/activity"
          actions={false}
        />
        <CommitmentChat commitment={commitment} />
      </div>
    </AppShell>
  );
}
