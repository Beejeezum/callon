import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Paseos Community Sharing",
    short_name: "Paseos",
    description:
      "A private, neighbor-built place for Paseos residents to ask, share, and keep handoffs easy.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f6f0",
    theme_color: "#16843f",
    icons: [
      {
        src: "/assets/call-on-logo-mark.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
