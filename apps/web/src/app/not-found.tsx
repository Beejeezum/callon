import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { AppShell, MobileHeader } from "@/components/app-shell";
import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <AppShell publicMode hideNav>
      <div className="page-shell">
        <MobileHeader title="Call On" actions={false} />
        <div className="content narrow empty-state">
          <div className="empty-icon">
            <MagnifyingGlass size={34} />
          </div>
          <h1>That page is not available</h1>
          <p className="lede">
            The link may have expired, been revoked, or belonged to a private
            Circle you cannot access.
          </p>
          <ButtonLink href="/" full>
            Go to Call On
          </ButtonLink>
        </div>
      </div>
    </AppShell>
  );
}
