"use client";

import { Cookie } from "lucide-react";
import { useConsentManager } from "@c15t/nextjs";
import { cn } from "@/helpers/cn";

// Inline link (lives in the contact footer) to reopen the preferences dialog
// after the first choice.
export function CookieSettingsTrigger({ className }: { className?: string }) {
  const { setActiveUI } = useConsentManager();

  return (
    <button
      type="button"
      onClick={() => setActiveUI("dialog")}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 transition-opacity hover:opacity-70",
        className,
      )}
    >
      <Cookie aria-hidden className="size-3.5 shrink-0" />
      Cookies
    </button>
  );
}
