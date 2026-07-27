import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { AskWizard } from "@/components/ask-wizard";

export const metadata: Metadata = { title: "Create an Ask" };

export default function NewAskPage() {
  return (
    <AppShell hideNav>
      <div className="page-shell">
        <AskWizard />
      </div>
    </AppShell>
  );
}
