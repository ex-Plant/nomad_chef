"use client";

import {
  useConsentManager,
  useTranslations,
  type AllConsentNames,
} from "@c15t/nextjs";
import { FormDialog } from "@/components/shared/form-dialog";
import { Button } from "@/components/shared/button";
import { ConsentCheckbox } from "./consent-checkbox";

export function CookiePreferences() {
  const {
    activeUI,
    setActiveUI,
    saveConsents,
    selectedConsents,
    setSelectedConsent,
    consentCategories,
  } = useConsentManager();
  const t = useTranslations();

  return (
    <FormDialog
      isOpen={activeUI === "dialog"}
      onClose={() => setActiveUI("none")}
      title={t.consentManagerDialog.title ?? "Ustawienia prywatności"}
      description={t.consentManagerDialog.description}
    >
      <ul className="mb-6 flex flex-col gap-4">
        {consentCategories.map((cat: AllConsentNames) => {
          const isLocked = cat === "necessary";
          const meta = t.consentTypes[cat];
          return (
            <li key={cat}>
              <ConsentCheckbox
                id={`cookie-consent-${cat}`}
                checked={isLocked || !!selectedConsents[cat]}
                disabled={isLocked}
                onCheckedChange={(v) => setSelectedConsent(cat, v)}
                label={
                  <span className="flex flex-col gap-0.5">
                    <span className="font-medium text-white">
                      {meta?.title}
                    </span>
                    <span className="text-white/80">{meta?.description}</span>
                  </span>
                }
              />
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="yellow-solid"
          size="compact"
          className="w-full"
          onClick={() => saveConsents("custom")}
        >
          {t.common.save}
        </Button>
        <Button
          type="button"
          variant="white"
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
      </div>
    </FormDialog>
  );
}
