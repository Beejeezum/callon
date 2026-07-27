"use client";

import { WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="app-frame public">
      <main className="app-surface">
        <div className="page-shell">
          <div className="content narrow empty-state">
            <div
              className="empty-icon"
              style={{ color: "var(--red-600)", background: "var(--red-50)" }}
            >
              <WarningCircle size={34} />
            </div>
            <h1>Something did not load</h1>
            <p className="lede">
              Your action was not completed. Try again; if the problem
              continues, return to the previous screen.
            </p>
            <Button onClick={reset}>Try again</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
