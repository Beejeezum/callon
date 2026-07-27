import { AppShell, MobileHeader } from "@/components/app-shell";
import { LoanTracker } from "@/components/loan-tracker";

export default function LoanPage() {
  return (
    <AppShell>
      <div className="page-shell">
        <MobileHeader
          title="My loan"
          subtitle="Due Sunday at 6 PM"
          backHref="/activity"
          actions={false}
        />
        <LoanTracker />
      </div>
    </AppShell>
  );
}
