import { renderEmailShell } from "../render-shell";
import type { EmailItemT } from "../constants";
import { escapeHtml } from "../escape-html";
import type { ContactContextT } from "@/types/contact";

type ContactMessageArgsT = {
  senderEmail: string;
  message: string;
  context?: ContactContextT;
  // Deep link to the related order in the Payload admin. Present only when the
  // help request is tied to an order the lookup could resolve.
  adminUrl?: string;
  omitLogo?: boolean;
};

const EMPTY_MESSAGE_FALLBACK = "(brak wiadomości)";

const CONTEXT_LABELS: Record<keyof ContactContextT, string> = {
  surface: "Sekcja",
  status: "Status",
  orderNumber: "Zamówienie",
  token: "Token",
};

export function generateContactMessageHtml(args: ContactMessageArgsT): string {
  const trimmed = args.message.trim();
  const body =
    trimmed.length > 0 ? escapeHtml(trimmed) : EMPTY_MESSAGE_FALLBACK;

  const items: EmailItemT[] = [
    { type: "text", content: "<strong>Wiadomość:</strong>" },
    { type: "text", content: body },
    {
      type: "text",
      content: `<strong>E-mail nadawcy:</strong> ${escapeHtml(args.senderEmail)}`,
    },
    ...buildContextItems(args.context),
  ];

  if (args.adminUrl) {
    items.push({
      type: "button",
      label: "Zobacz zamówienie",
      url: args.adminUrl,
    });
  }

  return renderEmailShell({
    title: "Wiadomość z formularza",
    items,
    // Operator-facing — lands in the chef's own inbox, so no brand logo or
    // footer; both are pointless on an email to yourself.
    omitLogo: true,
    omitFooter: true,
  });
}

// Renders the optional help-form context (which section the message came from,
// plus the order/token it relates to) as one labelled row per present field.
function buildContextItems(context?: ContactContextT): EmailItemT[] {
  if (!context) return [];

  return (Object.keys(CONTEXT_LABELS) as (keyof ContactContextT)[])
    .filter((key) => context[key])
    .map((key) => ({
      type: "text",
      content: `<strong>${CONTEXT_LABELS[key]}:</strong> ${escapeHtml(String(context[key]))}`,
    }));
}
