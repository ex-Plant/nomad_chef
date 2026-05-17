import { renderEmailShell } from "../render-shell";
import type { EmailItemT } from "../constants";

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
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
