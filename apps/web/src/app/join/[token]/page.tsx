import { AppShell } from "@/components/app-shell";
import { AuthForm } from "@/components/auth-form";
export default function JoinPage() {
  return (
    <AppShell hideNav publicMode>
      <div className="page-shell">
        <AuthForm join />
      </div>
    </AppShell>
  );
}
