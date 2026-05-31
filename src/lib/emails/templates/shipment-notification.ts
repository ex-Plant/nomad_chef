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
    { type: "text", content: "Twoja książka jest w drodze." },
    {
      type: "text",
      content: `<strong>Numer przesyłki:</strong> ${escapeHtml(args.tracking)}`,
    },
    { type: "text", content: "Dziękujemy!" },
  ];

  return renderEmailShell({
    items,
    omitLogo: args.omitLogo,
  });
}
