import { AppShell } from "@/components/app-shell";
import { AuthForm } from "@/components/auth-form";
import Image from "next/image";
import Link from "next/link";
import { pilotCommunity } from "@/lib/pilot";
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next =
    params.next?.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/";
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
            <div className="eyebrow">Private to Paseos</div>
            <strong>{pilotCommunity.attribution}</strong>
          </div>
        </div>
        <AuthForm next={next} />
        <p className="help-text auth-help">
          Not a member yet? Open the private Paseos invitation from WhatsApp or{" "}
          <Link href="/">read how this works</Link>.
        </p>
      </div>
    </AppShell>
  );
}
