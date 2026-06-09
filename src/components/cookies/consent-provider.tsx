"use client";

import type { ReactNode } from "react";
import {
  ConsentManagerProvider,
  policyPackPresets,
  type AllConsentNames,
} from "@c15t/nextjs";
import { baseTranslations } from "@c15t/translations/all";
import { CookieBanner } from "./cookie-banner";
import { CookiePreferences } from "./cookie-preferences";

// Polish-only site: no locale detection, no /en branch. The three trackers we
// gate (Meta Pixel, Vercel Analytics, Speed Insights) are all "measurement";
// the site sets no "functionality" cookies, so we expose two categories only.
const CONSENT_CATEGORIES = ["necessary", "measurement"] as AllConsentNames[];

const OPTIONS = {
  mode: "offline" as const,
  consentCategories: CONSENT_CATEGORIES,
  offlinePolicy: {
    policyPacks: [policyPackPresets.europeOptIn()],
  },
  overrides: { country: "PL" },
  i18n: {
    locale: "pl",
    detectBrowserLanguage: false,
    messages: {
      pl: {
        ...baseTranslations.pl,
        cookieBanner: {
          ...baseTranslations.pl.cookieBanner,
          description:
            'Używamy plików cookie do analizy ruchu. Możesz zmienić wybór klikając „Dostosuj” lub w każdej chwili przez link „Ustawienia cookies” na dole strony.',
        },
      },
    },
  },
};

export function ConsentProvider({ children }: { children: ReactNode }) {
  return (
    <ConsentManagerProvider options={OPTIONS}>
      <CookieBanner />
      <CookiePreferences />
      {children}
    </ConsentManagerProvider>
  );
}
