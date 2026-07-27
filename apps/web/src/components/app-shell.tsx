"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  ChatCircle,
  CirclesThreePlus,
  House,
  ListChecks,
  Plus,
  UserCircle,
} from "@phosphor-icons/react";
import { isSupabaseConfigured } from "@/lib/public-env";

const nav = [
  { href: "/", label: "Home", icon: House },
  { href: "/activity", label: "Asks", icon: ListChecks },
  { href: "/asks/new", label: "Create", icon: Plus, create: true },
  { href: "/inbox", label: "Inbox", icon: ChatCircle },
  { href: "/profile", label: "Me", icon: UserCircle },
];

function matches(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function AppShell({
  children,
  hideNav = false,
  publicMode = false,
  circleName = "Your private Circle",
  canCreate = true,
}: {
  children: ReactNode;
  hideNav?: boolean;
  publicMode?: boolean;
  circleName?: string;
  canCreate?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className={`app-frame ${publicMode ? "public" : ""}`}>
      {!publicMode ? (
        <aside className="desktop-rail" aria-label="Primary">
          <Link href="/" className="brand-lockup">
            <Image
              className="brand-mark"
              src="/assets/call-on-logo-mark.svg"
              alt=""
              width={42}
              height={42}
              priority
            />
            <span className="brand-name">Call On</span>
          </Link>
          <p className="brand-tagline">
            Things we have. Neighbors we trust. Real projects made easier.
          </p>
          <nav className="rail-nav">
            <Link
              className="rail-link"
              href="/"
              data-active={matches(pathname, "/")}
            >
              <House size={20} weight="duotone" /> Home
            </Link>
            <Link
              className="rail-link"
              href="/activity"
              data-active={matches(pathname, "/activity")}
            >
              <ListChecks size={20} weight="duotone" /> My activity
            </Link>
            {canCreate ? (
              <Link
                className="rail-link"
                href="/asks/new"
                data-active={matches(pathname, "/asks/new")}
              >
                <CirclesThreePlus size={20} weight="duotone" /> Create an Ask
              </Link>
            ) : null}
            <Link
              className="rail-link"
              href="/inbox"
              data-active={matches(pathname, "/inbox")}
            >
              <ChatCircle size={20} weight="duotone" /> Inbox
            </Link>
            <Link
              className="rail-link"
              href="/profile"
              data-active={matches(pathname, "/profile")}
            >
              <UserCircle size={20} weight="duotone" /> Profile
            </Link>
          </nav>
          <div className="rail-footer">
            <strong>{circleName}</strong>
            <br />
            Private pilot ·{" "}
            {isSupabaseConfigured ? "Live data" : "Preview mode"}
            <br />
            Exact pickup details stay private until an offer is accepted.
          </div>
        </aside>
      ) : null}
      <main className="app-surface">
        {children}
        {!hideNav ? (
          <nav
            className="bottom-nav mobile-only"
            aria-label="Primary mobile navigation"
          >
            {nav
              .filter((item) => canCreate || !item.create)
              .map(({ href, label, icon: Icon, create }) => (
                <Link
                  className="bottom-link"
                  href={href}
                  key={href}
                  data-active={matches(pathname, href)}
                  aria-label={label}
                >
                  {create ? (
                    <span className="bottom-create">
                      <Icon size={25} weight="bold" />
                    </span>
                  ) : (
                    <Icon
                      size={21}
                      weight={matches(pathname, href) ? "fill" : "regular"}
                    />
                  )}
                  {!create ? (
                    <span>{label}</span>
                  ) : (
                    <span className="sr-only">{label}</span>
                  )}
                </Link>
              ))}
          </nav>
        ) : null}
      </main>
    </div>
  );
}

export function MobileHeader({
  title,
  subtitle,
  backHref,
  actions = true,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  actions?: boolean;
}) {
  return (
    <header className="mobile-header">
      <div className="mobile-header-main">
        {backHref ? (
          <Link
            className="icon-button plain"
            href={backHref}
            aria-label="Go back"
          >
            <ArrowLeft size={21} />
          </Link>
        ) : (
          <AvatarCircle />
        )}
        <div style={{ minWidth: 0 }}>
          <div className="header-title">{title}</div>
          {subtitle ? <div className="header-subtitle">{subtitle}</div> : null}
        </div>
      </div>
      {actions ? (
        <Link
          className="icon-button"
          href="/inbox"
          aria-label="Notifications"
          style={{ position: "relative" }}
        >
          <Bell size={20} />
          <span className="notification-dot" aria-hidden />
        </Link>
      ) : (
        <span />
      )}
    </header>
  );
}

function AvatarCircle() {
  return (
    <span className="circle-avatar" aria-hidden>
      <UserCircle size={28} weight="duotone" />
    </span>
  );
}
