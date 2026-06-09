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
        "bg-off-black/70 px-3 py-1.5 font-geist text-xs uppercase tracking-wide text-white/80 backdrop-blur-sm",
        "transition-colors duration-300 hover:bg-off-black hover:text-white",
      )}
    >
      <Cookie aria-hidden className="size-3.5" />
      Ustawienia cookies
    </button>
  );
}
