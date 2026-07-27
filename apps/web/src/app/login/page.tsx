import { AppShell } from "@/components/app-shell";
import { AuthForm } from "@/components/auth-form";
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
      <div className="page-shell">
        <AuthForm next={next} />
      </div>
    </AppShell>
  );
}
