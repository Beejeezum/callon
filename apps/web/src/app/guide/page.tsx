import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { CallOnGuide } from "@/components/call-on-guide";
import { publicEnv } from "@/lib/public-env";
import { getSessionContext } from "@/server/session";

export const metadata: Metadata = {
  title: "How Call On works",
  description:
    "A one-minute guide to asking, sharing, and keeping neighborhood handoffs easy in Paseos.",
  openGraph: {
    title: "How Call On works in Paseos",
    description:
      "Ask before you buy. See how private Asks, neighbor Offers, and simple return tracking work.",
    images: [
      {
        url: "/assets/paseos-entrance.png",
        width: 543,
        height: 287,
        alt: "The Paseos neighborhood entrance",
      },
    ],
  },
};

export default async function GuidePage() {
  const session = await getSessionContext();
  const guideUrl = new URL("/guide", publicEnv.NEXT_PUBLIC_APP_URL).toString();

  return (
    <AppShell hideNav publicMode>
      <div className="page-shell public-landing-shell">
        <CallOnGuide previewMode={!session.configured} guideUrl={guideUrl} />
      </div>
    </AppShell>
  );
}
