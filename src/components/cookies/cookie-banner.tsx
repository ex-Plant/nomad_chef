"use client";

import { useConsentManager, useTranslations } from "@c15t/nextjs";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/shared/button";
import { Starburst } from "@/components/shared/starburst";

const TITLE_ID = "cookie-banner-title";
const DESC_ID = "cookie-banner-description";

export function CookieBanner() {
  const { activeUI, setActiveUI, saveConsents } = useConsentManager();
  const t = useTranslations();

  const isOpen = activeUI === "banner";

  return (
    <Dialog
      isOpen={isOpen}
      // Non-dismissible: the visitor must make a choice. No-op close ignores
      // Escape and backdrop clicks; there is intentionally no close button.
      onClose={() => {}}
      variant="modal"
      ariaLabelledBy={TITLE_ID}
      ariaDescribedBy={DESC_ID}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-coral ring-yellow relative w-full max-w-md overflow-clip rounded-lg ring-2"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-8 -right-12 z-0 flex items-center justify-center"
        >
          <Starburst color="pink" variant="organic" size="md" />
        </div>

        <div className="relative z-10 p-6 md:p-8">
          <h2
            id={TITLE_ID}
            className="font-display text-electric-blue mb-4 text-2xl uppercase"
          >
            {t.cookieBanner.title}
          </h2>
          <p
            id={DESC_ID}
            className="mb-6 font-sans text-sm leading-relaxed text-white/90"
          >
            {t.cookieBanner.description}
          </p>

          <div className="flex flex-col gap-3">
            <Button
              type="button"
              variant="yellow-solid"
              size="compact"
              className="w-full"
              onClick={() => saveConsents("all")}
            >
              {t.common.acceptAll}
            </Button>
            <Button
              type="button"
              variant="white"
              size="compact"
              className="w-full"
              onClick={() => saveConsents("necessary")}
            >
              {t.common.rejectAll}
            </Button>
            <Button
              type="button"
              variant="white"
              size="compact"
              className="w-full"
              onClick={() => setActiveUI("dialog")}
            >
              {t.common.customize}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
