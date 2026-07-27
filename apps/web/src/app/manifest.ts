import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Call On",
    short_name: "Call On",
    description:
      "Ask for what you need and coordinate private neighborhood help.",
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
