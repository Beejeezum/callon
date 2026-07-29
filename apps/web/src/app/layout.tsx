import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Paseos Community Sharing",
    template: "%s · Paseos Community Sharing",
  },
  description:
    "A private, neighbor-built way for Paseos residents to ask, share useful things, and keep handoffs and returns easy.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
      process.env.DEPLOY_PRIME_URL ||
      "http://localhost:3000",
  ),
  applicationName: "Paseos Community Sharing",
  icons: {
    icon: [
      {
        url: "/assets/call-on-favicon.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/assets/call-on-favicon.svg",
    apple: [
      {
        url: "/assets/call-on-logo-mark.png",
        sizes: "128x128",
        type: "image/png",
      },
    ],
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#16843f",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
