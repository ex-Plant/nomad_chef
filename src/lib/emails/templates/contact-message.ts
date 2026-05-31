import { renderEmailShell } from "../render-shell";
import type { EmailItemT } from "../constants";
import { escapeHtml } from "../escape-html";

type ContactMessageArgsT = {
  senderEmail: string;
  message: string;
  omitLogo?: boolean;
};

const EMPTY_MESSAGE_FALLBACK = "(brak wiadomości)";

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
  ];

  return renderEmailShell({
    title: "Wiadomość z formularza",
    items,
    omitLogo: args.omitLogo,
    // Operator-facing — the message lands in the chef's own inbox, so the
    // "Marta Leśniewska / Chaos Kitchen" brand footer is pointless here.
    omitFooter: true,
  });
}
