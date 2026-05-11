// Locked palette from CLAUDE.md. Email-safe subset: warm-white body + matching
// inner card (uniform warm canvas, matches the site), off-black text, coral CTA
// — no full color-blocked sections (renders unpredictably in Outlook + older
// Gmail clients).
export const EMAIL_COLORS = {
  coral: "#DE6445",
  blue: "#193EF4",
  warmWhite: "#F5EEE5",
  // Inner card matches body so the warm tone reads edge-to-edge in clients
  // that render body bg (Gmail web, Apple Mail). In Outlook (no body bg), the
  // inner div still renders a warm rectangle on white — also acceptable.
  card: "#F5EEE5",
  // Off-black for all primary text. Matches CLAUDE.md locked value.
  text: "#1A1614",
  textOnDark: "#FFFFFF",
  // Warm taupe instead of neutral gray — keeps footer in the warm family.
  muted: "#5A4E47",
} as const;

const PROD_FALLBACK_SITE_URL = "https://nomadchef.pl";
const DEV_FALLBACK_SITE_URL = "http://localhost:3000";

export function getLogoUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === "development"
      ? DEV_FALLBACK_SITE_URL
      : PROD_FALLBACK_SITE_URL);
  return `${base}/email/logo.png`;
}

export type EmailItemT =
  | { type: "text"; content: string; bold?: boolean; marginBottom?: string }
  | { type: "button"; label: string; url: string }
  | { type: "raw"; html: string };
