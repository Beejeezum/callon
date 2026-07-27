import type { Metadata } from "next";
import { AppShell, MobileHeader } from "@/components/app-shell";
import { AskDetail } from "@/components/ask-detail";
import { getAsk } from "@/lib/mock-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ askId: string }>;
}): Promise<Metadata> {
  const { askId } = await params;
  const ask = getAsk(askId);
  return { title: ask.title };
}

export default async function AskPage({
  params,
}: {
  params: Promise<{ askId: string }>;
}) {
  const { askId } = await params;
  const ask = getAsk(askId);
  return (
    <AppShell>
      <div className="page-shell">
        <MobileHeader
          title="Ask details"
          subtitle="Visible to Oakridge HOA"
          backHref="/"
          actions={false}
        />
        <AskDetail ask={ask} />
      </div>
    </AppShell>
  );
}
