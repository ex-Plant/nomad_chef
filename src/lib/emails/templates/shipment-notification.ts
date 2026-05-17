import { renderEmailShell } from "../render-shell";
import type { EmailItemT } from "../constants";

type ShipmentNotificationArgsT = {
  customerFirstName?: string | null;
  courier: string;
  tracking: string;
  omitLogo?: boolean;
};

export function generateShipmentNotificationHtml(
  args: ShipmentNotificationArgsT,
): string {
  const greeting = args.customerFirstName
    ? `Cześć ${escapeHtml(args.customerFirstName)},`
    : "Cześć,";

  const items: EmailItemT[] = [
    { type: "text", content: greeting },
    { type: "text", content: "Wysłaliśmy Twoją książkę." },
    {
      type: "text",
      content: `<strong>Kurier:</strong> ${escapeHtml(args.courier)}`,
    },
    {
      type: "text",
      content: `<strong>Numer przesyłki:</strong> ${escapeHtml(args.tracking)}`,
    },
    { type: "text", content: "Dziękujemy!" },
  ];

  return renderEmailShell({
    title: "Twoja książka jest w drodze",
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
