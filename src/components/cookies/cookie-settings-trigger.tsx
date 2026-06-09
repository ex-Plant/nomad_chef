"use client";

import { Cookie } from "lucide-react";
import { useConsentManager } from "@c15t/nextjs";
import { cn } from "@/helpers/cn";

// Persistent way to reopen the preferences dialog after the first choice —
// nomad has no footer, so this lives as a discreet fixed link.
export function CookieSettingsTrigger() {
  const { setActiveUI } = useConsentManager();

  return (
    <button
      type="button"
      onClick={() => setActiveUI("dialog")}
      className={cn(
        "fixed bottom-4 left-4 z-[400] inline-flex items-center gap-1.5 rounded-full",
        "bg-off-black/70 font-geist px-3 py-1.5 text-xs tracking-wide text-white/80 uppercase backdrop-blur-sm",
        "hover:bg-off-black transition-colors duration-300 hover:text-white",
      )}
    >
      <Cookie aria-hidden className="size-3.5" />
      Ustawienia cookies
    </button>
  );
}
