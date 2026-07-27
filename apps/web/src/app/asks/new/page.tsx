import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { AskWizard } from "@/components/ask-wizard";
import { getSessionContext } from "@/server/session";
import { redirect } from "next/navigation";
import { getAskTimeDefaults } from "@/server/time-defaults";

export const metadata: Metadata = { title: "Create an Ask" };

export default async function NewAskPage() {
  const session = await getSessionContext();
  if (
    session.configured &&
    (!session.activeMembership || session.activeMembership.status !== "active")
  ) {
    redirect("/");
  }
  const timeDefaults = getAskTimeDefaults();
  return (
    <AppShell hideNav circleName={session.activeMembership?.circleName}>
      <div className="page-shell">
        <AskWizard
          circleId={
            session.activeMembership?.circleId ??
            "b0b08438-1234-4a2d-9ea2-2a88f3f47001"
          }
          {...timeDefaults}
        />
      </div>
    </AppShell>
  );
}
