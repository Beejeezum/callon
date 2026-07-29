import { AppShell, MobileHeader } from "@/components/app-shell";
import { LoanTracker } from "@/components/loan-tracker";
import { getLoanDetail } from "@/server/transaction-queries";
import { getSessionContext } from "@/server/session";
import { formatPaseosDateTime } from "@/lib/paseos-time";
import { notFound } from "next/navigation";

export default async function LoanPage({
  params,
}: {
  params: Promise<{ loanId: string }>;
}) {
  const { loanId } = await params;
  const session = await getSessionContext();
  const loan = await getLoanDetail(loanId, session.profileId);
  if (!loan) notFound();
  return (
    <AppShell circleName={session.activeMembership?.circleName}>
      <div className="page-shell">
        <MobileHeader
          title="Loan custody"
          subtitle={
            loan.dueAt
              ? `Due ${formatPaseosDateTime(loan.dueAt, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                })}`
              : "Private custody record"
          }
          backHref="/activity"
          actions={false}
        />
        <LoanTracker loan={loan} />
      </div>
    </AppShell>
  );
}
