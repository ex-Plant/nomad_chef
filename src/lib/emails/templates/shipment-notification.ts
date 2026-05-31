import { renderEmailShell } from "../render-shell";
import type { EmailItemT } from "../constants";
import { escapeHtml, buildGreeting } from "../escape-html";

type ShipmentNotificationArgsT = {
  customerFirstName?: string | null;
  tracking: string;
  omitLogo?: boolean;
};

export function generateShipmentNotificationHtml(
  args: ShipmentNotificationArgsT,
): string {
  const items: EmailItemT[] = [
    { type: "text", content: buildGreeting(args.customerFirstName) },
    { type: "text", content: "Wysłaliśmy Twoją książkę." },
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
