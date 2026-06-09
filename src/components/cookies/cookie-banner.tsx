"use client";

import { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { useConsentManager, useTranslations } from "@c15t/nextjs";
import { Button } from "@/components/shared/button";

// Hold the banner back so it doesn't fight the hero intro for attention.
const SHOW_DELAY_MS = 5000;
const TITLE_ID = "cookie-banner-title";
const DESC_ID = "cookie-banner-description";

export function CookieBanner() {
  const { activeUI, setActiveUI, saveConsents } = useConsentManager();
  const t = useTranslations();
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setArmed(true), SHOW_DELAY_MS);
    return () => clearTimeout(id);
  }, []);

  // activeUI is only "banner" when no choice is stored yet, so returning
  // visitors who already chose never see this.
  const isOpen = armed && activeUI === "banner";

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          role="dialog"
          aria-labelledby={TITLE_ID}
          aria-describedby={DESC_ID}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-coral ring-yellow fixed inset-x-3 bottom-3 z-[700] mx-auto max-w-sm rounded-lg p-4 ring-2 sm:max-w-md sm:p-5"
        >
          <h2
            id={TITLE_ID}
            className="font-display text-electric-blue text-base uppercase"
          >
            {t.cookieBanner.title}
          </h2>
          <p
            id={DESC_ID}
            className="mt-1.5 font-sans text-xs leading-snug text-white/90"
          >
            {t.cookieBanner.description}
          </p>

          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="yellow-solid"
              size="compact"
              className="px-3 py-1.5 text-xs whitespace-nowrap"
              onClick={() => saveConsents("all")}
            >
              Akceptuj
            </Button>
            <Button
              type="button"
              variant="white"
              size="compact"
              className="px-3 py-1.5 text-xs whitespace-nowrap"
              onClick={() => saveConsents("necessary")}
            >
              Odrzuć
            </Button>
            <Button
              type="button"
              variant="white"
              size="compact"
              className="px-3 py-1.5 text-xs whitespace-nowrap"
              onClick={() => setActiveUI("dialog")}
            >
              Dostosuj
            </Button>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
