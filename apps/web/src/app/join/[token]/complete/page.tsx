import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { JoinInvitation } from "@/components/join-invitation";
import { getCircleInvitePreview } from "@/server/circle-actions";

export default async function CompleteJoinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const preview = await getCircleInvitePreview(token);
  if (!preview) notFound();

  return (
    <AppShell hideNav publicMode>
      <div className="page-shell">
        <JoinInvitation
          token={token}
          circleName={preview.circleName}
          generalArea={preview.generalArea}
          description={preview.description}
        />
      </div>
    </AppShell>
  );
}
