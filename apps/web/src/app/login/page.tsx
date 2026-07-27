import { AppShell } from "@/components/app-shell";
import { AuthForm } from "@/components/auth-form";
export default function LoginPage() {
  return (
    <AppShell hideNav publicMode>
      <div className="page-shell">
        <AuthForm />
      </div>
    </AppShell>
  );
}
