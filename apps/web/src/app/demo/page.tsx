import { AppShell, MobileHeader } from "@/components/app-shell";
import { DemoHome } from "@/components/demo-home";
import { currentCircle } from "@/lib/mock-data";
import { getCircleAsks } from "@/server/ask-queries";

export default async function DemoPage() {
  const asks = await getCircleAsks(null);
  return (
    <AppShell circleName="Paseos Community Sharing">
      <div className="page-shell">
        <MobileHeader
          title="Paseos Community Sharing"
          subtitle="Interactive preview"
        />
        <DemoHome
          displayName={currentCircle.memberName}
          asks={asks}
          previewNotice
        />
      </div>
    </AppShell>
  );
}
