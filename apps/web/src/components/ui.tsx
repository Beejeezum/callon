import Image from "next/image";
import Link from "next/link";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { Check, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

export function Button({
  children,
  variant = "primary",
  full = false,
  small = false,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "neutral" | "danger" | "violet";
  full?: boolean;
  small?: boolean;
}) {
  return (
    <button
      className={cn(
        "button",
        variant !== "primary" && variant,
        full && "full",
        small && "small",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  full = false,
  small = false,
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "neutral" | "danger" | "violet";
  full?: boolean;
  small?: boolean;
  className?: string;
}) {
  return (
    <Link
      className={cn(
        "button",
        variant !== "primary" && variant,
        full && "full",
        small && "small",
        className,
      )}
      href={href}
    >
      {children}
    </Link>
  );
}

export function Card({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={cn("card", className)} {...props}>
      {children}
    </div>
  );
}

export function Chip({
  children,
  selected = false,
  tone,
}: {
  children: ReactNode;
  selected?: boolean;
  tone?: "green" | "violet" | "amber" | "red";
}) {
  return (
    <span className={cn("chip", tone)} data-selected={selected}>
      {children}
    </span>
  );
}

export function Badge({
  children,
  tone = "need",
}: {
  children: ReactNode;
  tone?: "need" | "offer" | "event" | "active";
}) {
  return <span className={cn("badge", tone)}>{children}</span>;
}

export function Progress({
  value,
  tone = "green",
  label,
}: {
  value: number;
  tone?: "green" | "violet";
  label?: string;
}) {
  return (
    <div>
      {label ? (
        <div className="row-between tiny muted" style={{ marginBottom: 6 }}>
          <span>{label}</span>
          <span>{Math.round(value)}%</span>
        </div>
      ) : null}
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn("progress-bar", tone === "violet" && "violet")}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

export function Avatar({
  src,
  name,
  size = "md",
}: {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  if (src)
    return (
      <Image
        className={cn("avatar", size !== "md" && size)}
        src={src}
        alt=""
        width={size === "lg" ? 64 : size === "sm" ? 28 : 34}
        height={size === "lg" ? 64 : size === "sm" ? 28 : 34}
      />
    );
  return (
    <span
      className={cn("avatar", "avatar-fallback", size !== "md" && size)}
      aria-label={name}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function PrivacyCallout({ children }: { children: ReactNode }) {
  return (
    <div className="privacy-callout">
      <ShieldCheck size={22} weight="duotone" aria-hidden />{" "}
      <span>{children}</span>
    </div>
  );
}

export function CheckCircle({ done }: { done: boolean }) {
  return (
    <span className={cn("check-circle", done && "done")}>
      {done ? <Check size={13} weight="bold" aria-hidden /> : null}
    </span>
  );
}
