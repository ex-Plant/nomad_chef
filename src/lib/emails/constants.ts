import { ENV } from "@/config/env";

// Locked palette from CLAUDE.md. Email-safe subset: off-black text on the
// recipient client's default bg (we don't set body/card bg — keeps the email
// neutral across Gmail, Apple Mail, Outlook). Coral for CTAs, warm taupe for
// footer.
export const EMAIL_COLORS = {
  coral: "#DE6445",
  blue: "#193EF4",
  // Off-black for all primary text. Matches CLAUDE.md locked value.
  text: "#1A1614",
  textOnDark: "#FFFFFF",
  // Warm taupe instead of neutral gray — keeps footer in the warm family.
  muted: "#5A4E47",
} as const;

// Single source of truth for vertical rhythm and type size. Blocks are spaced
// with bottom-margin only (no top margins), so the gap between any two
// consecutive blocks is exactly one value. `logoGap` is the deliberately
// tighter space above the trailing logo.
export const EMAIL_LAYOUT = {
  fontSize: "16px",
  gap: "16px",
  logoGap: "8px",
} as const;

export function getLogoUrl(): string {
  return `${ENV.SITE_URL}/email/logo.png`;
}

export type EmailItemT =
  | { type: "text"; content: string; bold?: boolean; marginBottom?: string }
  | { type: "button"; label: string; url: string }
  | { type: "raw"; html: string };
