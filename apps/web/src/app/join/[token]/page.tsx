import { AppShell } from "@/components/app-shell";
import { AuthForm } from "@/components/auth-form";
import { getCircleInvitePreview } from "@/server/circle-actions";
import { notFound } from "next/navigation";
import Image from "next/image";
import { isSupabaseConfigured } from "@/lib/public-env";
import { pilotCommunity } from "@/lib/pilot";
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
      <div className="page-shell join-shell">
        <div className="join-brand">
          <Image
            src="/assets/paseos-entrance.png"
            alt="The Paseos neighborhood entrance"
            width={543}
            height={287}
            priority
          />
          <div>
            <div className="eyebrow">Neighbor-built for Paseos</div>
            <strong>{pilotCommunity.attribution}</strong>
          </div>
        </div>
        <AuthForm
          join
          next={isSupabaseConfigured ? "/" : "/demo"}
          circleName={preview.circleName}
          circleArea={preview.generalArea}
          inviteToken={token}
        />
      </div>
    </AppShell>
  );
}
