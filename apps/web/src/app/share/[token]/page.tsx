import type { Metadata } from "next";
import { AppShell, MobileHeader } from "@/components/app-shell";
import { PublicAsk } from "@/components/public-ask";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Help with a birthday party",
    description: "Oakridge neighbors: two items are still needed for Saturday.",
    openGraph: {
      title: "Hosting a birthday party 🎉",
      description: "3 of 4 needs covered. Can you help?",
      images: ["/assets/birthday-party.jpg"],
    },
  };
}

export default function SharedAskPage() {
  return (
    <AppShell hideNav publicMode>
      <div className="page-shell">
        <MobileHeader
          title="Shared Ask"
          subtitle="Oakridge HOA"
          actions={false}
        />
        <PublicAsk />
      </div>
    </AppShell>
  );
}
