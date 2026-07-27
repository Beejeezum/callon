import { AppShell } from "@/components/app-shell";
import { AuthForm } from "@/components/auth-form";
import { getCircleInvitePreview } from "@/server/circle-actions";
import { notFound } from "next/navigation";
export default async function JoinPage({
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
        <AuthForm
          join
          next={`/join/${token}/complete`}
          circleName={preview.circleName}
        />
      </div>
    </AppShell>
  );
}
