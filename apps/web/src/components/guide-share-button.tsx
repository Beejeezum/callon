"use client";

import { useState } from "react";
import { Check, ShareNetwork } from "@phosphor-icons/react";
import { Button } from "./ui";

export function GuideShareButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function shareGuide() {
    const shareText =
      "A quick guide to Call On, the private Paseos sharing experiment.";

    if (navigator.share) {
      try {
        await navigator.share({
          title: "How Call On works",
          text: shareText,
          url,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
      }
    }

    await navigator.clipboard.writeText(`${shareText} ${url}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2400);
  }

  return (
    <Button type="button" variant="secondary" onClick={shareGuide}>
      {copied ? (
        <>
          <Check size={18} weight="bold" /> Guide link copied
        </>
      ) : (
        <>
          <ShareNetwork size={18} /> Share this guide
        </>
      )}
    </Button>
  );
}
